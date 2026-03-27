import { getApiUser, api } from "@/lib/api-auth";
import { getSubscriptionInfo } from "@/lib/subscription";
import { getEffectivePlan } from "@/lib/subscription";
import { db } from "@/lib/db";

// GET /api/v1/billing/subscription
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const [subscription, effectivePlan] = await Promise.all([
    getSubscriptionInfo(user.id),
    getEffectivePlan(user.id),
  ]);

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { stripeSubscriptionId: true },
  });

  // Check if the Stripe subscription is set to cancel at period end
  let cancelAtPeriodEnd = false;
  if (dbUser?.stripeSubscriptionId && subscription?.provider === "stripe") {
    try {
      const { getStripe } = await import("@/lib/stripe");
      const stripeSub = await getStripe().subscriptions.retrieve(
        dbUser.stripeSubscriptionId,
      );
      cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
    } catch {
      // Stripe may not be reachable; default to false
    }
  }

  return api.ok({
    planTier: effectivePlan === "trial" ? "trial" : effectivePlan,
    status: subscription?.status ?? null,
    trialDaysRemaining: subscription?.daysLeftInTrial ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd,
    provider: subscription?.provider ?? null,
  });
}
