import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Layers,
  Gauge,
  Wallet,
  BellRing,
  FileText,
  List,
  Repeat,
  Quote,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Track Credit Card Balances, Limits & Due Dates in Fixpenses",
  description:
    "Stop checking multiple banking apps. Fixpenses track balances, due dates, and transactions for all your credit cards. Get automatic invoices, payment reminders. Get today!",
  keywords: [
    "credit card tracker UAE",
    "credit card management UAE",
    "UAE credit card bill dates",
    "payment due date tracker",
    "credit card invoice UAE",
    "credit limit tracker",
    "multiple credit cards dashboard",
    "credit card installment tracker",
  ],
  alternates: {
    canonical: `${SITE_URL}/features/credit-card-management`,
  },
  openGraph: {
    title: "Track Credit Card Balances, Limits & Due Dates in Fixpenses",
    description:
      "Stop checking multiple banking apps. Fixpenses track balances, due dates, and transactions for all your credit cards. Get automatic invoices, payment reminders. Get today!",
    url: `${SITE_URL}/features/credit-card-management`,
  },
};

const ADD_CARD_FLOW = [
  { icon: CreditCard, label: "Name your card" },
  { icon: Layers, label: "It joins your dashboard" },
  { icon: Gauge, label: "See balances & limits together" },
];

const CARD_WIDGET = [
  { name: "Card ending 4821", used: 62, amount: "AED 3,720 / 6,000" },
  { name: "Card ending 7734", used: 28, amount: "AED 1,120 / 4,000" },
];

const BILL_REMINDERS = [
  {
    label: "Card ending 4821 · Due in 3 days",
    detail: "AED 1,240 payment due Sep 18",
    tint: "amber",
  },
  {
    label: "Card ending 7734 · Payment due today",
    detail: "AED 860 balance to settle",
    tint: "rose",
  },
  {
    label: "Card ending 2093 · Payment posted",
    detail: "AED 640 payment received",
    tint: "green",
  },
];

const INVOICES = [
  { period: "August 2026", card: "Card ending 4821", amount: "AED 2,340" },
  { period: "July 2026", card: "Card ending 4821", amount: "AED 1,980" },
  { period: "August 2026", card: "Card ending 7734", amount: "AED 860" },
];

const TRANSACTIONS = [
  { merchant: "Carrefour", card: "· 4821", amount: "AED 210" },
  { merchant: "Careem", card: "· 7734", amount: "AED 45" },
  { merchant: "Netflix", card: "· 2093", amount: "AED 39" },
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

export default function CreditCardsPage() {
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

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-6 sm:pb-8 text-center space-y-6">
            <span className="se-hero-badge inline-flex items-center gap-2 bg-[#1a9e5c]/10 text-[#1a9e5c] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#1a9e5c]/20">
              Credit Card Management &middot; Start Today
            </span>
            <h1 className="se-hero-title text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Manage Every Credit Card from{" "}
              <span className="text-[#1a9e5c] relative">
                One Dashboard
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-[#1a9e5c]/60 via-[#1a9e5c]/30 to-transparent" />
              </span>
            </h1>
            <p className="se-hero-desc text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Keeping track of two or three credit cards usually means
              switching between banking apps just to check a balance or a due
              date. Fixpenses pulls every card into one dashboard, so you can
              see balances, limits, and due dates without logging into each
              bank separately.
            </p>
            <div className="se-hero-btns flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base text-white shadow-lg shadow-[#1a9e5c]/30 se-animate-shimmer-btn border-0 hover:opacity-90 transition-opacity"
                asChild
              >
                <Link href="/signup">
                  Add your cards <ArrowRight className="ml-2 h-4 w-4" />
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

        {/* ─── Emphasis strip ──────────────────────────────────── */}
        <section className="border-y border-border bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-6 text-center relative">
            <Quote className="w-8 h-8 text-[#1a9e5c]/20 mx-auto mb-2" />
            <AnimateOnScroll type="fade-up">
              <p className="text-xl sm:text-2xl font-semibold text-foreground leading-snug">
                Add your cards once, and Fixpenses keeps the details current
                from there. You get{" "}
                <span className="text-[#1a9e5c]">
                  one clear view of your credit
                </span>{" "}
                instead of piecing it together from separate statements.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Add every card ──────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Add Every Card and See Your Full Credit Picture in Fixpenses
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                There&apos;s no limit on how many cards you can add, so
                whether you carry one card or five, Fixpenses treat them all
                the same way. Give each card a name you&apos;ll recognize,
                and it shows up on your dashboard right next to the others.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Once your cards are added, you get a full picture of your
                credit at a glance, total balances, individual limits, and
                how each card compares to the others. That view makes it
                easier to decide which card to use next, instead of guessing
                from memory.
              </p>
              <InlineCta
                href="/signup"
                label="Add your first card to Fixpenses in under a minute."
              />
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left">
              <div className="bg-muted/30 border border-border rounded-3xl p-8">
                <div className="relative pl-2">
                  <div className="absolute left-[27px] top-3 bottom-3 w-px bg-gradient-to-b from-[#1a9e5c]/50 via-[#1a9e5c]/30 to-transparent" />
                  <div className="space-y-6">
                    {ADD_CARD_FLOW.map(({ icon: Icon, label }) => (
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

        {/* ─── Balance & credit limit ──────────────────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimateOnScroll
                type="fade-right"
                className="order-2 lg:order-1 flex justify-center"
              >
                <div className="w-full max-w-sm bg-background border border-border rounded-3xl shadow-lg p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#1a9e5c]" />
                    <span className="text-xs font-semibold text-foreground">
                      Balance &amp; limit
                    </span>
                  </div>
                  {CARD_WIDGET.map(({ name, used, amount }) => (
                    <div key={name} className="bg-muted rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-foreground">
                          {name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {amount}
                        </p>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full rounded-full ${used >= 60 ? "bg-amber-500" : "bg-[#1a9e5c]"}`}
                          style={{ width: `${used}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        {used}% utilized
                      </p>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                type="fade-left"
                className="order-1 lg:order-2 space-y-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-[#1a9e5c]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Track Your Balance and Credit Limit Without Checking Every
                  App
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Checking your available balance across multiple cards
                  usually means opening each bank&apos;s app one at a time.
                  Fixpenses show your balance and credit limit for every card
                  in one place, updated as your spending changes.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You&apos;ll also see your utilization percentage for each
                  card, so you know how close you are to your limit before it
                  becomes a problem. That&apos;s one less app to check and
                  one less number to track down manually.
                </p>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── Bill date reminders ─────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                <BellRing className="w-5 h-5 text-[#1a9e5c]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Never Miss a Bill Date with Automatic Payment Reminders
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Missing a payment date on one card out of several is easy
                when each bank sends its own notifications on its own
                schedule. Fixpenses track the bill date and payment date for
                every card you add, so you get one consistent set of
                reminders instead of juggling separate alerts from each bank.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You&apos;ll see upcoming due dates at a glance on your
                dashboard, well before they&apos;re close. That gives you
                time to plan around each payment instead of scrambling the
                day it&apos;s due.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left" className="relative h-64 sm:h-72">
              {BILL_REMINDERS.map(({ label, detail, tint }, i) => {
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
                const offsets = [
                  "top-0 left-0",
                  "top-16 left-8 sm:left-12",
                  "top-32 left-2 sm:left-4",
                ];
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
          </div>
        </section>

        {/* ─── Auto-generated invoices ─────────────────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimateOnScroll
                type="fade-right"
                className="order-2 lg:order-1 flex justify-center"
              >
                <div className="relative w-full max-w-[280px]">
                  <div className="absolute inset-0 bg-[#1a9e5c]/15 rounded-[2.5rem] blur-2xl scale-95 se-animate-pulse-glow" />
                  <div className="relative bg-background border-[6px] border-foreground/90 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <div className="bg-[#1a9e5c] px-4 py-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-semibold">
                        Invoices
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      {INVOICES.map(({ period, card, amount }) => (
                        <div
                          key={`${period}-${card}`}
                          className="bg-muted rounded-xl p-3 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {period}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {card}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs font-semibold text-foreground">
                              {amount}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                type="fade-left"
                className="order-1 lg:order-2 space-y-4"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Get an Auto-Generated Invoice for Every Billing Cycle
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Digging up an old credit card statement usually means
                  logging into a bank portal and searching through months of
                  history. Fixpenses generates an invoice automatically for
                  every billing cycle on every card, so the record is
                  already there when you need it.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Each invoice is stored permanently, so you can look back at
                  any past cycle without waiting on your bank or requesting a
                  copy. It&apos;s a running history of every bill, organized
                  by card and by month.
                </p>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── Every transaction, one place ────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                <List className="w-5 h-5 text-[#1a9e5c]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                See Every Transaction on Every Card in One Place
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Reviewing spending on multiple cards usually means opening
                each one separately to scroll through its transaction list.
                Fixpenses shows every transaction for every card in one
                dashboard, so you can review recent activity without
                switching between apps.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can view transactions by card individually or check your
                full spending across all of them at once. That makes it
                easier to spot an unfamiliar charge or double-check a
                purchase without digging through separate statements.
              </p>
              <InlineCta
                href="/signup"
                label="See every card transaction in one dashboard."
              />
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left">
              <div className="bg-background border border-border rounded-3xl shadow-sm p-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Recent activity
                </p>
                {TRANSACTIONS.map(({ merchant, card, amount }) => (
                  <div
                    key={merchant}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-[#1a9e5c]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {merchant}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {card}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">
                      {amount}
                    </span>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Installment tracking ────────────────────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimateOnScroll
                type="fade-right"
                className="order-2 lg:order-1 flex justify-center"
              >
                <div className="w-full max-w-sm bg-background border border-border rounded-3xl shadow-lg p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-[#1a9e5c]" />
                    <span className="text-xs font-semibold text-foreground">
                      Installment plan
                    </span>
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-foreground">
                        Laptop purchase
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        4 / 6 paid
                      </p>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1a9e5c]"
                        style={{ width: "67%" }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      AED 1,200 of AED 3,600 remaining
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#1a9e5c] pt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Updates automatically each cycle
                  </div>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                type="fade-left"
                className="order-1 lg:order-2 space-y-4"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Split Large Purchases into Installments You Can Actually
                  Track
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  A big purchase on a credit card often turns into a flat
                  number on your statement, with no clear view of how much
                  is left to pay off. Fixpenses lets you split a large
                  purchase into installments and tracks each portion
                  separately, so you always know exactly what&apos;s
                  remaining.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  As each installment is paid, your progress updates
                  automatically, no manual math required. That makes it
                  easier to plan around a big purchase instead of losing
                  track of it inside your regular monthly balance.
                </p>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ───────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="relative overflow-hidden bg-gradient-to-br from-[#0f1f17] via-[#123322] to-[#158a4f]"
        >
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
            className="relative max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Start Managing Your Credit Cards in Fixpenses Today
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Adding your first card takes less time than logging into your
              bank&apos;s app. From there, Fixpenses tracks your balances,
              due dates, and invoices automatically, so you&apos;re set up
              the moment you finish.
            </p>
            <p className="text-sm text-white/60 max-w-xl mx-auto">
              The sooner your cards are added, the sooner you stop checking
              multiple apps for the same information.
            </p>
            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-white text-[#0f1f17] hover:bg-white/90 font-semibold shadow-lg"
                asChild
              >
                <Link href="/signup">
                  Add your cards <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimateOnScroll>
        </section>

        {/* Back to features */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
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
