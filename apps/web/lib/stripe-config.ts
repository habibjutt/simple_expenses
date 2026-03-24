// Safe to import from both server and client components — no Stripe SDK dependency.

export const TRIAL_DAYS = 14;

export const STRIPE_PRICES = {
  monthly:
    process.env.STRIPE_MONTHLY_PRICE_ID ||
    "price_1T9jGEANvarHkEaqwMiyG7gU",
  yearly:
    process.env.STRIPE_YEARLY_PRICE_ID ||
    "price_1T9jGEANvarHkEaqUVoCI7Mo",
};
