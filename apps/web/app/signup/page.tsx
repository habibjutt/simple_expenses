import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import {
  CreditCard,
  TrendingUp,
  FileText,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { SITE_URL } from "@/lib/seo";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your free Fixpenses account. Track credit cards, bank accounts, and invoices — built for UAE residents. No credit card required.",
  keywords: [
    "sign up Fixpenses",
    "create account expense tracker UAE",
    "free finance app UAE",
    "AED expense tracker free",
    "personal finance UAE free",
  ],
  alternates: {
    canonical: `${SITE_URL}/signup`,
  },
  openGraph: {
    title: "Create Your Free Account | Fixpenses",
    description:
      "Join thousands of UAE residents tracking their finances with Fixpenses. Free, private, and built for AED.",
    url: `${SITE_URL}/signup`,
  },
};

const benefits = [
  { icon: TrendingUp, text: "Track spending across all cards & accounts" },
  { icon: FileText, text: "Manage invoices & installments effortlessly" },
  { icon: Globe, text: "Built for UAE — AED-native from day one" },
];

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNav />

      <main className="relative flex items-center justify-center flex-1 p-4 overflow-hidden md:p-8">
        {/* Page background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a9e5c]/8 via-background to-background pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#1a9e5c]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-[#1a9e5c]/4 rounded-full blur-3xl pointer-events-none" />

        {/* ── Contained card ─────────────────────────────────── */}
        <div className="relative flex flex-col w-full max-w-4xl overflow-hidden border shadow-2xl lg:flex-row rounded-2xl border-border/50">
          {/* Left: green branding panel */}
          <div className="relative hidden lg:flex lg:w-[380px] xl:w-[420px] bg-[#1a9e5c] flex-col items-center justify-center p-10 overflow-hidden shrink-0">
            <div className="absolute w-64 h-64 rounded-full pointer-events-none -top-24 -right-24 bg-white/10 blur-3xl" />
            <div className="absolute w-64 h-64 rounded-full pointer-events-none -bottom-24 -left-24 bg-white/10 blur-3xl" />

            <div className="relative z-10 max-w-xs space-y-8 text-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Fixpenses</span>
              </div>

              <div>
                <h2 className="text-3xl font-extrabold leading-tight">
                  Take control of every dirham
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Join UAE residents who finally know exactly where their money
                  goes.
                </p>
              </div>

              <ul className="space-y-4">
                {benefits.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white/90">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                {["Free forever", "No credit card", "100% private"].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="flex items-center gap-1.5 bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full border border-white/15"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {badge}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="flex flex-col items-center justify-center flex-1 px-4 py-6 sm:p-8 md:p-10 bg-background">
            {/* Mobile-only brand header */}
            <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-full bg-[#1a9e5c] flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-foreground">
                Fixpenses
              </span>
            </div>

            <div className="w-full max-w-sm">
              <SignupForm />
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
