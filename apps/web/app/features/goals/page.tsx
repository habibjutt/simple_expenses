import type { Metadata } from "next";
import Link from "next/link";
import { PiggyBank, Star, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Savings Goals",
  description:
    "Define savings targets, track progress visually, and reach your financial goals faster with Simple Expenses.",
  keywords: [
    "savings goals UAE",
    "financial goals tracker UAE",
    "save money UAE app",
    "target savings AED",
    "savings progress tracker",
  ],
  alternates: {
    canonical: `${SITE_URL}/features/goals`,
  },
  openGraph: {
    title: "Savings Goals | Simple Expenses",
    description:
      "Define savings targets and track progress visually to reach your financial goals faster.",
    url: `${SITE_URL}/features/goals`,
  },
};

const HIGHLIGHTS = [
  "Create unlimited savings goals with custom names and icons",
  "Set a target amount and deadline",
  "Visual progress bar updates automatically as you save",
  "Milestone celebrations to keep you motivated",
  "Link goals to specific bank accounts",
  "Adjust targets anytime as your priorities change",
];

export default function GoalsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#1a9e5c]/10 flex items-center justify-center mx-auto">
              <PiggyBank className="w-7 h-7 text-[#1a9e5c]" />
            </div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              Feature
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Savings Goals
            </h1>
            <p className="text-lg text-muted-foreground">
              Whether it is a new car, a family holiday, or an emergency fund —
              set a goal, track your progress, and watch your savings grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#1a9e5c] hover:bg-[#158a4f] text-white font-semibold shadow-lg shadow-[#1a9e5c]/20 w-full sm:w-auto"
                >
                  Create your first goal <ArrowRight className="ml-2 h-4 w-4" />
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
                Turn your dreams into a plan
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
                  icon: Star,
                  title: "Milestone rewards",
                  desc: "Celebrate every 25% milestone with visual cues that keep motivation high on the journey.",
                },
                {
                  icon: Zap,
                  title: "Automatic progress",
                  desc: "Your goal progress updates automatically as transactions hit your linked account.",
                },
                {
                  icon: PiggyBank,
                  title: "Multiple goals",
                  desc: "Run several goals simultaneously — short-term and long-term — all tracked in one view.",
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
