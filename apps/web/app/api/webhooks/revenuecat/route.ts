import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

// RevenueCat webhook event types
// https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
type RevenueCatEventType =
  | "INITIAL_PURCHASE"
  | "RENEWAL"
  | "CANCELLATION"
  | "UNCANCELLATION"
  | "EXPIRATION"
  | "PRODUCT_CHANGE"
  | "BILLING_ISSUE_DETECTED"
  | "SUBSCRIBER_ALIAS"
  | "TRANSFER"
  | "NON_RENEWING_PURCHASE"
  | "SUBSCRIPTION_PAUSED"
  | "SUBSCRIPTION_EXTENDED"
  | "TEST";

interface RevenueCatEvent {
  type: RevenueCatEventType;
  app_user_id: string;
  original_app_user_id: string;
  product_id: string;
  entitlement_ids: string[] | null;
  period_type: "TRIAL" | "INTRO" | "NORMAL";
  purchased_at_ms: number;
  expiration_at_ms: number | null;
  store: "APP_STORE" | "PLAY_STORE" | "STRIPE" | "PROMOTIONAL" | "RC_BILLING";
  environment: "SANDBOX" | "PRODUCTION";
  is_family_share?: boolean;
  currency?: string;
  price_in_purchased_currency?: number;
  cancel_reason?:
    | "UNSUBSCRIBE"
    | "BILLING_ERROR"
    | "DEVELOPER_INITIATED"
    | "PRICE_INCREASE"
    | "CUSTOMER_SUPPORT"
    | "UNKNOWN";
}

interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatEvent;
}

// Maps RevenueCat entitlement IDs to our plan tiers
const ENTITLEMENT_TO_PLAN: Record<string, string> = {
  "Simple Expenses Pro": "pro",
  pro: "pro",
  premium: "premium",
};

function resolveProvider(store: RevenueCatEvent["store"]): string {
  switch (store) {
    case "APP_STORE":
      return "apple";
    case "PLAY_STORE":
      return "google";
    case "STRIPE":
      return "stripe";
    default:
      return "apple";
  }
}

function resolvePlanTier(entitlementIds: string[] | null): string {
  if (!entitlementIds || entitlementIds.length === 0) return "pro";

  // Check entitlements in priority order (premium > pro)
  for (const id of entitlementIds) {
    if (ENTITLEMENT_TO_PLAN[id] === "premium") return "premium";
  }
  for (const id of entitlementIds) {
    if (ENTITLEMENT_TO_PLAN[id]) return ENTITLEMENT_TO_PLAN[id];
  }

  return "pro";
}

export async function POST(req: NextRequest) {
  // Verify webhook authorization
  const authHeader = req.headers.get("authorization");
  const expectedSecret = env.REVENUECAT_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error("RevenueCat webhook: REVENUECAT_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 },
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  let payload: RevenueCatWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { event } = payload;

  // Use app_user_id which we set to our backend user.id
  const userId = event.app_user_id;

  // Skip anonymous RevenueCat users (prefixed with $RCAnonymousID)
  if (!userId || userId.startsWith("$RCAnonymousID")) {
    return NextResponse.json({ received: true });
  }

  // Verify user exists
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    console.warn(`RevenueCat webhook: user ${userId} not found`);
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "TEST": {
        console.log("RevenueCat test webhook received");
        break;
      }

      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "UNCANCELLATION":
      case "SUBSCRIPTION_EXTENDED":
      case "NON_RENEWING_PURCHASE": {
        const planTier = resolvePlanTier(event.entitlement_ids);
        const provider = resolveProvider(event.store);
        const expiresAt = event.expiration_at_ms
          ? new Date(event.expiration_at_ms)
          : null;

        await db.user.update({
          where: { id: userId },
          data: {
            planTier,
            subscriptionStatus: event.period_type === "TRIAL" ? "trialing" : "active",
            subscriptionProvider: provider,
            currentPeriodEnd: expiresAt,
          },
        });
        break;
      }

      case "CANCELLATION": {
        // User canceled but may still have access until period end
        const planTier = resolvePlanTier(event.entitlement_ids);
        const provider = resolveProvider(event.store);
        const expiresAt = event.expiration_at_ms
          ? new Date(event.expiration_at_ms)
          : null;
        const now = new Date();

        if (expiresAt && expiresAt > now) {
          // Still has access until expiration — preserve plan tier
          await db.user.update({
            where: { id: userId },
            data: {
              planTier,
              subscriptionStatus: "active",
              subscriptionProvider: provider,
              currentPeriodEnd: expiresAt,
            },
          });
        } else {
          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: "canceled",
              planTier: "free",
              subscriptionProvider: null,
              currentPeriodEnd: expiresAt,
            },
          });
        }
        break;
      }

      case "EXPIRATION": {
        await db.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "canceled",
            planTier: "free",
            subscriptionProvider: null,
          },
        });
        break;
      }

      case "PRODUCT_CHANGE": {
        const planTier = resolvePlanTier(event.entitlement_ids);
        const provider = resolveProvider(event.store);
        const expiresAt = event.expiration_at_ms
          ? new Date(event.expiration_at_ms)
          : null;

        await db.user.update({
          where: { id: userId },
          data: {
            planTier,
            subscriptionStatus: "active",
            subscriptionProvider: provider,
            currentPeriodEnd: expiresAt,
          },
        });
        break;
      }

      case "BILLING_ISSUE_DETECTED": {
        await db.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "past_due",
          },
        });
        break;
      }

      case "SUBSCRIPTION_PAUSED": {
        await db.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "canceled",
            planTier: "free",
            subscriptionProvider: null,
          },
        });
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }
  } catch (err) {
    console.error("RevenueCat webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
