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
  HelpCircle,
  Landmark,
  LayoutDashboard,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  ShieldAlert,
  EyeOff,
  Database,
  Quote,
} from "lucide-react";
import LandingFooter from "@/components/LandingFooter";
import LandingNav from "@/components/LandingNav";
import PricingSection from "@/components/PricingSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import PersonaTabs from "@/components/PersonaTabs";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const HOME_TITLE = `Personal Finance Software for UAE Residents | ${SITE_NAME}`;
const HOME_DESCRIPTION =
  "Manage expenses, credit cards, budgets, bills and installments with personal finance management software built for UAE residents.";

export const metadata: Metadata = {
  title: {
    absolute: HOME_TITLE,
  },
  description: HOME_DESCRIPTION,
  keywords: [
    "personal finance management software UAE",
    "personal finance software UAE",
    "expense tracker UAE",
    "personal finance app UAE",
    "AED expense tracking",
    "credit card tracker UAE",
    "bank account manager UAE",
    "UAE financial app",
    "free expense tracker",
    "dirham spending tracker",
    "invoice management UAE",
    "Fixpenses",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
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

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8 sm:pb-12">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Content */}
              <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                <div className="se-hero-badge inline-flex items-center gap-2 bg-[#1a9e5c]/10 text-[#1a9e5c] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#1a9e5c]/20">
                  <Globe className="w-3.5 h-3.5" /> Built exclusively for UAE
                  residents
                </div>
                <h1 className="se-hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                  Take Control Of{" "}
                  <span className="text-[#1a9e5c] relative">
                    Every Dirham
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-[#1a9e5c]/60 via-[#1a9e5c]/30 to-transparent" />
                  </span>
                  <span className="block text-lg sm:text-xl lg:text-2xl font-semibold text-muted-foreground tracking-normal mt-2 sm:mt-3">
                    Track Expenses. Protect Your Privacy
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
                          Fixpenses
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

        {/* ─── Problem ─────────────────────────────────────────── */}
        <section className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-10 bg-muted/30 border-b border-border overflow-hidden">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="space-y-5 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-4 py-1.5 rounded-full text-sm font-semibold border border-border">
                <HelpCircle className="w-3.5 h-3.5" />
                Sound familiar?
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Where Did My Money Actually Go?
              </h2>
              <p className="!mt-2 text-lg text-muted-foreground leading-relaxed">
                You check your balance. It&apos;s lower than you expected.
                Again. Between groceries, taksit installments, subscriptions,
                and the odd Careem ride, your bank statement turns into a
                puzzle by the end of the month.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Fixpenses solves that puzzle for you. Every transaction gets
                sorted into a category the moment it happens, so instead of
                scrolling through pages of line items, you get a clear
                picture: what you spent, where, and how it compares to last
                month.
              </p>
              <p className="text-base font-semibold text-foreground border-l-2 border-[#1a9e5c] pl-4">
                No spreadsheets. No guesswork. Just a straight answer to the
                question every UAE resident asks on the 25th of the month.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left" className="relative order-1 lg:order-2">
              {/* "Confusing statement" mockup */}
              <div className="relative bg-background border border-border rounded-2xl shadow-xl p-5 max-w-sm mx-auto grayscale-[0.4] opacity-90">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Bank statement
                  </span>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="space-y-2.5">
                  {[
                    "POS-4471 CARREFOUR***",
                    "TAKSIT INSTLMT 3/6",
                    "SUBSC-APPLE.COM/BILL",
                    "CAREEM*TRIP-88213",
                    "POS-9012 UNKNOWN MER",
                    "ATM WDL FEE AED 2.10",
                  ].map((line, i) => (
                    <div
                      key={line}
                      className="flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-dashed border-border pb-2 blur-[0.4px]"
                      style={{ opacity: 1 - i * 0.08 }}
                    >
                      <span className="truncate pr-2">{line}</span>
                      <span className="shrink-0">-AED {(120 + i * 47) % 300}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>What did I actually spend on?</span>
                </div>
              </div>
              {/* Green "clarity" glow peeking behind */}
              <div className="absolute -inset-6 bg-[#1a9e5c]/10 rounded-3xl blur-2xl -z-10" />
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Value proposition ──────────────────────────────────── */}
        <section className="relative px-4 sm:px-6 pt-8 sm:pt-10 pb-8 sm:pb-10 overflow-hidden">
          {/* Subtle background accent */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#1a9e5c]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center">
            <AnimateOnScroll type="fade-up" className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#1a9e5c]/10 text-[#1a9e5c] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#1a9e5c]/20">
                <Lock className="w-3.5 h-3.5" />
                No Bank Login Required
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Track Every Dirham Without Handing Over Your Bank Login
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fixpenses gives you one clean view of your spending, budgets,
                and savings, built specifically for how people manage money
                in the UAE. Add your cards, set your limits, and see exactly
                where your money goes, all inside a dashboard your partner
                can share and no one else can touch.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll
              type="stagger"
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 text-left"
            >
              {[
                {
                  icon: Shield,
                  text: "No bank credentials ever shared — you add balances yourself",
                },
                {
                  icon: Users,
                  text: "Share with your partner. No one else can touch it",
                },
                {
                  icon: Zap,
                  text: "See your first spending snapshot in minutes",
                },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-[#1a9e5c]/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#1a9e5c]" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">
                    {text}
                  </p>
                </div>
              ))}
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-up" className="mt-6">
              <Button
                size="lg"
                className="h-12 px-8 text-base text-white shadow-lg shadow-[#1a9e5c]/30 border-0 hover:opacity-90 transition-opacity"
                asChild
              >
                <Link href="/signup">
                  Start free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Features ────────────────────────────────────────── */}
        <section
          id="features"
          className="relative px-4 sm:px-6 pt-8 sm:pt-10 pb-8 sm:pb-10 overflow-hidden"
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
                Your Full Financial Picture, In One Place
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

        {/* ─── Unified dashboard ──────────────────────────────────── */}
        <section className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-8 sm:pb-10 border-t border-border overflow-hidden">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="relative">
              {/* Converging accounts visual */}
              <div className="relative max-w-sm mx-auto">
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  {["ADCB", "Emirates NBD", "Mashreq", "FAB", "RAKBANK"].map(
                    (bank) => (
                      <span
                        key={bank}
                        className="inline-flex items-center gap-1.5 bg-background border border-border rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm"
                      >
                        <Landmark className="w-3 h-3 text-[#1a9e5c]" />
                        {bank}
                      </span>
                    ),
                  )}
                </div>
                <div className="flex justify-center py-2">
                  <div className="w-px h-8 bg-gradient-to-b from-border to-[#1a9e5c]/60" />
                </div>
                <div className="relative bg-background border border-[#1a9e5c]/30 rounded-2xl shadow-xl p-6 text-center">
                  <div className="absolute inset-0 bg-[#1a9e5c]/8 rounded-2xl blur-2xl -z-10 scale-105" />
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#1a9e5c] flex items-center justify-center shadow-lg shadow-[#1a9e5c]/30 mb-3">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-foreground">
                    Your Fixpenses Dashboard
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Every account, one screen
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left" className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-[#1a9e5c]/10 text-[#1a9e5c] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#1a9e5c]/20">
                <Landmark className="w-3.5 h-3.5" />
                Every account, one screen
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                One Secure Dashboard For All Your Bank Accounts
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stop switching between five different banking apps to see
                where you stand. Fixpenses pulls your accounts into one
                dashboard, so your bank balance, your credit card due date,
                and your savings goal all sit on the same screen.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                You see the full picture the moment you log in, not after
                piecing it together from five separate app notifications.
                Your data stays encrypted and isolated to you alone, so the
                convenience never costs you privacy.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── How it works ─────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="relative px-4 sm:px-6 pt-10 sm:pt-14 pb-6 sm:pb-8 bg-muted/30 border-t border-border overflow-hidden"
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
                Three Steps To Financial Clarity
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
                  title: "Create Your Account",
                  desc: "Sign up in seconds with email or GitHub. No credit card needed. Your account is ready instantly.",
                },
                {
                  step: "2",
                  icon: CreditCard,
                  title: "Add Your Cards & Accounts",
                  desc: "Add your UAE credit cards and bank accounts manually. Set balances, bill dates, and limits.",
                },
                {
                  step: "3",
                  icon: BarChart3,
                  title: "Start Tracking",
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

        {/* ─── Who it's for ────────────────────────────────────── */}
        <section className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8 border-t border-border overflow-hidden">
          <div className="max-w-5xl mx-auto relative">
            <AnimateOnScroll
              type="fade-up"
              className="text-center space-y-4 mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20">
                <Users className="w-4 h-4" />
                Built to flex
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Fixpenses For Everyone — Not Just Individuals & Families
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Fixpenses works the same way regardless of who&apos;s using
                it — one login, one dashboard, adjusted to fit your
                situation.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-up" delay={100}>
              <PersonaTabs />
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Pricing ──────────────────────────────────────────── */}
        <PricingSection />

        {/* ─── Security & privacy ─────────────────────────────────── */}
        <section className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1a9e5c]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto relative">
            <AnimateOnScroll
              type="fade-up"
              className="text-center space-y-4 mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-[#1a9e5c]/10 text-[#1a9e5c] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#1a9e5c]/20">
                <ShieldCheck className="w-4 h-4" />
                Security & Privacy
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Your Data Is Protected & Private
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Money data is personal. Fixpenses is built to protect it at
                every layer, not as an afterthought.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll
              type="stagger"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(160px,auto)] gap-4"
            >
              <div className="sm:col-span-2 lg:col-span-2 bg-background border border-border rounded-2xl p-7 hover:border-[#1a9e5c]/40 hover:shadow-[0_8px_40px_rgba(26,158,92,0.12)] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-[#1a9e5c]" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">
                  AES-256 Encryption
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your data gets encrypted with AES-256, the same standard
                  banks and governments use to protect sensitive records.
                  Whether it&apos;s sitting in storage or moving between
                  your device and the server, it stays unreadable to
                  anyone but you.
                </p>
              </div>

              <div className="bg-background border border-border rounded-2xl p-6 hover:border-[#1a9e5c]/40 hover:shadow-[0_8px_40px_rgba(26,158,92,0.12)] transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center mb-3">
                  <Fingerprint className="w-5 h-5 text-[#1a9e5c]" />
                </div>
                <h3 className="font-bold text-foreground mb-1.5">
                  Secure Password Hashing
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your password never gets stored as plain text, anywhere,
                  ever. It&apos;s hashed before it touches a database, so
                  your actual password stays out of reach even in a breach
                  elsewhere.
                </p>
              </div>

              <div className="bg-background border border-border rounded-2xl p-6 hover:border-[#1a9e5c]/40 hover:shadow-[0_8px_40px_rgba(26,158,92,0.12)] transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center mb-3">
                  <ShieldAlert className="w-5 h-5 text-[#1a9e5c]" />
                </div>
                <h3 className="font-bold text-foreground mb-1.5">
                  Brute-Force Protection
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Repeated failed login attempts get blocked automatically.
                  Someone guessing your password gets locked out long
                  before they get close.
                </p>
              </div>

              <div className="bg-background border border-border rounded-2xl p-6 hover:border-[#1a9e5c]/40 hover:shadow-[0_8px_40px_rgba(26,158,92,0.12)] transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center mb-3">
                  <EyeOff className="w-5 h-5 text-[#1a9e5c]" />
                </div>
                <h3 className="font-bold text-foreground mb-1.5">
                  Zero Credential Storage
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fixpenses never asks for your online banking username or
                  password, and never stores one. You add account details
                  manually, on your terms.
                </p>
              </div>

              <div className="bg-background border border-border rounded-2xl p-6 hover:border-[#1a9e5c]/40 hover:shadow-[0_8px_40px_rgba(26,158,92,0.12)] transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center mb-3">
                  <Database className="w-5 h-5 text-[#1a9e5c]" />
                </div>
                <h3 className="font-bold text-foreground mb-1.5">
                  Complete Data Isolation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your financial data lives in its own isolated space,
                  separate from every other user&apos;s. No shared access,
                  no cross-account visibility.
                </p>
              </div>

              <div className="sm:col-span-2 lg:col-span-2 bg-[#1a9e5c] rounded-2xl p-7 flex flex-col justify-center">
                <h3 className="font-bold text-lg text-white mb-2">
                  Why Privacy Matters
                </h3>
                <p className="text-sm text-white/85 leading-relaxed">
                  Your spending habits say a lot about your life — your
                  income, your relationships, your plans. That&apos;s
                  exactly why Fixpenses treats privacy as the foundation,
                  not a feature. You get full visibility into your own
                  money, and no one else gets a window into it.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Testimonials ─────────────────────────────────────── */}
        <section
          id="testimonials"
          className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8 border-t border-border overflow-hidden"
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
                What Our Users Are Saying
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
                    "I used to use Excel spreadsheets. Now with Fixpenses I spend 5 minutes a week on my finances instead of an hour. The free plan has everything I need.",
                  rating: 5,
                },
              ].map(
                ({ name, role, location, initials, color, quote, rating }) => (
                  <div
                    key={name}
                    className="relative bg-background border border-border rounded-2xl p-6 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(26,158,92,0.1)] hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    <Quote className="absolute -top-2 -right-2 w-16 h-16 text-primary/5 rotate-12" />
                    <div className="flex gap-1 relative">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed flex-1 relative">
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
          className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8 bg-muted/30 border-t border-border overflow-hidden"
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
                Got Questions? We Have Answers.
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-up" delay={100}>
              <div className="divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
                {[
                  {
                    q: "Do I Need To Connect My Bank Login?",
                    a: "No. Fixpenses never asks for your online banking username or password. You add your accounts and cards manually, so your bank credentials never leave your hands.",
                  },
                  {
                    q: "Is My Financial Data Secure?",
                    a: "Yes. Your data is protected with AES-256 encryption, held in complete isolation from every other user, and never shared or sold. Security runs through every layer of the app, not just the login screen.",
                  },
                  {
                    q: "Which Banks Does It Support?",
                    a: "Fixpenses works with any UAE bank account you add manually, so you're not limited to a fixed list of supported institutions. If you bank in the UAE, you can track it.",
                  },
                  {
                    q: "Can I Track Taksit Payments?",
                    a: "Yes. Add your installment plan once, and Fixpenses tracks what's due and when, so a taksit payment never catches you off guard.",
                  },
                  {
                    q: "How Much Does It Cost?",
                    a: "You can start for free and track your spending, budgets, and accounts without paying anything. Paid plans exist for people who want deeper reporting or multiple linked accounts, but the core app costs nothing to use.",
                  },
                  {
                    q: "Is There A Truly Free Plan?",
                    a: "Yes, and it's not a time-limited trial. The free plan covers real tracking and budgeting, not a stripped-down demo designed to expire.",
                  },
                  {
                    q: "Can I Export My Data?",
                    a: "Yes. Your data belongs to you, so you can export it whenever you want, in a format you can actually use elsewhere.",
                  },
                ].map(({ q, a }) => (
                  <details
                    key={q}
                    className="group px-6 py-5 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <summary className="flex items-center justify-between font-semibold text-foreground list-none [&::-webkit-details-marker]:hidden gap-4">
                      <h3 className="text-sm sm:text-base">{q}</h3>
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
        <section className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8 bg-[#1a9e5c] border-t border-[#158a4f] overflow-hidden">
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
                Start Your Financial Journey Today
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
