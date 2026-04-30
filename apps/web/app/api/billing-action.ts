"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getSubscriptionInfo } from "@/lib/subscription";
import { env } from "@/lib/env";

/**
 * Plan keys passed from client components. Price IDs are resolved
 * server-side so they never need to be exposed to the browser.
 */
export type PlanKey =
  | "pro-monthly"
  | "pro-yearly"
  | "premium-monthly"
  | "premium-yearly";

const BASE_URL = env.BETTER_AUTH_URL;

async function getOrCreateStripeCustomer(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, email: true, name: true },
  });
  if (!user) throw new Error("User not found");

  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId },
  });

  await db.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/** Resolves a PlanKey to the configured Stripe price ID. Throws if not set. */
function resolvePriceId(planKey: PlanKey): string {
  const priceMap: Record<PlanKey, string | undefined> = {
    "pro-monthly": env.STRIPE_PRO_MONTHLY_PRICE_ID,
    "pro-yearly": env.STRIPE_PRO_YEARLY_PRICE_ID,
    "premium-monthly": env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    "premium-yearly": env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
  };
  const priceId = priceMap[planKey];
  if (!priceId) throw new Error(`Stripe price not configured for: ${planKey}`);
  return priceId;
}

export async function createCheckoutSession(planKey: PlanKey) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const priceId = resolvePriceId(planKey);
  const planTier = planKey.startsWith("pro") ? "pro" : "premium";

  const customerId = await getOrCreateStripeCustomer(session.user.id);

  // Carry over remaining local trial days to Stripe
  const subInfo = await getSubscriptionInfo(session.user.id);
  const trialDays =
    subInfo?.status === "trialing" && !subInfo.hasStripeSubscription
      ? (subInfo.daysLeftInTrial ?? 0)
      : 0;

  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data:
      trialDays > 0 ? { trial_period_days: trialDays } : undefined,
    success_url: `${BASE_URL}/billing?success=true`,
    cancel_url: `${BASE_URL}/billing?canceled=true`,
    metadata: { userId: session.user.id, planTier },
  });

  return { url: checkoutSession.url };
}

export async function createPortalSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) throw new Error("No billing account found");

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${BASE_URL}/billing`,
  });

  return { url: portalSession.url };
}

export async function getCurrentSubscription() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return getSubscriptionInfo(session.user.id);
}
