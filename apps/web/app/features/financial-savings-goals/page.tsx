import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ChevronDown,
  Target,
  PiggyBank,
  Banknote,
  Repeat,
  LayoutDashboard,
  Calculator,
  MapPin,
  Landmark,
  Coins,
  Sparkles,
  HelpCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Financial Savings Goals, Automated with Fixpenses",
  description:
    "Stop manually moving money toward your goals. Fixpenses automates your financial savings goals from every UAE payday.",
  keywords: [
    "savings goals UAE",
    "financial goals tracker UAE",
    "save money UAE app",
    "target savings AED",
    "salary automation savings",
    "monthly savings calculator UAE",
  ],
  alternates: {
    canonical: `${SITE_URL}/features/financial-savings-goals`,
  },
  openGraph: {
    title: "Financial Savings Goals, Automated with Fixpenses",
    description:
      "Stop manually moving money toward your goals. Fixpenses automates your financial savings goals from every UAE payday.",
    url: `${SITE_URL}/features/financial-savings-goals`,
  },
};

const FAQS = [
  {
    q: "How Fast Can I Set Up My First Savings Goal In Fixpenses?",
    a: "Setting up a goal takes less than a minute. Pick a name, set a target amount and date, and Fixpenses starts tracking it right away, no extra steps or paperwork involved.",
  },
  {
    q: "Does Fixpenses Move Money Automatically, Or Do I Still Have To Transfer It Myself?",
    a: "Fixpenses can move a fixed amount from your salary into your goal automatically as soon as your pay lands. If you'd rather add money manually instead, you can do that too, the automation is optional, not required.",
  },
  {
    q: "Can I Track More Than One Savings Goal At The Same Time?",
    a: "Yes, you can run as many goals as you need at once. Each one keeps its own target and progress bar, so your emergency fund and your travel savings never get mixed together.",
  },
  {
    q: "What Happens After I Hit My Savings Goal, Can I Set A New One Right Away?",
    a: "Once a goal is reached, you can set a new target immediately and start tracking it the same way. There's no waiting period or reset needed, you just name the next goal and Fixpenses picks up from there.",
  },
];

const UAE_POINTS = [
  { icon: Banknote, label: "Aligned to salary-day, not a calendar month" },
  { icon: Coins, label: "Every Dirham tracked, no manual conversion" },
  { icon: MapPin, label: "Built for cash, card & transfer spending" },
];

export default function GoalsPage() {
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

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 sm:pb-10">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
              <AnimateOnScroll type="fade-right" className="space-y-5 text-center lg:text-left">
                <span className="se-hero-badge inline-flex items-center gap-2 bg-[#1a9e5c]/10 text-[#1a9e5c] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#1a9e5c]/20">
                  Savings Goals
                </span>
                <h1 className="se-hero-title text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.15]">
                  Turn Financial Savings Goals Into{" "}
                  <span className="text-[#1a9e5c] relative">
                    Reality
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-[#1a9e5c]/60 via-[#1a9e5c]/30 to-transparent" />
                  </span>{" "}
                  with Fixpenses
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Saving money shouldn&apos;t depend on willpower alone.
                  Fixpenses gives you a dedicated space for every savings
                  goal, tracks each Dirham automatically, and shows your
                  progress in real time, so you always know where you stand
                  without checking a bank statement.
                </p>
                <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Set a target, and the app does the tracking so you can
                  focus on hitting it. Whether you&apos;re building an
                  emergency fund, saving for a car, or planning a trip,
                  Fixpenses keeps each goal separate and visible, so nothing
                  gets lost in one general balance.
                </p>
                <div className="flex justify-center lg:justify-start pt-2">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base text-white shadow-lg shadow-[#1a9e5c]/30 se-animate-shimmer-btn border-0 hover:opacity-90 transition-opacity"
                    asChild
                  >
                    <Link href="/signup">
                      Create your first goal <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll type="fade-left" className="flex justify-center">
                <div className="relative w-full max-w-[320px] bg-background border border-border rounded-3xl shadow-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Your goals
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#1a9e5c]/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-[#1a9e5c]" />
                    </div>
                  </div>
                  {[
                    { name: "Emergency Fund", pct: 68, amount: "AED 13,600 / 20,000" },
                    { name: "New Car", pct: 34, amount: "AED 17,000 / 50,000" },
                    { name: "Japan Trip", pct: 91, amount: "AED 4,550 / 5,000" },
                  ].map(({ name, pct, amount }) => (
                    <div key={name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">{amount}</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1a9e5c]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── Set your goal ───────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#1a9e5c]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Set Your Savings Goal in Fixpenses and Watch Every Dirham
                Count
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Open Fixpenses, name your goal, and set a target amount, the
                setup takes under a minute. From there, every Dirham you add
                is tracked against that specific goal, not lumped into one
                general balance, so you can see the exact progress of each
                goal on its own.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You&apos;ll always know exactly how close you are, whether
                you&apos;re saving for a car, a trip, or an emergency fund.
                As you add money, the progress updates instantly, giving you
                a clear number to work toward instead of a vague sense of
                &quot;saving more.&quot;
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left" className="flex justify-center">
              <div className="w-full max-w-sm bg-muted/30 border border-border rounded-3xl p-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  New goal
                </p>
                <div className="space-y-3">
                  <div className="bg-background border border-border rounded-xl px-4 py-3">
                    <p className="text-[11px] text-muted-foreground mb-0.5">Goal name</p>
                    <p className="text-sm font-semibold text-foreground">Car Down Payment</p>
                  </div>
                  <div className="bg-background border border-border rounded-xl px-4 py-3">
                    <p className="text-[11px] text-muted-foreground mb-0.5">Target amount</p>
                    <p className="text-sm font-semibold text-foreground">AED 50,000</p>
                  </div>
                  <div className="bg-background border border-border rounded-xl px-4 py-3">
                    <p className="text-[11px] text-muted-foreground mb-0.5">Target date</p>
                    <p className="text-sm font-semibold text-foreground">December 2027</p>
                  </div>
                </div>
                <div className="bg-[#1a9e5c] text-white text-center text-sm font-semibold rounded-xl py-2.5">
                  Create goal
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Automate salary ─────────────────────────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimateOnScroll
                type="fade-right"
                className="order-2 lg:order-1 flex justify-center"
              >
                <div className="w-full max-w-sm space-y-3">
                  {[
                    { icon: Banknote, label: "Salary lands", sub: "Payday, every month" },
                    { icon: Repeat, label: "Auto-transfer runs", sub: "Fixed amount, no reminders" },
                    { icon: PiggyBank, label: "Goal balance grows", sub: "Updated instantly" },
                  ].map(({ icon: Icon, label, sub }, i, arr) => (
                    <div key={label}>
                      <div className="flex items-center gap-4 bg-background border border-border rounded-2xl p-4">
                        <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-[#1a9e5c]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{sub}</p>
                        </div>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex justify-center py-1">
                          <div className="w-px h-4 bg-[#1a9e5c]/30" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                type="fade-left"
                className="order-1 lg:order-2 space-y-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-[#1a9e5c]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Automate Your Salary Into Savings Without Lifting a Finger
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Once your goal is set, Fixpenses can move a fixed amount
                  from your salary into it automatically, the moment your
                  pay lands. There&apos;s no reminder to set, no manual
                  transfer to remember, and no risk of forgetting once a
                  busy month gets in the way.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Your savings grow on schedule, and your goal gets closer
                  every payday without you having to think about it. Over a
                  few months, that consistency adds up faster than saving
                  whatever happens to be left over at the end of the month.
                </p>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── One dashboard ───────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <AnimateOnScroll type="fade-up" className="text-center max-w-3xl mx-auto space-y-4 mb-8">
            <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center mx-auto">
              <LayoutDashboard className="w-5 h-5 text-[#1a9e5c]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Manage Every Savings Goal in One Dashboard with Fixpenses
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Running two or three savings goals at once usually means
              juggling separate notes or mental math to keep track of each
              one. Fixpenses puts every goal on a single dashboard, so you
              can see your emergency fund, your travel savings, and any
              other target side by side, without switching between screens
              or accounts.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Each goal keeps its own progress bar and target amount, so
              adding money to one never affects the numbers on another. You
              can check the whole picture in seconds or tap into a single
              goal for more detail, whichever the moment calls for.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll
            type="stagger"
            className="grid sm:grid-cols-3 gap-5"
          >
            {[
              { name: "Emergency Fund", pct: 62, amount: "AED 12,400 / 20,000" },
              { name: "Travel Savings", pct: 40, amount: "AED 2,000 / 5,000" },
              { name: "New Laptop", pct: 100, amount: "AED 4,500 / 4,500" },
            ].map(({ name, pct, amount }) => (
              <div
                key={name}
                className="bg-background border border-border rounded-2xl p-5 space-y-3 hover:border-[#1a9e5c]/30 hover:shadow-lg transition-all"
              >
                <p className="text-sm font-semibold text-foreground">{name}</p>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1a9e5c]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{amount}</p>
                  <p className="text-xs font-semibold text-[#1a9e5c]">{pct}%</p>
                </div>
              </div>
            ))}
          </AnimateOnScroll>
        </section>

        {/* ─── Monthly savings calculator ──────────────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimateOnScroll type="fade-right" className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-[#1a9e5c]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Hit Your Target Faster with a Built-In Monthly Savings
                  Calculator
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Picking a savings amount out of thin air usually means
                  saving too little to hit your deadline or too much to
                  sustain every month. The built-in calculator in Fixpenses
                  takes your goal amount and target date and works out
                  exactly how much to set aside each month to get there.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Change the date or the amount, and the monthly figure
                  updates immediately, so you can test a few scenarios
                  before committing to one. Once you land on a number that
                  fits your budget, Fixpenses carries that plan forward and
                  tracks your progress against it automatically.
                </p>
              </AnimateOnScroll>

              <AnimateOnScroll type="fade-left" className="flex justify-center">
                <div className="w-full max-w-sm bg-background border border-border rounded-3xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-xl px-4 py-3">
                      <p className="text-[11px] text-muted-foreground mb-0.5">Goal amount</p>
                      <p className="text-sm font-semibold text-foreground">AED 30,000</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl px-4 py-3">
                      <p className="text-[11px] text-muted-foreground mb-0.5">Time left</p>
                      <p className="text-sm font-semibold text-foreground">12 months</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 py-1">
                    <div className="w-px h-6 bg-border" />
                  </div>
                  <div className="bg-[#1a9e5c]/10 border border-[#1a9e5c]/25 rounded-xl px-4 py-3 text-center">
                    <p className="text-[11px] text-[#1a9e5c] font-medium mb-0.5">
                      Save monthly
                    </p>
                    <p className="text-2xl font-extrabold text-[#1a9e5c]">
                      AED 2,500
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── Savings tracker ─────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll
              type="fade-right"
              className="order-2 lg:order-1 flex justify-center"
            >
              <div className="w-full max-w-sm bg-background border border-border rounded-3xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Emergency Fund</p>
                  <span className="text-xs font-semibold text-[#1a9e5c]">62%</span>
                </div>
                <div className="flex items-center justify-between">
                  {[
                    { pct: 25, done: true },
                    { pct: 50, done: true },
                    { pct: 75, done: false },
                    { pct: 100, done: false },
                  ].map(({ pct, done }, i) => (
                    <div key={pct} className="flex items-center flex-1 last:flex-initial">
                      <div className="flex flex-col items-center gap-1.5">
                        {done ? (
                          <CheckCircle2 className="w-6 h-6 text-[#1a9e5c]" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground/30" />
                        )}
                        <span className="text-[10px] text-muted-foreground">{pct}%</span>
                      </div>
                      {i < 3 && (
                        <div
                          className={`h-px flex-1 mx-1 ${done ? "bg-[#1a9e5c]" : "bg-border"}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-muted/50 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    AED 12,400 of AED 20,000 saved
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll
              type="fade-left"
              className="order-1 lg:order-2 space-y-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#1a9e5c]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Track Your Progress with a Savings Tracker
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Watching a goal move from zero to fully funded is a lot
                easier when the numbers update as you go. The Fixpenses
                tracker shows your current balance against your target the
                moment you add money, so you always know exactly how far
                along you are.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                There&apos;s no need to calculate the remaining amount
                yourself or wait for a monthly statement to check in. The
                tracker stays current in real time, which makes it easier
                to stay motivated and adjust your contributions if a goal
                needs a push to stay on schedule.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Why UAE users choose Fixpenses ───────────────────── */}
        <section className="bg-[#0f1f17]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <AnimateOnScroll type="fade-up" className="text-center max-w-2xl mx-auto space-y-4 mb-6">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mx-auto">
                <Landmark className="w-5 h-5 text-[#22d47a]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Why UAE Users Choose Fixpenses to Reach Their Savings Goals
              </h2>
              <p className="text-white/70 leading-relaxed">
                Salaries in the UAE tend to land on a fixed date, rent and
                bills often go out in large chunks, and a lot of everyday
                spending moves between cash, cards, and transfers. Fixpenses
                is built around that rhythm, so your savings goals stay
                accurate no matter how your money moves during the month.
              </p>
              <p className="text-white/70 leading-relaxed">
                Every Dirham is tracked in the currency you actually use,
                with no manual conversion or extra setup. That&apos;s what
                keeps UAE users coming back to Fixpenses: one app that fits
                how money actually works here, instead of a generic tool
                adapted after the fact.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll
              type="stagger"
              className="grid sm:grid-cols-3 gap-4"
            >
              {UAE_POINTS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#22d47a]" />
                  </div>
                  <p className="text-sm text-white/90 font-medium leading-snug">
                    {label}
                  </p>
                </div>
              ))}
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Start today CTA ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1f17] via-[#123322] to-[#158a4f]">
          <div
            className="absolute -top-20 -right-20 w-[380px] h-[380px] bg-[#22d47a]/15 rounded-full blur-3xl pointer-events-none"
            style={{ animation: "se-orb-drift 14s ease-in-out infinite" }}
          />
          <AnimateOnScroll
            type="fade-up"
            className="relative max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-center space-y-5"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Start Your Savings Goal in Fixpenses Today
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Setting up your first goal takes less time than it took to
              read this page. Pick an amount, choose a date, and Fixpenses
              handles the tracking, the automation, and the progress
              updates from there.
            </p>
            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-white text-[#0f1f17] hover:bg-white/90 font-semibold shadow-lg"
                asChild
              >
                <Link href="/signup">
                  Create your first goal <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimateOnScroll>
        </section>

        {/* ─── FAQs ─────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <AnimateOnScroll type="fade-up" className="text-center space-y-3 mb-8">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQs
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Questions About Savings Goals
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll type="stagger" className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <details
                key={q}
                className="group rounded-2xl border border-border bg-background p-5 open:border-[#1a9e5c]/40 hover:border-[#1a9e5c]/25 transition-all"
              >
                <summary className="flex items-start gap-3 cursor-pointer list-none">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#1a9e5c]/10 text-[#1a9e5c] text-xs font-bold flex items-center justify-center group-open:bg-[#1a9e5c] group-open:text-white transition-colors">
                    {i + 1}
                  </span>
                  <h3 className="flex-1 font-semibold text-foreground text-sm sm:text-base leading-snug pt-0.5">
                    {q}
                  </h3>
                  <ChevronDown className="w-4 h-4 shrink-0 mt-1 text-muted-foreground transition-transform group-open:rotate-180 group-open:text-[#1a9e5c]" />
                </summary>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3 pl-10">
                  {a}
                </p>
              </details>
            ))}
          </AnimateOnScroll>
        </section>

        {/* Back to features */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-10 text-center">
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
