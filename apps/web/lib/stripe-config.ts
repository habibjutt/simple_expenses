// Safe to import from both server and client components — no Stripe SDK dependency.

export const TRIAL_DAYS = 14;

export const STRIPE_PRICES = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
  },
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "",
    yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || "",
  },
};

/** Flat set of all valid Stripe price IDs for quick validation */
export const ALL_VALID_PRICE_IDS: ReadonlySet<string> = new Set(
  Object.values(STRIPE_PRICES)
    .flatMap((tier) => Object.values(tier))
    .filter(Boolean),
);
