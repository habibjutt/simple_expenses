import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Wallet, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Bank Account Management",
  description:
    "Connect multiple UAE bank accounts and keep a real-time view of your total available balance across all accounts.",
  keywords: [
    "UAE bank account tracker",
    "bank balance tracker",
    "multiple bank accounts UAE",
    "AED bank balance app",
    "savings account tracker UAE",
  ],
  alternates: {
    canonical: `${SITE_URL}/features/bank-accounts`,
  },
  openGraph: {
    title: "Bank Account Management | Simple Expenses",
    description:
      "Connect multiple UAE bank accounts and track your total balance in real time.",
    url: `${SITE_URL}/features/bank-accounts`,
  },
};

const HIGHLIGHTS = [
  "Add multiple bank accounts in seconds",
  "Track current balance updated with every transaction",
  "Separate view for each account's transaction history",
  "Total net-worth overview across all accounts",
  "Works alongside credit card tracking",
  "No bank connection required — full manual control",
];

export default function BankAccountsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#1a9e5c]/10 flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7 text-[#1a9e5c]" />
            </div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              Feature
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Bank Account Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Track all your UAE bank accounts in one place. Get a real-time
              picture of your total cash position without sharing your banking
              credentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#1a9e5c] hover:bg-[#158a4f] text-white font-semibold shadow-lg shadow-[#1a9e5c]/20 w-full sm:w-auto"
                >
                  Add your accounts <ArrowRight className="ml-2 h-4 w-4" />
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
                All your accounts, one clear view
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

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: Wallet,
                  title: "Real-time balances",
                  desc: "Your current balance updates automatically every time you log a new transaction.",
                },
                {
                  icon: RefreshCw,
                  title: "Multi-account overview",
                  desc: "See the combined balance across all accounts in a single dashboard widget.",
                },
                {
                  icon: Building2,
                  title: "Privacy first",
                  desc: "No bank API keys or credentials required. You stay in full control of your data.",
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
