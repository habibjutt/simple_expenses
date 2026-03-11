"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { STRIPE_PRICES } from "@/lib/stripe-config";
import { db } from "@/lib/db";
import { getSubscriptionInfo } from "@/lib/subscription";

const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

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

export async function createCheckoutSession(priceId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  if (priceId !== STRIPE_PRICES.monthly && priceId !== STRIPE_PRICES.yearly) {
    throw new Error("Invalid price ID");
  }

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
    subscription_data: trialDays > 0 ? { trial_period_days: trialDays } : undefined,
    success_url: `${BASE_URL}/billing?success=true`,
    cancel_url: `${BASE_URL}/billing?canceled=true`,
    metadata: { userId: session.user.id },
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
