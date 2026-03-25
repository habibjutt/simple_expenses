import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { STRIPE_PRICE_TO_PLAN } from "@/lib/plans";

async function getUserIdByCustomerId(customerId: string): Promise<string | null> {
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return user?.id ?? null;
}

/** Resolves the planTier from the first price item on a subscription */
function resolvePlanTier(subscription: Stripe.Subscription): string {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  return (priceId && STRIPE_PRICE_TO_PLAN[priceId]) ? STRIPE_PRICE_TO_PLAN[priceId] : "pro";
}

async function syncSubscription(subscription: Stripe.Subscription, overrideUserId?: string) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const userId =
    overrideUserId ??
    subscription.metadata?.userId ??
    (await getUserIdByCustomerId(customerId));

  if (!userId) return;

  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null;

  // current_period_end lives at the subscription level in all supported API versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawPeriodEnd = (subscription as any).current_period_end as number | undefined;
  const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000) : null;

  const planTier = resolvePlanTier(subscription);

  await db.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: periodEnd,
      planTier,
      ...(trialEnd ? { trialEndsAt: trialEnd } : {}),
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        const userId =
          subscription.metadata?.userId ?? (await getUserIdByCustomerId(customerId));

        if (userId) {
          await db.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: null,
              subscriptionStatus: "canceled",
            },
          });
        }
        break;
      }

      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode === "subscription" && checkoutSession.subscription) {
          const subscription = await getStripe().subscriptions.retrieve(
            checkoutSession.subscription as string
          );
          await syncSubscription(subscription, checkoutSession.metadata?.userId);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
