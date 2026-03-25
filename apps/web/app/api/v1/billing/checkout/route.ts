import { getApiUser, api } from "@/lib/api-auth";
import { getStripe } from "@/lib/stripe";
import { STRIPE_PRICES, ALL_VALID_PRICE_IDS } from "@/lib/stripe-config";
import { STRIPE_PRICE_TO_PLAN } from "@/lib/plans";
import { db } from "@/lib/db";
import { getSubscriptionInfo } from "@/lib/subscription";
import { env } from "@/lib/env";

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

// POST /api/v1/billing/checkout
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { priceId } = body as Record<string, unknown>;
  if (!priceId) return api.badRequest("priceId is required");

  if (!ALL_VALID_PRICE_IDS.has(String(priceId)))
    return api.badRequest("Invalid priceId");

  const customerId = await getOrCreateStripeCustomer(user.id);

  const subInfo = await getSubscriptionInfo(user.id);
  const trialDays =
    subInfo?.status === "trialing" && !subInfo.hasStripeSubscription
      ? (subInfo.daysLeftInTrial ?? 0)
      : 0;

  const planTier = STRIPE_PRICE_TO_PLAN[String(priceId)] ?? "pro";

  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: String(priceId), quantity: 1 }],
    subscription_data: trialDays > 0 ? { trial_period_days: trialDays } : undefined,
    success_url: `${BASE_URL}/billing?success=true`,
    cancel_url: `${BASE_URL}/billing?canceled=true`,
    metadata: { userId: user.id, planTier },
  });

  return api.ok({ url: checkoutSession.url });
}
