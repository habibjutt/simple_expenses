import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Wallet,
  BarChart3,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Star,
  TrendingUp,
  Target,
  PiggyBank,
  FileText,
  Lock,
  Users,
  Clock,
  Award,
  Receipt,
} from "lucide-react";
import LandingFooter from "@/components/LandingFooter";
import LandingNav from "@/components/LandingNav";
import PricingSection from "@/components/PricingSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — Personal Finance App for UAE Residents`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "expense tracker UAE",
    "personal finance app UAE",
    "AED expense tracking",
    "credit card tracker UAE",
    "bank account manager UAE",
    "UAE financial app",
    "free expense tracker",
    "dirham spending tracker",
    "invoice management UAE",
    "Simple Expenses",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} — Personal Finance App for UAE Residents`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    title: `${SITE_NAME} — Personal Finance App for UAE Residents`,
    description: SITE_DESCRIPTION,
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── Navigation ──────────────────────────────────────── */}
      <LandingNav />

      <main>
        {/* ─── Hero ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden se-dot-grid">
          {/* Atmospheric gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a9e5c]/10 via-background to-background pointer-events-none" />
          {/* Animated orbs */}
          <div
            className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[#1a9e5c]/10 rounded-full blur-3xl pointer-events-none"
            style={{ animation: "se-orb-drift 12s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[#1a9e5c]/7 rounded-full blur-3xl pointer-events-none"
            style={{
              animation: "se-orb-drift 16s ease-in-out 4s infinite reverse",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#1a9e5c]/5 rounded-full blur-3xl pointer-events-none"
            style={{ animation: "se-orb-drift 10s ease-in-out 2s infinite" }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16 sm:pb-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Content */}
              <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                <div className="se-hero-badge inline-flex items-center gap-2 bg-[#1a9e5c]/10 text-[#1a9e5c] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#1a9e5c]/20">
                  <Globe className="w-3.5 h-3.5" /> Built exclusively for UAE
                  residents
                </div>
                <h1 className="se-hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                  Take control of{" "}
                  <span className="text-[#1a9e5c] relative">
                    every dirham
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-[#1a9e5c]/60 via-[#1a9e5c]/30 to-transparent" />
                  </span>
                </h1>
                <p className="se-hero-desc text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Track credit cards, bank accounts, and transactions in one
                  beautiful dashboard. Stop wondering where your money went —
                  start knowing.
                </p>
                <div className="se-hero-btns flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base text-white shadow-lg shadow-[#1a9e5c]/30 se-animate-shimmer-btn border-0 hover:opacity-90 transition-opacity"
                    asChild
                  >
                    <Link href="/signup">
                      Start for free <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 text-base border-[#1a9e5c]/30 hover:border-[#1a9e5c]/60 hover:bg-[#1a9e5c]/5 transition-all"
                    asChild
                  >
                    <Link href="#how-it-works">See how it works</Link>
                  </Button>
                </div>
                <div className="se-hero-trust flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1a9e5c] shrink-0" />
                    Free forever plan
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1a9e5c] shrink-0" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1a9e5c] shrink-0" />
                    100% private
                  </span>
                </div>
              </div>

              {/* Right: Dashboard mockup */}
              <div className="relative hidden sm:flex justify-center lg:justify-end">
                <div className="se-hero-mockup relative w-full max-w-md">
                  {/* Glow layers */}
                  <div className="absolute inset-0 bg-[#1a9e5c]/20 rounded-2xl blur-2xl scale-95 se-animate-pulse-glow" />
                  <div className="absolute inset-0 bg-[#1a9e5c]/10 rounded-2xl blur-3xl scale-110" />
                  {/* Mockup card */}
                  <div className="relative bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
                    {/* Mockup header bar */}
                    <div className="bg-[#1a9e5c] px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                          <CreditCard className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white text-xs font-semibold">
                          Simple Expenses
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Balance overview */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#1a9e5c] rounded-xl p-4 text-white">
                          <p className="text-xs text-white/70 mb-1">
                            Total Balance
                          </p>
                          <p className="text-xl font-bold">AED 24,580</p>
                          <p className="text-xs text-white/60 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +12% this month
                          </p>
                        </div>
                        <div className="bg-muted rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">
                            Monthly Spend
                          </p>
                          <p className="text-xl font-bold text-foreground">
                            AED 8,230
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Budget: 10,000
                          </p>
                        </div>
                      </div>
                      {/* Recent transactions */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                          Recent
                        </p>
                        <div className="space-y-2">
                          {[
                            {
                              name: "Carrefour Mall",
                              amount: "-AED 156",
                              cat: "Groceries",
                            },
                            {
                              name: "DEWA Bill",
                              amount: "-AED 380",
                              cat: "Utilities",
                            },
                            {
                              name: "Salary Credit",
                              amount: "+AED 18,000",
                              cat: "Income",
                              income: true,
                            },
                          ].map((tx) => (
                            <div
                              key={tx.name}
                              className="flex items-center justify-between py-2 border-b border-border last:border-0"
                            >
                              <div>
                                <p className="text-xs font-medium text-foreground">
                                  {tx.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {tx.cat}
                                </p>
                              </div>
                              <span
                                className={`text-xs font-semibold ${
                                  tx.income
                                    ? "text-[#1a9e5c]"
                                    : "text-foreground"
                                }`}
                              >
                                {tx.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Cards row */}
                      <div className="flex gap-2">
                        {["ADCB", "Mashreq", "FAB"].map((bank) => (
                          <div
                            key={bank}
                            className="flex-1 bg-muted rounded-lg p-2 text-center"
                          >
                            <CreditCard className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                            <p className="text-[10px] font-medium text-muted-foreground">
                              {bank}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Stats bar ───────────────────────────────────────── */}
        <section className="border-y border-border bg-gradient-to-r from-[#1a9e5c]/5 via-muted/40 to-[#1a9e5c]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <AnimateOnScroll
              type="stagger"
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            >
              {[
                { value: "500+", label: "UAE users", icon: Users },
                {
                  value: "AED 10M+",
                  label: "Tracked to date",
                  icon: TrendingUp,
                },
                { value: "4.9 ★", label: "Average rating", icon: Award },
                { value: "100%", label: "Data encrypted", icon: Lock },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="space-y-1 group">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1a9e5c]/10 flex items-center justify-center group-hover:bg-[#1a9e5c]/20 transition-colors">
                      <Icon className="w-4 h-4 text-[#1a9e5c]" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      {value}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Features ────────────────────────────────────────── */}
        <section
          id="features"
          className="relative px-4 sm:px-6 py-20 sm:py-24 overflow-hidden"
        >
          {/* Subtle background accent */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1a9e5c]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            <AnimateOnScroll
              type="fade-up"
              className="text-center space-y-4 mb-14"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20">
                <Zap className="w-4 h-4" />
                Everything you need
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Your full financial picture, in one place
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Purpose-built for UAE residents — from ADCB to Mashreq, from
                credit cards to IBAN accounts.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll
              type="stagger"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {[
                {
                  icon: CreditCard,
                  title: "Credit Card Tracking",
                  desc: "Monitor balances, bill dates, and payment due dates for all your cards. Never miss a payment deadline again.",
                  badge: "Popular",
                },
                {
                  icon: Wallet,
                  title: "Bank Accounts",
                  desc: "Track multiple UAE bank accounts with running balances updated automatically with every transaction.",
                  badge: null,
                },
                {
                  icon: BarChart3,
                  title: "Invoice Management",
                  desc: "See all upcoming bills at a glance, track paid invoices per billing period, and export summaries.",
                  badge: null,
                },
                {
                  icon: Receipt,
                  title: "Installment Support",
                  desc: "Split purchases across months with full taksit tracking, per-month breakdowns, and completion forecasts.",
                  badge: "UAE-specific",
                },
                {
                  icon: Target,
                  title: "Budgets & Limits",
                  desc: "Set spending limits by category or card. Get alerted before you overspend.",
                  badge: null,
                },
                {
                  icon: PiggyBank,
                  title: "Financial Goals",
                  desc: "Set savings targets, track progress toward big purchases, and celebrate milestones.",
                  badge: null,
                },
                {
                  icon: FileText,
                  title: "Detailed Reports",
                  desc: "Visualise spending trends by category, card, or time period with beautiful charts.",
                  badge: null,
                },
                {
                  icon: Shield,
                  title: "Secure & Private",
                  desc: "Your data is encrypted and tied to your account only. Sign in with email or GitHub OAuth.",
                  badge: null,
                },
                {
                  icon: Globe,
                  title: "AED Native",
                  desc: "All amounts displayed in UAE Dirhams with proper AED formatting. No currency confusion.",
                  badge: "UAE",
                },
              ].map(({ icon: Icon, title, desc, badge }) => (
                <div
                  key={title}
                  className="relative bg-background border border-border rounded-2xl p-6 space-y-3 hover:shadow-[0_8px_40px_rgba(26,158,92,0.12)] hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group"
                >
                  {badge && (
                    <span className="absolute top-4 right-4 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                      {badge}
                    </span>
                  )}
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── How it works ─────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="relative px-4 sm:px-6 py-20 sm:py-24 bg-muted/30 border-t border-border overflow-hidden"
        >
          {/* Background orb */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#1a9e5c]/6 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-5xl mx-auto relative">
            <AnimateOnScroll
              type="fade-up"
              className="text-center space-y-4 mb-14"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20">
                <Clock className="w-4 h-4" />
                Up and running in minutes
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Three steps to financial clarity
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll
              type="stagger"
              className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
            >
              {/* Animated connector line - desktop only */}
              <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px z-0 overflow-hidden">
                <div className="absolute inset-0 bg-border" />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1a9e5c]/60 to-transparent w-1/2"
                  style={{ animation: "se-connector-flow 2s linear infinite" }}
                />
              </div>

              {[
                {
                  step: "1",
                  icon: PlusCircleIcon,
                  title: "Create your account",
                  desc: "Sign up in seconds with email or GitHub. No credit card needed. Your account is ready instantly.",
                },
                {
                  step: "2",
                  icon: CreditCard,
                  title: "Add your cards & accounts",
                  desc: "Add your UAE credit cards and bank accounts manually. Set balances, bill dates, and limits.",
                },
                {
                  step: "3",
                  icon: BarChart3,
                  title: "Start tracking",
                  desc: "Log transactions, view reports, and see your complete financial picture in one dashboard.",
                },
              ].map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="relative flex flex-col items-center text-center space-y-4 z-10"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#1a9e5c]/30 rounded-2xl blur-xl scale-150 se-animate-pulse-glow" />
                    <div className="relative w-16 h-16 rounded-2xl bg-[#1a9e5c] text-white flex items-center justify-center shadow-lg shadow-[#1a9e5c]/30 text-xl font-extrabold hover:scale-105 transition-transform">
                      {step}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {desc}
                  </p>
                </div>
              ))}
            </AnimateOnScroll>

            <AnimateOnScroll
              type="fade-up"
              delay={200}
              className="text-center mt-12"
            >
              <Button
                size="lg"
                className="h-12 px-8 text-base text-white shadow-lg shadow-[#1a9e5c]/30 se-animate-shimmer-btn border-0 hover:opacity-90 transition-opacity"
                asChild
              >
                <Link href="/signup">
                  Create your free account{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Pricing ──────────────────────────────────────────── */}
        <PricingSection />

        {/* ─── Testimonials ─────────────────────────────────────── */}
        <section
          id="testimonials"
          className="relative px-4 sm:px-6 py-20 sm:py-24 border-t border-border overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-[#1a9e5c]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            <AnimateOnScroll
              type="fade-up"
              className="text-center space-y-4 mb-14"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20">
                <Star className="w-4 h-4 fill-primary" />
                Loved by UAE users
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                What our users are saying
              </h2>
              <p className="text-lg text-muted-foreground">
                Real people. Real dirhams. Real results.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll
              type="stagger"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  name: "Ahmad Al-Mansoori",
                  role: "Senior Software Engineer",
                  location: "Dubai, UAE",
                  initials: "AM",
                  color: "bg-emerald-500",
                  quote:
                    "Finally an app that actually understands UAE finances. Tracking taksit payments across three credit cards used to be a nightmare — now it takes seconds.",
                  rating: 5,
                },
                {
                  name: "Sara Al-Rashidi",
                  role: "Financial Analyst",
                  location: "Abu Dhabi, UAE",
                  initials: "SR",
                  color: "bg-blue-500",
                  quote:
                    "The invoice management feature is a game-changer. I always know exactly when my ADCB and FAB bills are due. My credit score has improved because I never miss payments now.",
                  rating: 5,
                },
                {
                  name: "Omar Khalil",
                  role: "Business Owner",
                  location: "Sharjah, UAE",
                  initials: "OK",
                  color: "bg-violet-500",
                  quote:
                    "I manage accounts for my family and personal use. The budget limits feature helped me save AED 2,000 in the first month. Absolutely recommend.",
                  rating: 5,
                },
                {
                  name: "Layla Al-Farsi",
                  role: "Marketing Manager",
                  location: "Dubai, UAE",
                  initials: "LF",
                  color: "bg-rose-500",
                  quote:
                    "The reports section showed me I was spending AED 1,500/month on dining. That was eye-opening. Now I cook more and saved enough for a Maldives trip!",
                  rating: 5,
                },
                {
                  name: "Khalid Butt",
                  role: "IT Consultant",
                  location: "Dubai Internet City",
                  initials: "KB",
                  color: "bg-amber-500",
                  quote:
                    "Simple, fast, and everything is in AED. No dealing with dollar conversions or irrelevant features. Exactly what I needed as an expat managing UAE finances.",
                  rating: 5,
                },
                {
                  name: "Rania Hassan",
                  role: "Teacher",
                  location: "Ajman, UAE",
                  initials: "RH",
                  color: "bg-teal-500",
                  quote:
                    "I used to use Excel spreadsheets. Now with Simple Expenses I spend 5 minutes a week on my finances instead of an hour. The free plan has everything I need.",
                  rating: 5,
                },
              ].map(
                ({ name, role, location, initials, color, quote, rating }) => (
                  <div
                    key={name}
                    className="bg-background border border-border rounded-2xl p-6 space-y-4 hover:shadow-[0_8px_32px_rgba(26,158,92,0.1)] hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex gap-1">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed flex-1">
                      &ldquo;{quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-2 border-t border-border">
                      <div
                        className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-offset-2 ring-offset-background ring-transparent hover:ring-primary/30 transition-all`}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {role} · {location}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────── */}
        <section
          id="faq"
          className="relative px-4 sm:px-6 py-20 sm:py-24 bg-muted/30 border-t border-border overflow-hidden"
        >
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-[#1a9e5c]/6 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto relative">
            <AnimateOnScroll
              type="fade-up"
              className="text-center space-y-4 mb-14"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20">
                Frequently Asked Questions
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Got questions? We have answers.
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-up" delay={100}>
              <div className="divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
                {[
                  {
                    q: "Is my financial data secure?",
                    a: "Absolutely. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your financial data is tied exclusively to your account and never shared with third parties, advertisers, or financial institutions. We are fully compliant with UAE PDPL data protection regulations.",
                  },
                  {
                    q: "Which UAE banks are supported?",
                    a: "Simple Expenses works with all UAE banks including ADCB, FAB, Mashreq, Emirates NBD, DIB, RAKBANK, Abu Dhabi Islamic Bank, and more. Since you enter transactions manually, it works with any bank that issues credit cards or bank accounts.",
                  },
                  {
                    q: "Is there a truly free plan — no catches?",
                    a: "Yes. Our Starter plan is permanently free with no time limits. You can track 2 credit cards, 2 bank accounts, and up to 100 transactions per month at no cost, forever. No credit card required to sign up.",
                  },
                  {
                    q: "Can I track taksit (installment) payments?",
                    a: "Yes! This is a feature we built specifically for UAE users. When adding a transaction, you can mark it as an installment purchase and specify the number of months. We automatically split the amount and track each monthly payment on your credit card bills.",
                  },
                  {
                    q: "How do I cancel my subscription?",
                    a: "You can cancel your subscription anytime from your account settings with one click. There are no cancellation fees. Your account reverts to the free Starter plan and all your data is preserved.",
                  },
                  {
                    q: "Can I export my data?",
                    a: "Data export (CSV and PDF) is available on the Premium plan. This lets you download all your transactions, reports, and invoice history for your own records or to share with an accountant.",
                  },
                ].map(({ q, a }) => (
                  <details
                    key={q}
                    className="group px-6 py-5 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <summary className="flex items-center justify-between font-semibold text-foreground list-none [&::-webkit-details-marker]:hidden gap-4">
                      <span className="text-sm sm:text-base">{q}</span>
                      <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 group-open:rotate-180 transition-transform duration-300" />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </AnimateOnScroll>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Still have questions?{" "}
              <Link
                href="/contact"
                className="text-primary font-medium hover:underline"
              >
                Contact our team →
              </Link>
            </p>
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────────────────── */}
        <section className="relative px-4 sm:px-6 py-20 sm:py-24 bg-[#1a9e5c] border-t border-[#158a4f] overflow-hidden">
          {/* Animated background orbs */}
          <div
            className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-white/8 rounded-full blur-3xl pointer-events-none"
            style={{ animation: "se-orb-drift 14s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-[350px] h-[350px] bg-black/10 rounded-full blur-3xl pointer-events-none"
            style={{
              animation: "se-orb-drift 10s ease-in-out 3s infinite reverse",
            }}
          />
          {/* Dot grid overlay */}
          <div className="absolute inset-0 se-dot-grid opacity-30 pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-6 relative">
            <AnimateOnScroll
              type="scale"
              className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mx-auto"
            >
              <Globe className="w-8 h-8 text-white" />
            </AnimateOnScroll>
            <AnimateOnScroll type="fade-up" delay={100}>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Start your financial journey today
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mt-4">
                Join hundreds of UAE residents who have taken control of their
                spending. Free forever — upgrade whenever you need more.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll
              type="fade-up"
              delay={200}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-white text-[#1a9e5c] hover:bg-white/95 font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                asChild
              >
                <Link href="/signup">
                  Create free account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent transition-all"
                asChild
              >
                <Link href="/contact">Talk to us</Link>
              </Button>
            </AnimateOnScroll>
            <p className="text-sm text-white/60">
              No credit card required · Cancel anytime · AED pricing always
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
// Inline icon component to avoid import issues
function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path d="M12 8v8M8 12h8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
