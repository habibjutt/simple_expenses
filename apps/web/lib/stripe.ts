import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

export { STRIPE_PRICES, ALL_VALID_PRICE_IDS, TRIAL_DAYS } from "@/lib/stripe-config";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}
