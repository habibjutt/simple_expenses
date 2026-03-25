import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getSubscriptionInfo, getEffectivePlan } from "@/lib/subscription";
import { getUserOverLimitStatus } from "@/lib/plan-guards";
import { getPlanDisplayName } from "@/lib/plans";

// Server component — runs per-request and reads subscription from DB
export default async function SubscriptionBanner() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const [info, effectivePlan] = await Promise.all([
    getSubscriptionInfo(session.user.id),
    getEffectivePlan(session.user.id),
  ]);
  if (!info) return null;

  // Active paid subscription — check for over-limit issues (edge case: downgraded via portal)
  if (info.status === "active") {
    const overLimit = await getUserOverLimitStatus(session.user.id);
    const isOverAnyLimit = overLimit.overCreditCards || overLimit.overBankAccounts || overLimit.overTransactions;
    if (!isOverAnyLimit) return null;

    // Somehow over limits on an active plan (e.g., plan was downgraded externally)
    return (
      <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium flex-wrap">
        <span>
          ⚠ Your account has data that exceeds your current {getPlanDisplayName(effectivePlan)} plan limits.
        </span>
        <Link href="/billing" className="underline underline-offset-2 hover:no-underline font-semibold">
          Review plan →
        </Link>
      </div>
    );
  }

  // Trial with plenty of time — only show banner in last 5 days
  if (info.status === "trialing" && !info.hasStripeSubscription) {
    const days = info.daysLeftInTrial ?? 14;
    if (days > 5) return null;

    return (
      <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium">
        <span>
          {days === 0
            ? "Your free trial ends today. After expiry, the Free plan limits apply (1 card, 1 account, 100 tx/mo)."
            : `Your free trial ends in ${days} day${days === 1 ? "" : "s"}. After expiry, Free plan limits apply.`}
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

  // Expired trial — show what's blocked if they're over limits
  if (info.status === "expired") {
    const overLimit = await getUserOverLimitStatus(session.user.id);
    const isOverAnyLimit = overLimit.overCreditCards || overLimit.overBankAccounts || overLimit.overTransactions;

    const blockedItems: string[] = [];
    if (overLimit.overCreditCards)
      blockedItems.push(`${overLimit.creditCardCount} credit card${overLimit.creditCardCount !== 1 ? "s" : ""} (limit: ${overLimit.creditCardLimit})`);
    if (overLimit.overBankAccounts)
      blockedItems.push(`${overLimit.bankAccountCount} bank account${overLimit.bankAccountCount !== 1 ? "s" : ""} (limit: ${overLimit.bankAccountLimit})`);
    if (overLimit.overTransactions)
      blockedItems.push(`${overLimit.transactionCount} transactions this month (limit: ${overLimit.transactionLimit})`);

    if (isOverAnyLimit) {
      return (
        <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium flex-wrap">
          <span>
            🚫 Your trial has ended. Adding transactions is blocked — you have {blockedItems.join(" and ")} on the Free plan.
            Delete excess data or upgrade to continue.
          </span>
          <Link href="/billing" className="underline underline-offset-2 hover:no-underline font-semibold whitespace-nowrap">
            Upgrade →
          </Link>
        </div>
      );
    }

    return (
      <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium">
        <span>Your free trial has ended. You are on the Free plan (1 card, 1 account, 100 tx/mo).</span>
        <Link
          href="/billing"
          className="underline underline-offset-2 hover:no-underline font-semibold"
        >
          Upgrade to Pro →
        </Link>
      </div>
    );
  }

  // Past due payment
  if (info.status === "past_due") {
    return (
      <div className="bg-yellow-500 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium">
        <span>Your payment failed. Features are locked until payment is resolved.</span>
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
