/**
 * lib/plans.ts
 *
 * Single source of truth for plan tiers, feature limits, and Stripe price mappings.
 * To change a limit, edit the PLAN_LIMITS or TRIAL_LIMITS constants below.
 * To add a new gated feature, add a key to PlanLimits and update all three tier objects.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type PlanTier = "free" | "pro" | "premium";

/** 'trial' is not a real tier but an effective state that grants unrestricted access */
export type EffectivePlan = PlanTier | "trial";

export interface PlanLimits {
  /** Max number of credit cards. null = unlimited */
  creditCards: number | null;
  /** Max number of bank accounts. null = unlimited */
  bankAccounts: number | null;
  /** Max transactions per calendar month. null = unlimited */
  transactionsPerMonth: number | null;
  /** Can download CSV exports */
  csvExport: boolean;
  /** Can download PDF exports */
  pdfExport: boolean;
}

// ─── Limits ──────────────────────────────────────────────────────────────────

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    creditCards: 1,
    bankAccounts: 1,
    transactionsPerMonth: 100,
    csvExport: false,
    pdfExport: false,
  },
  pro: {
    creditCards: null,
    bankAccounts: null,
    transactionsPerMonth: null,
    csvExport: false,
    pdfExport: false,
  },
  premium: {
    creditCards: null,
    bankAccounts: null,
    transactionsPerMonth: null,
    csvExport: true,
    pdfExport: true,
  },
};

/** Trial period gets the same limits as Premium — fully unrestricted */
export const TRIAL_LIMITS: PlanLimits = {
  creditCards: null,
  bankAccounts: null,
  transactionsPerMonth: null,
  csvExport: true,
  pdfExport: true,
};

// ─── Stripe Price → Plan Tier Mapping ────────────────────────────────────────

/**
 * Maps Stripe price IDs to their corresponding plan tier.
 * Updated automatically when stripe-config.ts changes.
 * Falls back to env vars so production price IDs can be injected at runtime.
 */
export const STRIPE_PRICE_TO_PLAN: Record<string, PlanTier> = {
  // Pro monthly/yearly
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "price_pro_monthly"]: "pro",
  [process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "price_pro_yearly"]: "pro",
  // Premium monthly/yearly
  [process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ?? "price_premium_monthly"]: "premium",
  [process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID ?? "price_premium_yearly"]: "premium",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the limits for the user's effective plan. */
export function getPlanLimits(plan: EffectivePlan): PlanLimits {
  if (plan === "trial") return TRIAL_LIMITS;
  return PLAN_LIMITS[plan];
}

/** Human-readable plan name for display in UI. */
export function getPlanDisplayName(plan: EffectivePlan): string {
  switch (plan) {
    case "trial":   return "Free Trial";
    case "free":    return "Free";
    case "pro":     return "Pro";
    case "premium": return "Premium";
  }
}

/**
 * Returns the minimum plan tier required to unlock a feature.
 * Returns null if the feature is available on the current plan.
 */
export function getRequiredPlanForFeature(
  feature: keyof PlanLimits,
  currentPlan: EffectivePlan
): PlanTier | null {
  const limits = getPlanLimits(currentPlan);
  const featureValue = limits[feature];

  const isBlocked =
    featureValue === null
      ? false // null = unlimited, not blocked
      : typeof featureValue === "boolean"
      ? !featureValue
      : false; // numeric limits are checked at guard time with actual counts

  if (!isBlocked) return null;

  // Find the cheapest plan that unlocks this feature
  const tiers: PlanTier[] = ["free", "pro", "premium"];
  for (const tier of tiers) {
    const tierLimits = PLAN_LIMITS[tier];
    const tierValue = tierLimits[feature];
    const tierUnlocks =
      typeof tierValue === "boolean" ? tierValue : tierValue === null;
    if (tierUnlocks && tier !== (currentPlan as PlanTier)) return tier;
  }
  return "premium";
}
