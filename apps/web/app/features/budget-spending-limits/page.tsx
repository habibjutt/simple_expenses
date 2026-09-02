import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Target,
  Bell,
  BellRing,
  TrendingDown,
  Wallet,
  Tags,
  BarChart3,
  CalendarClock,
  Sun,
  ShieldCheck,
  RefreshCw,
  Workflow,
  Layers,
  PiggyBank,
  Gauge,
  LineChart,
  Repeat,
  Quote,
  Landmark,
  Sliders,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Set Spending Limits and Track Your Budget with Fixpenses",
  description:
    "Set daily, monthly, and category spending limits in Fixpenses. Get alerts before you overspend and stay on budget. Set your app in just 1 minute and 3 simple steps.",
  keywords: [
    "spending limits UAE",
    "budget tracker UAE",
    "monthly budget app UAE",
    "overspending alerts UAE",
    "category budget UAE",
    "personal budget AED",
    "budgeting software UAE",
    "spending limit alerts",
  ],
  alternates: {
    canonical: `${SITE_URL}/features/budget-spending-limits`,
  },
  openGraph: {
    title: "Set Spending Limits and Track Your Budget with Fixpenses",
    description:
      "Set daily, monthly, and category spending limits in Fixpenses. Get alerts before you overspend and stay on budget. Set your app in just 1 minute and 3 simple steps.",
    url: `${SITE_URL}/features/budget-spending-limits`,
  },
};

const LIMIT_FLOW = [
  { icon: Target, label: "Set a category limit" },
  { icon: Gauge, label: "Spend tracked live" },
  { icon: Bell, label: "Alerted at 80%" },
  { icon: ShieldCheck, label: "Stay under budget" },
];

const MANUAL_PAINS = [
  "You find out you overspent after the money's gone",
  "Category limits live in a spreadsheet nobody updates",
  "No warning until the bank balance says so",
];

const FIXPENSES_WINS = [
  "See exactly how much of each limit is left, live",
  "Get alerted the moment you're close to a threshold",
  "Every category stays in check without checking manually",
];

const SWITCH_REASONS = [
  {
    icon: Bell,
    title: "Alerts Before You Overspend",
    desc: "Get notified at 80% of a limit, not after you've blown through it — so there's still time to pull back.",
    big: true,
  },
  {
    icon: Tags,
    title: "Per-Category Control",
    desc: "Dining, transport, subscriptions — set a different limit for each one.",
  },
  {
    icon: TrendingDown,
    title: "Spend Less Over Time",
    desc: "Visible limits change behavior — most people cut overspending within the first month.",
  },
];

const DAILY_USE = [
  {
    icon: Target,
    title: "Set Limits for Every Category in Seconds",
    desc: "Building a budget from scratch every month is where most people give up. Fixpenses lets you set a monthly limit per category once, and it carries forward automatically, so budgeting stops being a recurring chore.",
  },
  {
    icon: Gauge,
    title: "Watch Your Progress Bar Update in Real Time",
    desc: "Wondering how much of your dining budget is left shouldn't mean opening a calculator. Every transaction updates your progress bar instantly, so the answer is always one glance away.",
  },
  {
    icon: Bell,
    title: "Get Alerted Before You Cross the Line",
    desc: "Finding out you're over budget at month-end is too late to do anything about it. Fixpenses sends an alert the moment you hit 80% of a limit, so you can adjust while it still matters.",
  },
  {
    icon: TrendingDown,
    title: "Spot Spending Trends Before They Become Habits",
    desc: "A one-off big month is easy to miss without a record to compare against. Fixpenses tracks every category month over month, so a creeping trend shows up clearly instead of staying invisible.",
  },
  {
    icon: Wallet,
    title: "Separate Budgets for Cards & Accounts",
    desc: "Spending on a credit card behaves differently from spending out of a bank account. Fixpenses lets you set limits separately for each, so a card payoff doesn't distort what your account budget actually looks like.",
  },
  {
    icon: RefreshCw,
    title: "Adjust Limits Anytime, No Reset Required",
    desc: "Life changes, and rigid budgets break the moment it does. Fixpenses lets you edit any limit mid-month without losing your history, so your budget adapts instead of falling apart.",
  },
];

const PILLARS = [
  {
    icon: Gauge,
    title: "Real-Time Limit Tracking",
    desc: "Fixpenses updates every budget the instant a transaction lands, so what you see is always current, never a stale end-of-month estimate.",
  },
  {
    icon: Layers,
    title: "Built for AED, Category by Category",
    desc: "Set limits in AED for every category you actually spend in, from groceries to SaaS subscriptions, without converting or guessing.",
  },
  {
    icon: Workflow,
    title: "Connected to Your Transactions",
    desc: "Budgets pull straight from your tracked expenses, so nothing needs to be logged twice or reconciled separately at month-end.",
  },
  {
    icon: ShieldCheck,
    title: "Private, Secure & Always Available",
    desc: "Your budgets and spending data stay protected in the cloud and accessible whenever you need to check them, from any device.",
  },
];

const STEPS = [
  {
    number: "01",
    icon: Tags,
    title: "Pick a Category & Set a Limit",
    desc: "Choose any category, from Dining to Transport to Subscriptions, and set a monthly AED limit. It takes seconds and applies immediately.",
  },
  {
    number: "02",
    icon: Gauge,
    title: "Track Spend Automatically",
    desc: "Every transaction that hits a budgeted category updates your progress bar in real time, no manual entry or reconciliation needed.",
  },
  {
    number: "03",
    icon: Bell,
    title: "Get Alerted & Adjust",
    desc: "Fixpenses alerts you at 80% of any limit, so you can course-correct with time to spare instead of finding out at month-end.",
  },
];

const TRACKABLES = [
  {
    icon: BarChart3,
    title: "Category-by-Category Budgets",
    desc: "Set and track a separate limit for every category you spend in, from groceries to entertainment, all in one place.",
  },
  {
    icon: LineChart,
    title: "Month-Over-Month Trends",
    desc: "Compare this month's spending against previous months automatically, so patterns show up before they become a problem.",
  },
  {
    icon: PiggyBank,
    title: "Savings Goals Alongside Budgets",
    desc: "Track what you're saving toward at the same time as what you're spending, so the two always stay in view together.",
  },
  {
    icon: Repeat,
    title: "Recurring Spend Within Limits",
    desc: "Recurring charges and subscriptions count against the right budget automatically, so a forgotten renewal doesn't blow a limit unnoticed.",
  },
];

const LIMIT_TIERS = [
  {
    icon: Sun,
    title: "Daily Limit",
    tagline: "Catches the small stuff",
    desc: "A daily cap for everyday purchases — the coffee runs and quick orders that rarely feel like much on their own but add up fast across a week.",
    example: "e.g. AED 150 / day",
  },
  {
    icon: CalendarClock,
    title: "Monthly Limit",
    tagline: "Keeps the big picture in check",
    desc: "A monthly cap for your overall budget — rent, bills, and larger planned expenses tracked against the total you're comfortable spending.",
    example: "e.g. AED 6,000 / month",
  },
];

const ALERT_NOTIFICATIONS = [
  {
    label: "Dining · Approaching limit",
    detail: "You've used 80% of your AED 1,000 budget",
    tint: "amber",
  },
  {
    label: "Daily spend · Limit reached",
    detail: "You've hit your AED 150 daily cap",
    tint: "rose",
  },
  {
    label: "Transport · On track",
    detail: "45% used with 12 days left in the month",
    tint: "green",
  },
];

const LIMIT_COMPARISON = [
  {
    row: "Set by",
    bank: "Your bank",
    fixpenses: "You",
  },
  {
    row: "Protects",
    bank: "The lender's risk",
    fixpenses: "Your budget",
  },
  {
    row: "Applies to",
    bank: "One card",
    fixpenses: "Every connected account",
  },
  {
    row: "Works without a credit card",
    bank: false,
    fixpenses: true,
  },
];

const FAQS = [
  {
    icon: Sun,
    q: "How Do I Set A Daily Spending Limit In Fixpenses?",
    a: "Open the Limits tab, choose Daily, and enter your number. Fixpenses applies it to every transaction from that point on.",
  },
  {
    icon: Tags,
    q: "Can I Set Different Limits Per Category?",
    a: "Yes. You can set separate limits for categories like dining, subscriptions, or transport, alongside your daily and monthly limits.",
  },
  {
    icon: BellRing,
    q: "What Happens When I Hit My Spending Limit?",
    a: "Fixpenses sends an alert when you're close to the limit and again when you reach it, so you know before your next purchase pushes you over.",
  },
  {
    icon: Landmark,
    q: "Is This Different From A Credit Card Limit?",
    a: "Yes. A credit card limit is set by your bank and caps what you can borrow. A Fixpenses spending limit is set by you and caps what you choose to spend, across any account.",
  },
];

function InlineCta({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-start gap-1.5 text-sm font-semibold text-[#1a9e5c] hover:text-[#158a4f] transition-colors"
    >
      <span className="underline decoration-[#1a9e5c]/30 underline-offset-4 group-hover:decoration-[#1a9e5c]">
        {label}
      </span>
      <ArrowRight className="w-4 h-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function BudgetSpendingLimitsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* ─── Hero ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden se-dot-grid">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a9e5c]/10 via-background to-background pointer-events-none" />
          <div
            className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-[#1a9e5c]/10 rounded-full blur-3xl pointer-events-none"
            style={{ animation: "se-orb-drift 12s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-[360px] h-[360px] bg-[#1a9e5c]/7 rounded-full blur-3xl pointer-events-none"
            style={{
              animation: "se-orb-drift 16s ease-in-out 4s infinite reverse",
            }}
          />

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8 sm:pb-10 text-center space-y-6">
            <span className="se-hero-badge inline-flex items-center gap-2 bg-[#1a9e5c]/10 text-[#1a9e5c] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#1a9e5c]/20">
              Budgets &amp; Spending Limits &middot; Start Today
            </span>
            <h1 className="se-hero-title text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Stop Overspending Before It{" "}
              <span className="text-[#1a9e5c] relative">
                Happens
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-[#1a9e5c]/60 via-[#1a9e5c]/30 to-transparent" />
              </span>
            </h1>
            <p className="se-hero-desc text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Set monthly spending limits per category and watch your usage
              update in real time. Fixpenses alerts you before you cross the
              line, not after.
            </p>
            <div className="se-hero-btns flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base text-white shadow-lg shadow-[#1a9e5c]/30 se-animate-shimmer-btn border-0 hover:opacity-90 transition-opacity"
                asChild
              >
                <Link href="/signup">
                  Set your first budget <ArrowRight className="ml-2 h-4 w-4" />
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
          </div>
        </section>

        {/* ─── Editorial intro ─────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <AnimateOnScroll type="fade-up">
            <div className="grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start">
              <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3">
                <span className="text-6xl sm:text-7xl font-extrabold text-[#1a9e5c]/15 leading-none select-none">
                  &ldquo;
                </span>
                <div className="hidden sm:block w-10 h-px bg-[#1a9e5c]/30" />
              </div>
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Budgets &amp; Spending Limits: Fixpenses Expense Tracker
                  App
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Every budget eventually meets the same test: what happens
                  when spending gets close to the edge. Fixpenses turns that
                  moment into a decision instead of a surprise.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Set your spending limits once, and Fixpenses checks every
                  transaction against them automatically.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* ─── Emphasis strip ──────────────────────────────────── */}
        <section className="border-y border-border bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center relative">
            <Quote className="w-8 h-8 text-[#1a9e5c]/20 mx-auto mb-2" />
            <AnimateOnScroll type="fade-up">
              <p className="text-xl sm:text-2xl font-semibold text-foreground leading-snug">
                Stop finding out you overspent when the bank balance tells
                you. Fixpenses tracks every limit in real time, alerts you at{" "}
                <span className="text-[#1a9e5c]">80% before you cross it</span>
                , and keeps every category in check without a single manual
                check-in.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── What Are Budgets & Spending Limits? ────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                What Are Budgets &amp; Spending Limits in Fixpenses?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A spending limit is a cap you set on how much leaves your
                account in a given period, daily, weekly, or monthly. Once
                that cap is in place, you decide in advance how much
                you&apos;re comfortable spending, instead of checking your
                balance afterward to see what&apos;s left.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                That&apos;s the real difference. A bank balance tells you
                what happened. A spending limit works before that: it flags
                the moment you&apos;re close to your cap, so you can pause
                and decide if the purchase is worth it right then.
                Fixpenses replaces the guesswork of &quot;how much have I
                spent so far&quot; with a limit you set once per category,
                so you always know where you stand in AED.
              </p>
              <InlineCta
                href="/signup"
                label="Set your first spending limit in Fixpenses. It takes under a minute."
              />
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left">
              <div className="bg-muted/30 border border-border rounded-3xl p-8">
                <div className="relative pl-2">
                  <div className="absolute left-[27px] top-3 bottom-3 w-px bg-gradient-to-b from-[#1a9e5c]/50 via-[#1a9e5c]/30 to-transparent" />
                  <div className="space-y-6">
                    {LIMIT_FLOW.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-4">
                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-background border-2 border-[#1a9e5c]/30 flex items-center justify-center relative z-10">
                          <Icon className="w-6 h-6 text-[#1a9e5c]" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Digital vs Manual comparison ───────────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <AnimateOnScroll
              type="fade-up"
              className="text-center max-w-2xl mx-auto space-y-4 mb-6"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Guessing vs. Tracked Budgets: Which Costs You More?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A budget in your head, or scattered across a notes app, looks
                fine until the month you go over without noticing.
                Fixpenses keeps every limit live, so overspending gets caught
                while there&apos;s still time to fix it, not after the fact.
              </p>
            </AnimateOnScroll>

            <div className="relative grid sm:grid-cols-2 gap-5 sm:gap-0 sm:rounded-3xl sm:overflow-hidden sm:border sm:border-border">
              <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-background border-2 border-border items-center justify-center font-bold text-xs text-muted-foreground shadow-md">
                VS
              </div>

              <AnimateOnScroll
                type="fade-right"
                className="bg-background sm:bg-muted/40 rounded-2xl sm:rounded-none border border-border sm:border-0 p-8"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                  Guessing &amp; Mental Math
                </p>
                <ul className="space-y-4">
                  {MANUAL_PAINS.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </AnimateOnScroll>

              <AnimateOnScroll
                type="fade-left"
                className="bg-[#1a9e5c]/5 rounded-2xl sm:rounded-none border border-[#1a9e5c]/20 sm:border-0 p-8"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] mb-5">
                  Fixpenses
                </p>
                <ul className="space-y-4">
                  {FIXPENSES_WINS.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#1a9e5c] shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── Why spending limits matter (callout) ───────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
          <AnimateOnScroll
            type="fade-up"
            className="rounded-2xl border border-border bg-muted/30 border-l-4 border-l-[#1a9e5c] p-6 sm:p-8"
          >
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">
              Why Spending Limits Matter for Personal Finance Management
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              A budget only works if something enforces it. Most people
              build one, list categories, set numbers, and then rely on
              memory and willpower to stay inside them. That works for a
              week or two. Then a busy month arrives and the numbers
              quietly slip. A spending limit removes that gap — instead of
              relying on memory, it checks every transaction against your
              number in real time, so the budget you set stays the budget
              you actually follow. Over a few months, that consistency
              compounds: categories stay funded, savings goals stay on
              track, and surprise shortfalls become rare instead of
              routine.
            </p>
          </AnimateOnScroll>
        </section>

        {/* ─── Why people switch (bento) ──────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <AnimateOnScroll
            type="fade-up"
            className="text-center max-w-2xl mx-auto space-y-4 mb-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Why People Switch to Real-Time Budgets
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A limit only helps if you see it before you cross it. These are
              the three reasons people stop budgeting on paper and start
              budgeting in Fixpenses.
            </p>
          </AnimateOnScroll>

          <div className="space-y-5">
            {SWITCH_REASONS.filter((r) => r.big).map(({ icon: Icon, title, desc }) => (
              <AnimateOnScroll type="fade-up" key={title}>
                <div className="rounded-3xl border border-border bg-background p-8 flex flex-col sm:flex-row items-center gap-8 hover:border-[#1a9e5c]/30 hover:shadow-lg transition-all">
                  <div className="relative w-28 h-28 shrink-0">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full -rotate-90"
                      aria-hidden="true"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="9"
                        className="text-[#1a9e5c]/12"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray="211 264"
                        className="text-[#1a9e5c]"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-foreground">
                        80%
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        alert point
                      </span>
                    </div>
                  </div>

                  <div className="text-center sm:text-left">
                    <div className="w-11 h-11 rounded-2xl bg-[#1a9e5c]/10 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                      <Icon className="w-5 h-5 text-[#1a9e5c]" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1.5">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                      {desc}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}

            <AnimateOnScroll
              type="stagger"
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {SWITCH_REASONS.filter((r) => !r.big).map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-border bg-background p-8 flex flex-col justify-center hover:border-[#1a9e5c]/30 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#1a9e5c]/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[#1a9e5c]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Live progress showcase ──────────────────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimateOnScroll type="fade-right" className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Know Where You Stand, in Every Category
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    A budget you have to calculate isn&apos;t a budget you&apos;ll
                    actually check. Fixpenses shows a live progress bar for
                    every category, so &quot;how much do I have left for
                    dining this month&quot; is answered the moment you open
                    the app, not after adding up receipts.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground">
                    Built for Households &amp; Individuals Alike
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Fixpenses works the same way whether it&apos;s one person
                    managing their own spending or a household tracking
                    shared expenses. Limits update instantly for everyone who
                    can see them, so nobody finds out a budget is blown after
                    the fact.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground">
                    How Fixpenses Works as Your Budget &amp; Expenditure
                    Tracker
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Fixpenses tracks every transaction as it happens and
                    checks it against the spending limits you&apos;ve set
                    for each category. You connect your accounts and set
                    your numbers, daily, monthly, or per category, and
                    Fixpenses does the checking for you. Each expense gets
                    logged automatically and matched to a category, so your
                    budget stays current without manual entry, and when
                    you&apos;re close to a limit, you hear about it before
                    the next purchase pushes you over it, not after your
                    statement arrives.
                  </p>
                  <InlineCta
                    href="/signup"
                    label="Set up your first budget in Fixpenses and see your spending limits in action from day one."
                  />
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll type="fade-left" className="flex justify-center">
                <div className="relative w-full max-w-[280px]">
                  <div className="absolute inset-0 bg-[#1a9e5c]/15 rounded-[2.5rem] blur-2xl scale-95 se-animate-pulse-glow" />
                  <div className="relative bg-background border-[6px] border-foreground/90 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <div className="bg-[#1a9e5c] px-4 py-3 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-semibold">
                        This month&apos;s budgets
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      {[
                        { label: "Dining", used: 72, amount: "AED 720 / 1,000" },
                        { label: "Transport", used: 45, amount: "AED 450 / 1,000" },
                      ].map(({ label, used, amount }) => (
                        <div key={label} className="bg-muted rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-foreground">
                              {label}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {amount}
                            </p>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                            <div
                              className={`h-full rounded-full ${used >= 80 ? "bg-amber-500" : "bg-[#1a9e5c]"}`}
                              style={{ width: `${used}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#1a9e5c] pt-1">
                        <RefreshCw className="w-3 h-3" />
                        Updating in real time
                      </div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── Daily vs Monthly limits (split tiles) ──────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <AnimateOnScroll
            type="fade-up"
            className="text-center max-w-2xl mx-auto space-y-4 mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Set Spending Limits in Fixpenses: Daily, Monthly
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Fixpenses lets you set spending limits at two levels that
              cover most of what you spend day to day, a daily cap for
              everyday purchases and a monthly cap for your overall budget.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll
            type="stagger"
            className="grid sm:grid-cols-2 rounded-3xl border border-border overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border"
          >
            {LIMIT_TIERS.map(({ icon: Icon, title, tagline, desc, example }) => (
              <div key={title} className="bg-background p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#1a9e5c]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{title}</h3>
                    <p className="text-xs text-[#1a9e5c] font-medium">
                      {tagline}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
                <span className="inline-block text-xs font-semibold text-foreground bg-muted rounded-full px-3 py-1">
                  {example}
                </span>
              </div>
            ))}
          </AnimateOnScroll>

          <AnimateOnScroll type="fade-up" className="text-center mt-6">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-3">
              Changing either limit takes a few taps, and Fixpenses applies
              the new number to every transaction from that point on.
            </p>
            <div className="flex justify-center">
              <InlineCta
                href="/signup"
                label="Set your daily and monthly limits now, and let Fixpenses handle the tracking from there."
              />
            </div>
          </AnimateOnScroll>
        </section>

        {/* ─── Expense limit alerts (notification stack) ──────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimateOnScroll
                type="fade-right"
                className="order-2 lg:order-1 relative h-72 sm:h-80"
              >
                {ALERT_NOTIFICATIONS.map(({ label, detail, tint }, i) => {
                  const tintClasses =
                    tint === "amber"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : tint === "rose"
                        ? "border-rose-500/30 bg-rose-500/5"
                        : "border-[#1a9e5c]/30 bg-[#1a9e5c]/5";
                  const dotClasses =
                    tint === "amber"
                      ? "bg-amber-500"
                      : tint === "rose"
                        ? "bg-rose-500"
                        : "bg-[#1a9e5c]";
                  const rotations = ["-rotate-3", "rotate-2", "-rotate-1"];
                  const offsets = ["top-0 left-0", "top-16 left-8 sm:left-12", "top-32 left-2 sm:left-4"];
                  return (
                    <div
                      key={label}
                      className={`absolute w-[85%] sm:w-[75%] rounded-2xl border ${tintClasses} ${rotations[i]} ${offsets[i]} bg-background shadow-lg p-4 transition-transform hover:rotate-0 hover:scale-[1.03]`}
                      style={{ zIndex: i + 1 }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${dotClasses}`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">
                            {label}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </AnimateOnScroll>

              <AnimateOnScroll
                type="fade-left"
                className="order-1 lg:order-2 space-y-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                  <BellRing className="w-5 h-5 text-[#1a9e5c]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Expense Limit Alerts: Get Notified Before You Overspend
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  An expense limit only helps if you know about it before
                  you overspend, not after. Fixpenses sends an alert when
                  you&apos;re approaching a limit, typically at 80% and
                  again when you reach it, so you have a chance to adjust
                  before the number tips over.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Alerts arrive as push notifications, so you see them at
                  the moment they matter, right before a purchase, not
                  buried in an email a week later. You choose which limits
                  trigger an alert and how early you want the warning, so
                  the alerts match how you actually spend rather than a
                  fixed default.
                </p>
                <InlineCta
                  href="/signup"
                  label="Turn on expense limit alerts in Fixpenses so every spending decision comes with a heads-up, not a surprise."
                />
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── Daily-use capability timeline ──────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <AnimateOnScroll
            type="fade-up"
            className="text-center max-w-2xl mx-auto space-y-3 mb-10"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              Built for daily use
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Budgeting That Keeps Up With You
            </h2>
          </AnimateOnScroll>

          <div className="relative pl-12 sm:pl-16">
            <div className="absolute left-5 sm:left-7 top-2 bottom-2 w-px bg-gradient-to-b from-[#1a9e5c]/60 via-[#1a9e5c]/30 to-transparent" />
            {DAILY_USE.map(({ icon: Icon, title, desc }, i) => (
              <AnimateOnScroll
                key={title}
                type={i % 2 === 0 ? "fade-left" : "fade-right"}
                className="relative pb-12 last:pb-0"
              >
                <div className="absolute -left-12 sm:-left-16 top-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background border-2 border-[#1a9e5c] flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a9e5c]" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        {/* ─── Why people choose us (pillar strip) ────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <AnimateOnScroll
              type="fade-up"
              className="text-center max-w-2xl mx-auto space-y-4 mb-6"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Why People Choose Our Budgeting Software
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Fixpenses budgets aren&apos;t a separate tool bolted onto
                your expense tracking — they run on the same live data, so
                every limit reflects reality the instant a transaction
                happens.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll
              type="stagger"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y divide-border sm:divide-y-0 lg:divide-x rounded-3xl border border-border bg-background overflow-hidden"
            >
              {PILLARS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1a9e5c]/10 flex items-center justify-center mx-auto">
                    <Icon className="w-6 h-6 text-[#1a9e5c]" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">
                    {title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── How it works (3 steps) ──────────────────────────── */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <AnimateOnScroll
            type="fade-up"
            className="text-center max-w-2xl mx-auto space-y-4 mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              How Budgets &amp; Spending Limits Work
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Setting up your first budget takes three simple steps, and it
              starts tracking against your real transactions immediately.
            </p>
          </AnimateOnScroll>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px border-t-2 border-dashed border-[#1a9e5c]/25" />
            {STEPS.map(({ number, icon: Icon, title, desc }) => (
              <AnimateOnScroll
                key={number}
                type="fade-up"
                className="relative text-center space-y-4"
              >
                <div className="relative mx-auto w-16 h-16 mt-4">
                  <span className="absolute -top-7 -left-5 text-6xl font-extrabold text-[#1a9e5c]/10 select-none leading-none pointer-events-none">
                    {number}
                  </span>
                  <div className="relative w-16 h-16 rounded-2xl bg-background border-2 border-[#1a9e5c] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#1a9e5c]" />
                  </div>
                </div>
                <h3 className="font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {desc}
                </p>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        {/* ─── Everything you can budget (dark grid) ──────────── */}
        <section className="bg-[#0f1f17]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <AnimateOnScroll
              type="fade-up"
              className="text-center max-w-2xl mx-auto space-y-4 mb-6"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Everything You Can Budget With Our Software
              </h2>
              <p className="text-white/70 leading-relaxed">
                Fixpenses gives you one system to set and track every kind of
                spending limit, so nothing runs unchecked and nothing needs a
                separate spreadsheet.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll
              type="stagger"
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {TRACKABLES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#22d47a]" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Spending Limits vs Credit Card Limits (table) ──── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <AnimateOnScroll
            type="fade-up"
            className="text-center max-w-2xl mx-auto space-y-4 mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Spending Limits vs. Credit Card Limits: What&apos;s the
              Difference
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A credit card limit is set by your bank and caps how much you
              can borrow. A spending limit in Fixpenses is set by you and
              caps how much you choose to spend, regardless of which card
              or account the money comes from.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll
            type="fade-up"
            className="rounded-2xl border border-border overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[480px]">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="text-left font-semibold text-muted-foreground px-5 py-3 w-1/3">
                      &nbsp;
                    </th>
                    <th className="text-left font-semibold text-foreground px-5 py-3">
                      <span className="inline-flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-muted-foreground" />
                        Credit Card Limit
                      </span>
                    </th>
                    <th className="text-left font-semibold text-[#1a9e5c] px-5 py-3 bg-[#1a9e5c]/5">
                      <span className="inline-flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#1a9e5c]" />
                        Fixpenses Spending Limit
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LIMIT_COMPARISON.map(({ row, bank, fixpenses }) => (
                    <tr key={row} className="border-t border-border">
                      <td className="px-5 py-4 font-medium text-foreground">
                        {row}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {typeof bank === "boolean" ? (
                          bank ? (
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground/50" />
                          )
                        ) : (
                          bank
                        )}
                      </td>
                      <td className="px-5 py-4 text-foreground bg-[#1a9e5c]/5">
                        {typeof fixpenses === "boolean" ? (
                          fixpenses ? (
                            <CheckCircle2 className="w-4 h-4 text-[#1a9e5c]" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground/50" />
                          )
                        ) : (
                          fixpenses
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll type="fade-up" className="text-center mt-6 space-y-3">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Fixpenses limits apply to your actual spending goals rather
              than a lender&apos;s risk threshold. That means they stay
              useful even if you don&apos;t carry a credit card at all, or
              if you carry several.
            </p>
            <div className="flex justify-center">
              <InlineCta
                href="/signup"
                label="See how a Fixpenses spending limit compares to your current credit card limit. Set one up in a couple of minutes."
              />
            </div>
          </AnimateOnScroll>
        </section>

        {/* ─── FAQs (icon card grid) ───────────────────────────── */}
        <section className="relative overflow-hidden se-dot-grid border-y border-border">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-muted/30 pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="grid lg:grid-cols-[minmax(0,280px)_1fr] gap-8 lg:gap-12">
              <AnimateOnScroll type="fade-right" className="space-y-4">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Got Questions?
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Everything you need to know about setting limits and
                  getting alerted before you overspend. Still curious?
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a9e5c] hover:text-[#158a4f] transition-colors"
                >
                  Try it yourself <ArrowRight className="w-4 h-4" />
                </Link>
              </AnimateOnScroll>

              <AnimateOnScroll
                type="stagger"
                className="grid sm:grid-cols-2 gap-4 content-start"
              >
                {FAQS.map(({ icon: Icon, q, a }) => (
                  <details
                    key={q}
                    className="group rounded-2xl border border-border bg-background/80 backdrop-blur-sm p-5 open:border-[#1a9e5c]/40 open:shadow-lg open:shadow-[#1a9e5c]/5 hover:border-[#1a9e5c]/25 transition-all"
                  >
                    <summary className="flex items-start gap-3 cursor-pointer list-none">
                      <div className="w-9 h-9 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0 group-open:bg-[#1a9e5c] transition-colors">
                        <Icon className="w-4 h-4 text-[#1a9e5c] group-open:text-white transition-colors" />
                      </div>
                      <h3 className="flex-1 font-semibold text-foreground text-sm leading-snug pt-1.5">
                        {q}
                      </h3>
                      <ChevronDown className="w-4 h-4 shrink-0 mt-2 text-muted-foreground transition-transform group-open:rotate-180 group-open:text-[#1a9e5c]" />
                    </summary>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-3 pl-12">
                      {a}
                    </p>
                  </details>
                ))}
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ───────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1f17] via-[#123322] to-[#158a4f]">
          <div
            className="absolute -top-20 -right-20 w-[380px] h-[380px] bg-[#22d47a]/15 rounded-full blur-3xl pointer-events-none"
            style={{ animation: "se-orb-drift 14s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-[320px] h-[320px] bg-white/5 rounded-full blur-3xl pointer-events-none"
            style={{
              animation: "se-orb-drift 10s ease-in-out 3s infinite reverse",
            }}
          />
          <AnimateOnScroll
            type="fade-up"
            className="relative max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-center space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Set Your First Budget Today
            </h2>
            <p className="text-lg text-white/80">
              Try our budgeting software free — no credit card required.
            </p>
            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-white text-[#0f1f17] hover:bg-white/90 font-semibold shadow-lg"
                asChild
              >
                <Link href="/signup">
                  Set your first budget <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimateOnScroll>
        </section>

        {/* Back to features */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
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
