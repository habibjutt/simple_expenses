import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronDown, Minus, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import PricingSection from "@/components/PricingSection";
import { PLAN_LIMITS, type PlanTier } from "@/lib/plans";
import { TRIAL_DAYS } from "@/lib/stripe-config";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Fixpenses pricing in AED — Starter free forever, Pro and Premium monthly or annual. Compare account limits, card limits and features, plus a ${TRIAL_DAYS}-day free trial with no card required.`,
  keywords: [
    "Fixpenses pricing",
    "personal finance software UAE pricing",
    "expense tracker price AED",
    "free expense tracker UAE",
    "personal finance app subscription UAE",
  ],
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
  openGraph: {
    title: "Pricing | Fixpenses",
    description: `Starter free forever, Pro and Premium billed monthly or annually in AED. ${TRIAL_DAYS}-day free trial, no card required.`,
    url: `${SITE_URL}/pricing`,
  },
};

const TIERS: PlanTier[] = ["free", "pro", "premium"];
const TIER_LABELS: Record<PlanTier, string> = {
  free: "Starter",
  pro: "Pro",
  premium: "Premium",
};
const TIER_PRICES: Record<PlanTier, string> = {
  free: "Free forever",
  pro: "AED 9.99 / mo · AED 99 / yr",
  premium: "AED 29 / mo · AED 299 / yr",
};

type Cell = string | boolean;

/**
 * Rows for limits that are actually enforced server-side are derived from
 * PLAN_LIMITS so this table can never drift from lib/plan-guards.ts.
 */
function limitRow(
  label: string,
  key: keyof (typeof PLAN_LIMITS)["free"],
): { label: string; cells: Cell[] } {
  return {
    label,
    cells: TIERS.map((tier) => {
      const value = PLAN_LIMITS[tier][key];
      if (typeof value === "boolean") return value;
      return value === null ? "Unlimited" : String(value);
    }),
  };
}

const COMPARISON: Array<{
  group: string;
  rows: Array<{ label: string; cells: Cell[] }>;
}> = [
  {
    group: "Limits",
    rows: [
      limitRow("Credit cards", "creditCards"),
      limitRow("Bank accounts", "bankAccounts"),
      limitRow("Transactions per month", "transactionsPerMonth"),
    ],
  },
  {
    group: "Tracking",
    rows: [
      { label: "Expense & income tracking", cells: [true, true, true] },
      { label: "Installment tracking", cells: [true, true, true] },
      { label: "Recurring transactions", cells: [true, true, true] },
      { label: "Invoice management", cells: [true, true, true] },
      { label: "Custom categories", cells: [true, true, true] },
      { label: "AED & multi-currency formatting", cells: [true, true, true] },
    ],
  },
  {
    group: "Insight",
    rows: [
      { label: "Reports & charts", cells: [true, true, true] },
      { label: "Spending limits", cells: [true, true, true] },
      { label: "Savings goals", cells: [true, true, true] },
      limitRow("CSV export", "csvExport"),
      limitRow("PDF export", "pdfExport"),
    ],
  },
  {
    group: "Access & support",
    rows: [
      { label: "Web & mobile apps", cells: [true, true, true] },
      { label: "Dark mode", cells: [true, true, true] },
      { label: "Email support", cells: [true, true, true] },
      { label: "Priority email support", cells: [false, true, true] },
      { label: "Dedicated account manager", cells: [false, false, true] },
      { label: "1-hour response SLA", cells: [false, false, true] },
    ],
  },
];

const TRIAL_TERMS = [
  `Every new account starts on a ${TRIAL_DAYS}-day free trial with full Premium limits — unlimited cards, accounts and transactions, plus CSV and PDF export.`,
  "No credit card is required to sign up or to use the trial. We do not ask for card details until you choose a paid plan.",
  `When the ${TRIAL_DAYS} days end, your account moves to the Starter plan automatically. Nothing is charged and nothing is deleted.`,
  `On Starter you keep read access to everything you have already recorded. New entries are limited to ${PLAN_LIMITS.free.creditCards} credit card, ${PLAN_LIMITS.free.bankAccounts} bank account and ${PLAN_LIMITS.free.transactionsPerMonth} transactions per month.`,
  "Upgrade, downgrade or cancel at any time from the billing portal. Paid plans stay active until the end of the period you have already paid for.",
];

const FAQ = [
  {
    q: "Is the Starter plan really free?",
    a: `Yes — Starter is free forever, with no card required. It covers ${PLAN_LIMITS.free.creditCards} credit card, ${PLAN_LIMITS.free.bankAccounts} bank account and ${PLAN_LIMITS.free.transactionsPerMonth} transactions per month, which is enough for a lot of people. We do not show ads and we do not sell your data.`,
  },
  {
    q: `What happens when my ${TRIAL_DAYS}-day trial ends?`,
    a: `Your account moves to the Starter plan on its own. You are not charged, and none of your data is deleted — you keep full access to your existing history. Only new entries beyond the Starter limits are restricted until you upgrade.`,
  },
  {
    q: "What if I am over the Starter limits when my trial ends?",
    a: `Everything you already added stays visible. If you have more than ${PLAN_LIMITS.free.creditCards} card or ${PLAN_LIMITS.free.bankAccounts} bank account, you will be asked to remove the extras — or upgrade — before you can add new transactions.`,
  },
  {
    q: "How much do I save by paying annually?",
    a: "Pro is AED 99 a year instead of AED 119.88 billed monthly, saving AED 20.88. Premium is AED 299 a year instead of AED 348, saving AED 49. You can switch between monthly and annual at any time.",
  },
  {
    q: "What is the difference between Pro and Premium?",
    a: "Pro removes every limit: unlimited credit cards, bank accounts and transactions. Premium adds data export — CSV and PDF downloads of your transactions and reports — along with a dedicated account manager and a 1-hour response SLA.",
  },
  {
    q: "Which currency am I charged in?",
    a: "All prices are shown and charged in UAE dirhams (AED). The app itself is multi-currency, so you can record transactions in other currencies while your subscription stays in AED.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Cancel from the billing portal in your account settings — no email, no phone call. Your plan stays active until the end of the period you have already paid for, then drops to Starter.",
  },
  {
    q: "Do you take card payments securely?",
    a: "Payments are handled by Stripe. Fixpenses never sees or stores your card number. Mobile subscriptions purchased in the iOS or Android app are billed through Apple or Google instead.",
  },
];

function CellValue({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <>
        <Check
          className="w-4 h-4 text-[#1a9e5c] inline-block"
          aria-hidden="true"
        />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus
          className="w-4 h-4 text-muted-foreground/50 inline-block"
          aria-hidden="true"
        />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-5">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Pricing
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Simple pricing,{" "}
              <span className="text-[#1a9e5c]">priced in dirhams</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Start on the free Starter plan or take the {TRIAL_DAYS}-day trial
              — no credit card needed. Upgrade to Pro to remove every limit, or
              Premium when you need exports and priority support.
            </p>
          </div>
        </section>

        {/* Plan cards + monthly/annual toggle (shared with the homepage) */}
        <PricingSection />

        {/* Feature comparison */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Compare every plan
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The exact limits enforced on each plan, side by side.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="sr-only">
                Feature and limit comparison across the Starter, Pro and Premium
                plans
              </caption>
              <thead>
                <tr className="bg-muted/50">
                  <th
                    scope="col"
                    className="py-4 px-5 text-sm font-bold text-foreground w-2/5"
                  >
                    Feature
                  </th>
                  {TIERS.map((tier) => (
                    <th
                      key={tier}
                      scope="col"
                      className="py-4 px-5 text-center"
                    >
                      <span
                        className={
                          tier === "pro"
                            ? "block text-sm font-bold text-[#1a9e5c]"
                            : "block text-sm font-bold text-foreground"
                        }
                      >
                        {TIER_LABELS[tier]}
                      </span>
                      <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                        {TIER_PRICES[tier]}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              {COMPARISON.map(({ group, rows }) => (
                <tbody key={group}>
                  <tr className="border-t border-border">
                    <th
                      scope="colgroup"
                      colSpan={4}
                      className="py-2.5 px-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground bg-muted/30 text-left"
                    >
                      {group}
                    </th>
                  </tr>
                  {rows.map(({ label, cells }) => (
                    <tr key={label} className="border-t border-border">
                      <th
                        scope="row"
                        className="py-3.5 px-5 text-sm font-normal text-muted-foreground text-left"
                      >
                        {label}
                      </th>
                      {cells.map((cell, i) => (
                        <td
                          key={TIERS[i]}
                          className="py-3.5 px-5 text-center align-middle"
                        >
                          <CellValue value={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 sm:hidden">
            Scroll the table sideways to see all plans.
          </p>
        </section>

        {/* Free plan & trial terms */}
        <section className="bg-muted/40 border-y border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                No surprises
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Free plan and trial terms
              </h2>
            </div>
            <ul className="space-y-4">
              {TRIAL_TERMS.map((term) => (
                <li key={term} className="flex items-start gap-3">
                  <Check
                    className="w-5 h-5 text-[#1a9e5c] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground leading-relaxed">
                    {term}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pricing FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Pricing questions
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Still unsure about something?{" "}
              <Link
                href="/contact"
                className="text-[#1a9e5c] font-medium hover:underline underline-offset-4"
              >
                Ask us directly
              </Link>
              .
            </p>
          </div>
          <div className="border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group px-6 py-5 cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <summary className="flex items-center justify-between font-semibold text-foreground list-none [&::-webkit-details-marker]:hidden gap-4">
                  <span className="text-sm sm:text-base">{q}</span>
                  <ChevronDown
                    className="w-5 h-5 text-muted-foreground shrink-0 group-open:rotate-180 transition-transform duration-300"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#1a9e5c] py-16 px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Try everything free for {TRIAL_DAYS} days
            </h2>
            <p className="text-white/80">
              Full Premium limits, no credit card, no commitment. Stay on
              Starter afterwards if that is all you need.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-[#1a9e5c] hover:bg-white/90 font-bold shadow-lg"
              >
                Create your free account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
