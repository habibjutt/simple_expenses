import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Receipt,
  ScanLine,
  Tags,
  CreditCard,
  MapPin,
  TrendingUp,
  FileCheck2,
  Smartphone,
  Clock,
  Camera,
  Zap,
  BellRing,
  Sparkles,
  Link2,
  RefreshCw,
  Workflow,
  ShieldCheck,
  FileText,
  Users,
  Repeat,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Expense Tracking Software for Businesses & Individuals in the UAE",
  description:
    "Stop chasing receipts and spreadsheets. Fixpenses automates expense tracking for UAE teams with real-time visibility and instant VAT compliance.",
  keywords: [
    "expense tracking UAE",
    "track spending UAE",
    "transaction log UAE",
    "installment tracking UAE",
    "dirham expense log",
    "category expense tracker",
    "automated expense tracking UAE",
    "VAT ready expense software",
  ],
  alternates: {
    canonical: `${SITE_URL}/features/expense-tracking`,
  },
  openGraph: {
    title:
      "Expense Tracking Software for Businesses & Individuals in the UAE | Fixpenses",
    description:
      "Stop chasing receipts and spreadsheets. Fixpenses automates expense tracking for UAE teams with real-time visibility and instant VAT compliance.",
    url: `${SITE_URL}/features/expense-tracking`,
  },
};

const CAPTURE_FLOW = [
  { icon: Receipt, label: "Purchase happens" },
  { icon: ScanLine, label: "Captured instantly" },
  { icon: Tags, label: "Categorized automatically" },
  { icon: CreditCard, label: "Matched to card or account" },
];

const MANUAL_PAINS = [
  "Hours lost every month chasing missing receipts",
  "Entries that don't match, corrected by hand",
  "The real cost stays hidden until month-end",
];

const FIXPENSES_WINS = [
  "Snap a photo — it's categorized instantly",
  "Matched and ready for reporting in seconds",
  "Finance reviews numbers, not receipts",
];

const SWITCH_REASONS = [
  {
    icon: FileCheck2,
    title: "VAT Compliance",
    desc: "Every transaction stays FTA-ready by default — no scrambling before an audit.",
    big: true,
  },
  {
    icon: MapPin,
    title: "Multi-Emirate Visibility",
    desc: "Real-time visibility across every location your team operates in.",
  },
  {
    icon: TrendingUp,
    title: "Scales With Growth",
    desc: "Grows with your headcount without adding extra admin work.",
  },
];

const DAILY_USE = [
  {
    icon: Clock,
    title: "Log Daily Spend in Seconds, Not Spreadsheets",
    desc: "Typing expenses into a spreadsheet at the end of the day is where most tracking falls apart. Fixpenses cuts that down to a few taps. Open the app, enter the amount, and it's logged, categorized, and synced before you've even left the counter.",
  },
  {
    icon: Camera,
    title: "Capture & Upload Receipts On the Go",
    desc: "Paper receipts get lost, faded, or forgotten in a pocket. With Fixpenses, snap a photo the moment you get the receipt and it's stored, matched to the right expense, and ready for reporting instantly, so nothing slips through by month-end.",
  },
  {
    icon: Zap,
    title: "Automate Your Expense Tracking in Real Time",
    desc: "Waiting until month-end to see where the money went is too late to fix anything. Fixpenses tracks spend as it happens, categorizes it automatically, and connects straight to your existing accounts, so your numbers are always current and always accurate.",
  },
  {
    icon: BellRing,
    title: "Get Real-Time Spend Visibility & Instant Alerts",
    desc: "See spend the moment it happens instead of waiting for a report. Fixpenses sends instant alerts when a transaction comes in, so nothing catches your finance team off guard and budget limits stay in check before they're crossed.",
  },
  {
    icon: Sparkles,
    title: "Let Automation Categorize Expenses & Match Receipts",
    desc: "Sorting expenses by hand eats up hours your team could spend on actual finance work. Fixpenses categorizes every transaction automatically and matches it to the right receipt, so nothing needs manual review before it's ready for reporting.",
  },
  {
    icon: Link2,
    title: "Sync Seamlessly With Bank Cards & Accounting Tools",
    desc: "Fixpenses connects directly to your company cards and accounting software, so expenses flow in without anyone exporting files or re-entering data. Your books stay updated in real time, and reconciliation stops being a month-end scramble.",
  },
];

const PILLARS = [
  {
    icon: RefreshCw,
    title: "Real-Time, Automated Tracking",
    desc: "Fixpenses tracks every expense the moment it happens and keeps that data accurate without manual checks. Finance teams trust it because the numbers are always current, not reconstructed at month-end from scattered receipts.",
  },
  {
    icon: FileCheck2,
    title: "Built AED & VAT/FTA-Ready",
    desc: "Every transaction in Fixpenses is recorded in AED and structured to meet FTA requirements from the start. There's no extra setup or workaround needed to make your records audit-ready.",
  },
  {
    icon: Workflow,
    title: "Integrates With Your Accounting Stack",
    desc: "Fixpenses connects directly with the accounting tools your finance team already uses. Expenses sync automatically, so nothing needs to be exported, reformatted, or entered twice.",
  },
  {
    icon: ShieldCheck,
    title: "Secure, Cloud-Based & Built to Scale",
    desc: "Your data stays protected in the cloud, accessible whenever your team needs it and secure from anyone who shouldn't see it. As your business grows, Fixpenses grows with it — no migrations, no rebuilding later.",
  },
];

const STEPS = [
  {
    number: "01",
    icon: Link2,
    title: "Connect Your Cards & Accounting Tools",
    desc: "Link your company cards and accounting software to Fixpenses in a few clicks. Once connected, transactions start flowing in automatically, no manual imports needed.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Let Expenses Track & Categorize Themselves",
    desc: "Every transaction gets captured and sorted into the right category the moment it happens. Your team doesn't lift a finger, and your finance department gets clean, organized data without asking for it.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Approve, Report & Reconcile in Real Time",
    desc: "Managers approve expenses as they come in, reports build themselves, and reconciliation happens continuously instead of piling up at month-end. Your books stay current every single day.",
  },
];

const TRACKABLES = [
  {
    icon: FileText,
    title: "Detailed Expense Records & Reports",
    desc: "Every expense is logged with full detail and ready to turn into a report whenever you need one. No pulling numbers together manually before a review or audit.",
  },
  {
    icon: Receipt,
    title: "Receipts & Supporting Documentation",
    desc: "Receipts and supporting documents are stored alongside every transaction, matched automatically and ready to pull up whenever finance needs proof for a claim or audit.",
  },
  {
    icon: Users,
    title: "Team & Departmental Spend",
    desc: "See exactly what each team or department is spending without chasing individual reports. Fixpenses breaks it down automatically, so budget owners always know where they stand.",
  },
  {
    icon: Repeat,
    title: "Recurring & SaaS Subscriptions",
    desc: "Fixpenses keeps track of every recurring charge and SaaS subscription automatically, so nothing renews unnoticed and your team always knows what's actually being paid for each month.",
  },
];

export default function ExpenseTrackingPage() {
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
              Expense Tracking &middot; Start Today
            </span>
            <h1 className="se-hero-title text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Take Control of Your Expenses with{" "}
              <span className="text-[#1a9e5c] relative">
                Smarter Tracking
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-[#1a9e5c]/60 via-[#1a9e5c]/30 to-transparent" />
              </span>
            </h1>
            <p className="se-hero-desc text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Stop chasing receipts. Fixpenses tracks every expense
              automatically, so your team can focus on running the business
              instead of building spreadsheets.
            </p>
            <div className="se-hero-btns flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base text-white shadow-lg shadow-[#1a9e5c]/30 se-animate-shimmer-btn border-0 hover:opacity-90 transition-opacity"
                asChild
              >
                <Link href="/signup">
                  Start tracking free <ArrowRight className="ml-2 h-4 w-4" />
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
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center relative">
            <Quote className="w-8 h-8 text-[#1a9e5c]/20 mx-auto mb-2" />
            <AnimateOnScroll type="fade-up">
              <p className="text-xl sm:text-2xl font-semibold text-foreground leading-snug">
                Stop chasing receipts and fixing spreadsheet errors every
                month-end. Fixpenses captures every expense automatically the
                moment it happens, sorts it into the right category, and
                keeps your records{" "}
                <span className="text-[#1a9e5c]">VAT-ready</span> without
                anyone typing a single entry.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── What Is Expense Tracking Software? ─────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                What Is Expense Tracking Software?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Fixpenses replaces manual expense logging with one automated
                system built for how UAE businesses actually work. Every
                purchase, from a taxi ride to a client dinner, gets captured,
                categorized, and matched to the right card or account in real
                time. No spreadsheets, no manual approvals stuck in
                someone&apos;s inbox, no end-of-month scramble to figure out
                where the money
                went.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left">
              <div className="bg-muted/30 border border-border rounded-3xl p-8">
                <div className="relative pl-2">
                  <div className="absolute left-[27px] top-3 bottom-3 w-px bg-gradient-to-b from-[#1a9e5c]/50 via-[#1a9e5c]/30 to-transparent" />
                  <div className="space-y-6">
                    {CAPTURE_FLOW.map(({ icon: Icon, label }) => (
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
                Digital vs. Manual Expense Tracking: Which Costs You More?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Spreadsheets look free until you count the hours your team
                spends chasing missing receipts and correcting entries that
                do not match. Fixpenses removes that cost entirely — snap a
                photo of a receipt and it&apos;s categorized, matched, and
                ready
                for reporting in seconds, so your finance team spends time
                reviewing numbers instead of hunting for them.
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
                  Manual Tracking
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

        {/* ─── Why UAE businesses are switching (bento) ───────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <AnimateOnScroll
            type="fade-up"
            className="text-center max-w-2xl mx-auto space-y-4 mb-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Why UAE Businesses Are Switching to Automated Systems
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              VAT compliance, multi-emirate teams, and fast headcount growth
              are the three reasons most UAE businesses outgrow manual
              tracking.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll
            type="stagger"
            className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-5"
          >
            {SWITCH_REASONS.map(({ icon: Icon, title, desc, big }) => (
              <div
                key={title}
                className={`rounded-3xl border border-border bg-background p-8 flex flex-col justify-center hover:border-[#1a9e5c]/30 hover:shadow-lg transition-all ${
                  big ? "lg:col-span-2 lg:row-span-2" : ""
                }`}
              >
                <div
                  className={`rounded-2xl bg-[#1a9e5c]/10 flex items-center justify-center mb-5 ${
                    big ? "w-16 h-16" : "w-12 h-12"
                  }`}
                >
                  <Icon
                    className={`text-[#1a9e5c] ${big ? "w-8 h-8" : "w-6 h-6"}`}
                  />
                </div>
                <h3
                  className={`font-bold text-foreground mb-2 ${big ? "text-2xl" : "text-lg"}`}
                >
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </AnimateOnScroll>
        </section>

        {/* ─── Anytime / anywhere + mobile teams ──────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimateOnScroll type="fade-right" className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Track Every Expense, Anytime, Anywhere
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your team doesn&apos;t sit at one desk, and your expense
                    tracking shouldn&apos;t either. Fixpenses works from any
                    phone, so spend gets logged the moment it happens,
                    whether someone&apos;s at a client site in Dubai or
                    grabbing lunch between meetings in Abu Dhabi. No more
                    waiting
                    until Friday to remember what was spent on Monday.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground">
                    Mobile Expense Tracking Built for Teams & Individuals
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Fixpenses works the same way whether it&apos;s one person
                    tracking their own spend or a full team spread across
                    departments. Employees log expenses from their phones in
                    real time, and managers see it all update instantly
                    without asking for a status update.
                  </p>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll type="fade-left" className="flex justify-center">
                <div className="relative w-full max-w-[280px]">
                  <div className="absolute inset-0 bg-[#1a9e5c]/15 rounded-[2.5rem] blur-2xl scale-95 se-animate-pulse-glow" />
                  <div className="relative bg-background border-[6px] border-foreground/90 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <div className="bg-[#1a9e5c] px-4 py-3 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-semibold">
                        Live team activity
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { city: "Dubai", note: "Client dinner logged" },
                        { city: "Abu Dhabi", note: "Taxi expense synced" },
                      ].map(({ city, note }) => (
                        <div
                          key={city}
                          className="bg-muted rounded-xl p-3 flex items-start gap-3"
                        >
                          <span className="relative flex h-2.5 w-2.5 mt-1 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a9e5c] opacity-60" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1a9e5c]" />
                          </span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1 text-xs font-semibold text-foreground">
                              <MapPin className="w-3 h-3 text-[#1a9e5c] shrink-0" />
                              {city}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {note}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#1a9e5c] pt-1">
                        <RefreshCw className="w-3 h-3" />
                        Syncing in real time
                      </div>
                    </div>
                  </div>
                </div>
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
              Automation That Never Sleeps
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

        {/* ─── Why UAE people choose us (pillar strip) ────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <AnimateOnScroll
              type="fade-up"
              className="text-center max-w-2xl mx-auto space-y-4 mb-6"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Why UAE People Choose Our Expense Management Software
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Businesses across the UAE pick Fixpenses because it&apos;s
                built for how they actually work, not adapted from a generic
                global tool. From VAT compliance to local banking, every
                part of it fits the way UAE finance teams operate.
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
              How Our Expense Tracking System Works
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Getting started with Fixpenses takes three simple steps, and
              your team is up and running the same day. No lengthy
              onboarding, no complicated setup.
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

        {/* ─── Everything you can track (dark grid) ───────────── */}
        <section className="bg-[#0f1f17]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <AnimateOnScroll
              type="fade-up"
              className="text-center max-w-2xl mx-auto space-y-4 mb-6"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Everything You Can Track With Our Software
              </h2>
              <p className="text-white/70 leading-relaxed">
                Fixpenses gives you one system to track every kind of
                business expense, so nothing gets missed and nothing needs a
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
              Start Tracking Smarter
            </h2>
            <p className="text-lg text-white/80">
              Try our expense software free — no credit card required.
            </p>
            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-white text-[#0f1f17] hover:bg-white/90 font-semibold shadow-lg"
                asChild
              >
                <Link href="/signup">
                  Start tracking free <ArrowRight className="ml-2 h-4 w-4" />
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
