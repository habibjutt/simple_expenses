import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getSubscriptionInfo } from "@/lib/subscription";

// Server component — runs per-request and reads subscription from DB
export default async function SubscriptionBanner() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const info = await getSubscriptionInfo(session.user.id);
  if (!info) return null;

  // Active paid subscription — no banner needed
  if (info.status === "active") return null;

  // Trial with plenty of time — only show banner in last 5 days
  if (info.status === "trialing" && !info.hasStripeSubscription) {
    const days = info.daysLeftInTrial ?? 14;
    if (days > 5) return null;

    return (
      <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium">
        <span>
          {days === 0
            ? "Your free trial ends today."
            : `Your free trial ends in ${days} day${days === 1 ? "" : "s"}.`}
        </span>
        <Link
          href="/billing"
          className="underline underline-offset-2 hover:no-underline font-semibold"
        >
          Subscribe now →
        </Link>
      </div>
    );
  }

  // Stripe-managed trial
  if (info.status === "trialing" && info.hasStripeSubscription) {
    return null; // Stripe will handle trial end — no need to nag
  }

  // Expired trial
  if (info.status === "expired") {
    return (
      <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium">
        <span>Your free trial has ended.</span>
        <Link
          href="/billing"
          className="underline underline-offset-2 hover:no-underline font-semibold"
        >
          Upgrade to continue →
        </Link>
      </div>
    );
  }

  // Past due payment
  if (info.status === "past_due") {
    return (
      <div className="bg-yellow-500 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium">
        <span>Your payment failed.</span>
        <Link
          href="/billing"
          className="underline underline-offset-2 hover:no-underline font-semibold"
        >
          Update billing →
        </Link>
      </div>
    );
  }

  return null;
}
