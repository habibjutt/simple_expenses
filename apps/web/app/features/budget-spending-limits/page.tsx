import type { Metadata } from "next";
import Link from "next/link";
import {
  Target,
  Bell,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Budgets & Spending Limits",
  description:
    "Set monthly spending limits per category, track your usage in real time, and get alerts before you overspend.",
  keywords: [
    "spending limits UAE",
    "budget tracker UAE",
    "monthly budget app UAE",
    "overspending alerts UAE",
    "category budget UAE",
    "personal budget AED",
  ],
  alternates: {
    canonical: `${SITE_URL}/features/budgets`,
  },
  openGraph: {
    title: "Budgets & Spending Limits | Fixpenses",
    description:
      "Set monthly spending limits by category and get alerts before you overspend.",
    url: `${SITE_URL}/features/budgets`,
  },
};

const HIGHLIGHTS = [
  "Set monthly spending limits for any category",
  "Real-time progress bars show how much you have left",
  "Instant alerts when you reach 80% of a limit",
  "Historical comparison to spot trends over months",
  "Separate budgets for credit cards and bank accounts",
  "Fully customizable — adjust limits anytime",
];

export default function BudgetsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#1a9e5c]/10 flex items-center justify-center mx-auto">
              <Target className="w-7 h-7 text-[#1a9e5c]" />
            </div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              Feature
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Budgets &amp; Spending Limits
            </h1>
            <p className="text-lg text-muted-foreground">
              Stop overspending before it happens. Set monthly limits per
              category and receive alerts the moment you are close to your
              threshold.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#1a9e5c] hover:bg-[#158a4f] text-white font-semibold shadow-lg shadow-[#1a9e5c]/20 w-full sm:w-auto"
                >
                  Set your first budget <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Spend smarter, not harder
              </h2>
              <ul className="space-y-3">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1a9e5c] shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: Bell,
                  title: "Smart alerts",
                  desc: "Get notified at 80% of your budget so you always have time to adjust before month-end.",
                },
                {
                  icon: TrendingDown,
                  title: "Trend analysis",
                  desc: "Compare spending month over month to identify habits and cut unnecessary costs.",
                },
                {
                  icon: Target,
                  title: "Category budgets",
                  desc: "Assign limits to individual categories like Dining, Transport, or Entertainment.",
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
                    <p className="font-semibold text-sm text-foreground">
                      {title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
