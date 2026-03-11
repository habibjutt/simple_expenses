import { db } from "@/lib/db";
import { TRIAL_DAYS } from "@/lib/stripe";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "expired";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  isActive: boolean;
  hasStripeSubscription: boolean;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  daysLeftInTrial: number | null;
}

export async function getSubscriptionInfo(userId: string): Promise<SubscriptionInfo | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const now = new Date();

  // Active Stripe subscription takes precedence
  if (
    user.stripeSubscriptionId &&
    (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing")
  ) {
    return {
      status: user.subscriptionStatus as SubscriptionStatus,
      isActive: true,
      hasStripeSubscription: true,
      trialEndsAt: user.trialEndsAt,
      currentPeriodEnd: user.currentPeriodEnd,
      daysLeftInTrial:
        user.subscriptionStatus === "trialing" && user.trialEndsAt
          ? Math.max(0, Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / 86_400_000))
          : null,
    };
  }

  // Past due or other non-active Stripe statuses
  if (user.stripeSubscriptionId && user.subscriptionStatus) {
    return {
      status: user.subscriptionStatus as SubscriptionStatus,
      isActive: false,
      hasStripeSubscription: true,
      trialEndsAt: user.trialEndsAt,
      currentPeriodEnd: user.currentPeriodEnd,
      daysLeftInTrial: null,
    };
  }

  // No Stripe subscription — check local 14-day trial
  const trialEnd =
    user.trialEndsAt ??
    new Date(user.createdAt.getTime() + TRIAL_DAYS * 86_400_000);

  if (now < trialEnd) {
    const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / 86_400_000));
    return {
      status: "trialing",
      isActive: true,
      hasStripeSubscription: false,
      trialEndsAt: trialEnd,
      currentPeriodEnd: null,
      daysLeftInTrial: daysLeft,
    };
  }

  return {
    status: "expired",
    isActive: false,
    hasStripeSubscription: false,
    trialEndsAt: trialEnd,
    currentPeriodEnd: null,
    daysLeftInTrial: 0,
  };
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const info = await getSubscriptionInfo(userId);
  return info?.isActive ?? false;
}
