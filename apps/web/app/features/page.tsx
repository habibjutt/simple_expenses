import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { FEATURE_LINKS } from "@/lib/feature-links";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore all the powerful features Simple Expenses offers to help you track every dirham across credit cards, bank accounts, and more.",
  keywords: [
    "expense tracking features UAE",
    "personal finance tools UAE",
    "credit card management UAE",
    "bank account tracker features",
    "savings goals app UAE",
    "spending limits UAE",
    "finance app features",
  ],
  alternates: {
    canonical: `${SITE_URL}/features`,
  },
  openGraph: {
    title: "Features | Simple Expenses",
    description:
      "Powerful features for UAE residents — expense tracking, credit cards, bank accounts, budgets, savings goals, and reports.",
    url: `${SITE_URL}/features`,
  },
};

const ALL_FEATURES = [
  ...FEATURE_LINKS,
  {
    href: "/categories",
    icon: Tags,
    label: "Custom Categories",
    description:
      "Create color-coded categories with custom icons so every expense is easy to classify and find.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              Everything you need
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Powerful features,{" "}
              <span className="text-[#1a9e5c]">simple experience</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Simple Expenses gives UAE residents a complete personal finance
              toolkit — from transaction logging to savings goals — all in one
              clean app.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#1a9e5c] hover:bg-[#158a4f] text-white font-semibold shadow-lg shadow-[#1a9e5c]/20 w-full sm:w-auto"
                >
                  Get started free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_FEATURES.map(({ href, icon: Icon, label, description }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-4 bg-background border border-border rounded-2xl p-6 hover:border-[#1a9e5c]/40 hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#1a9e5c]" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h2 className="font-bold text-foreground group-hover:text-[#1a9e5c] transition-colors">
                    {label}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-[#1a9e5c] opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#1a9e5c] py-16 px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to take control of your finances?
            </h2>
            <p className="text-white/80">
              Join thousands of UAE residents who trust Simple Expenses to
              manage their money every day.
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
