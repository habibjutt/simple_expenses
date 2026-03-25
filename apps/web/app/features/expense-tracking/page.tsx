import type { Metadata } from "next";
import Link from "next/link";
import { ListOrdered, Filter, Clock, Download, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Expense Tracking",
  description:
    "Log every dirham you spend in seconds. Smart categories, filters, installment support, and full transaction history.",
  keywords: [
    "expense tracking UAE",
    "track spending UAE",
    "transaction log UAE",
    "installment tracking UAE",
    "dirham expense log",
    "category expense tracker",
  ],
  alternates: {
    canonical: `${SITE_URL}/features/expense-tracking`,
  },
  openGraph: {
    title: "Expense Tracking | Simple Expenses",
    description:
      "Log every dirham in seconds with smart categories, filters, and installment support.",
    url: `${SITE_URL}/features/expense-tracking`,
  },
};

const HIGHLIGHTS = [
  "Log credit card and bank account transactions in one place",
  "Support for installment payments with automatic splitting",
  "Smart category assignment and color-coded icons",
  "Powerful filters by date, amount, category, and account",
  "Full transaction history with search",
  "Export your data at any time",
];

export default function ExpenseTrackingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#1a9e5c]/10 flex items-center justify-center mx-auto">
              <ListOrdered className="w-7 h-7 text-[#1a9e5c]" />
            </div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              Feature
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Expense Tracking
            </h1>
            <p className="text-lg text-muted-foreground">
              Every dirham matters. Log transactions from your credit cards and
              bank accounts in seconds and keep a crystal-clear picture of where
              your money goes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#1a9e5c] hover:bg-[#158a4f] text-white font-semibold shadow-lg shadow-[#1a9e5c]/20 w-full sm:w-auto"
                >
                  Start tracking free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Key features list */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Everything you need to stay on top of spending
              </h2>
              <ul className="space-y-3">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1a9e5c] shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: Clock,
                  title: "Instant logging",
                  desc: "Add a transaction in under 10 seconds with smart defaults and quick-pick categories.",
                },
                {
                  icon: Filter,
                  title: "Powerful filters",
                  desc: "Slice your history by date range, account, category, or amount — find any transaction instantly.",
                },
                {
                  icon: Download,
                  title: "Data export",
                  desc: "Download your full transaction history as CSV at any time. Your data, always accessible.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-4 bg-background border border-border rounded-2xl p-5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#1a9e5c]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Back to features */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 text-center">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-sm text-[#1a9e5c] hover:underline font-medium"
          >
            ← Back to all features
          </Link>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
