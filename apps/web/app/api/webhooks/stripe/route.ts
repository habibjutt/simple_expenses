import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { STRIPE_PRICE_TO_PLAN, getPlanDisplayName, type EffectivePlan } from "@/lib/plans";
import {
  sendTrialStartedEmail,
  sendSubscriptionActivatedEmail,
  sendSubscriptionCancelledEmail,
  sendSubscriptionRenewedEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";

async function getUserIdByCustomerId(customerId: string): Promise<string | null> {
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return user?.id ?? null;
}

async function getUserByCustomerId(customerId: string) {
  return db.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true, name: true },
  });
}

async function getUserById(userId: string) {
  return db.user.findFirst({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
}

/** Resolves the planTier from the first price item on a subscription */
function resolvePlanTier(subscription: Stripe.Subscription): EffectivePlan {
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
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);

        // Send trial started or subscription activated email
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer : subscription.customer.id;
        const userId = subscription.metadata?.userId ?? (await getUserIdByCustomerId(customerId));
        const user = userId ? await getUserById(userId) : await getUserByCustomerId(customerId);
        if (user?.email) {
          if (subscription.status === "trialing" && subscription.trial_end) {
            await sendTrialStartedEmail({
              to: user.email,
              name: user.name || "there",
              trialEndsAt: new Date(subscription.trial_end * 1000),
            });
          } else if (subscription.status === "active") {
            const planTier = resolvePlanTier(subscription);
            await sendSubscriptionActivatedEmail({
              to: user.email,
              name: user.name || "there",
              planName: getPlanDisplayName(planTier),
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const previousAttributes = (event.data as Stripe.Event.Data).previous_attributes as Record<string, unknown> | undefined;
        await syncSubscription(subscription);

        // Send activation email when transitioning from trialing → active
        const prevStatus = previousAttributes?.status as string | undefined;
        if (prevStatus === "trialing" && subscription.status === "active") {
          const customerId = typeof subscription.customer === "string"
            ? subscription.customer : subscription.customer.id;
          const user = await getUserByCustomerId(customerId);
          if (user?.email) {
            const planTier = resolvePlanTier(subscription);
            await sendSubscriptionActivatedEmail({
              to: user.email,
              name: user.name || "there",
              planName: getPlanDisplayName(planTier),
            });
          }
        }
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

        // Fetch user for email before updating
        const user = userId ? await getUserById(userId) : await getUserByCustomerId(customerId);

        if (userId) {
          await db.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: null,
              subscriptionStatus: "canceled",
            },
          });
        }

        if (user?.email) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawPeriodEnd = (subscription as any).current_period_end as number | undefined;
          await sendSubscriptionCancelledEmail({
            to: user.email,
            name: user.name || "there",
            endsAt: rawPeriodEnd ? new Date(rawPeriodEnd * 1000) : null,
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

      case "invoice.payment_succeeded": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        // Only send renewal emails for recurring payments (not first checkout)
        if (invoice.billing_reason === "subscription_cycle" && invoice.customer) {
          const customerId = typeof invoice.customer === "string"
            ? invoice.customer : invoice.customer.id;
          const user = await getUserByCustomerId(customerId);
          const subId = invoice.subscription as string | undefined;
          if (user?.email && subId) {
            const subscription = await getStripe().subscriptions.retrieve(subId);
            const planTier = resolvePlanTier(subscription);
            const rawPeriodEnd = (subscription as any).current_period_end as number | undefined;
            await sendSubscriptionRenewedEmail({
              to: user.email,
              name: user.name || "there",
              planName: getPlanDisplayName(planTier),
              nextBillingDate: rawPeriodEnd ? new Date(rawPeriodEnd * 1000) : null,
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        if (invoice.customer) {
          const customerId = typeof invoice.customer === "string"
            ? invoice.customer : invoice.customer.id;
          const user = await getUserByCustomerId(customerId);
          if (user?.email) {
            await sendPaymentFailedEmail({
              to: user.email,
              name: user.name || "there",
            });
          }
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
