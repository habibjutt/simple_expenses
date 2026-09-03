import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  BarChart2,
  PieChart,
  TrendingUp,
  Receipt,
  Tags,
  Eye,
  CalendarRange,
  CalendarDays,
  CalendarCheck,
  FileText,
  RefreshCw,
  Layers,
  Workflow,
  ShieldCheck,
  CreditCard,
  Wallet,
  Landmark,
  Sparkles,
  Quote,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Spending Analytics & Budget Reports Built for the UAE",
  description:
    "Stop guessing where your salary goes. Fixpenses break down your spending by day and month, so overspending shows up before the bill does.",
  keywords: [
    "expense reports UAE",
    "spending analytics UAE",
    "financial reports AED",
    "category spending breakdown",
    "monthly expense summary",
    "finance charts UAE",
    "real-time spending reports",
    "spending trends UAE",
  ],
  alternates: {
    canonical: `${SITE_URL}/features/expense-reports-analytics`,
  },
  openGraph: {
    title: "Spending Analytics & Budget Reports Built for the UAE | Fixpenses",
    description:
      "Stop guessing where your salary goes. Fixpenses break down your spending by day and month, so overspending shows up before the bill does.",
    url: `${SITE_URL}/features/expense-reports-analytics`,
  },
};

const REPORT_FLOW = [
  { icon: Receipt, label: "Transaction logged" },
  { icon: Tags, label: "Categorized automatically" },
  { icon: BarChart2, label: "Charted in real time" },
  { icon: Sparkles, label: "Ready to act on" },
];

const MANUAL_PAINS = [
  "Hours spent copying numbers into a spreadsheet every month",
  "Charts that are already outdated by the time they're finished",
  "Trends go unnoticed until they show up as a shortfall",
];

const FIXPENSES_WINS = [
  "Every report updates itself as transactions come in",
  "Charts render live — no exporting, no formulas, no rebuilding",
  "Trends surface automatically, weeks before month-end",
];

const SWITCH_REASONS = [
  {
    icon: PieChart,
    title: "Every Category, One Glance",
    desc: "See exactly how your spending splits across categories without opening a single filter.",
  },
  {
    icon: RefreshCw,
    title: "Always Current, Never Stale",
    desc: "Every chart updates the moment a transaction lands — no refresh, no export, no rebuild.",
  },
];

const CATEGORY_BREAKDOWN = [
  { label: "Dining", amount: "AED 1,240", pct: 100 },
  { label: "Groceries", amount: "AED 980", pct: 79 },
  { label: "Transport", amount: "AED 860", pct: 69 },
  { label: "Subscriptions", amount: "AED 540", pct: 44 },
];

const TREND_POINTS = [8, 22, 16, 34, 28, 46, 40, 58];

const DAILY_USE = [
  {
    icon: Eye,
    title: "Check Your Spending at a Glance, Every Day",
    desc: "Opening a spreadsheet to see how the month is going is where most people give up on tracking. Fixpenses shows a live breakdown the moment you open the app, so the answer is always one glance away.",
  },
  {
    icon: PieChart,
    title: "Break Down Spending by Category Automatically",
    desc: "Sorting transactions into categories by hand eats up time nobody has. Fixpenses categorizes every expense as it happens, so your breakdown is always accurate without any manual sorting.",
  },
  {
    icon: TrendingUp,
    title: "Track Trends Before They Become a Problem",
    desc: "A single big month is easy to miss without something to compare it against. Fixpenses charts every category over time, so a creeping trend shows up clearly instead of staying invisible until it's a shortfall.",
  },
  {
    icon: CalendarRange,
    title: "Filter Any Report by Date Range Instantly",
    desc: "Digging through statements to answer 'how much did I spend last quarter' wastes an afternoon. Fixpenses narrows any report to a custom date range in a couple of taps, with the chart updating instantly.",
  },
  {
    icon: FileText,
    title: "Export a Clean Report Whenever You Need One",
    desc: "Sharing your numbers with an accountant or a partner shouldn't mean rebuilding a spreadsheet. Fixpenses exports a clean report straight from your real data, ready to send as-is.",
  },
  {
    icon: RefreshCw,
    title: "Watch Every Chart Update in Real Time",
    desc: "A report that needs refreshing is already behind. Fixpenses updates every chart the instant a transaction is logged, so what you're looking at is always what's actually true.",
  },
];

const PILLARS = [
  {
    icon: RefreshCw,
    title: "Real-Time, Always-Current Charts",
    desc: "Fixpenses updates every report the instant a transaction lands, so what you see is never a stale end-of-month snapshot.",
  },
  {
    icon: Layers,
    title: "Built for Every Account & Card",
    desc: "Break down spending by category, by card, or by bank account — every report works the same way across all of them.",
  },
  {
    icon: Workflow,
    title: "Connected to Your Transactions",
    desc: "Reports pull straight from your tracked expenses, so nothing needs to be exported, reformatted, or entered twice.",
  },
  {
    icon: ShieldCheck,
    title: "Secure, Cloud-Based & Built to Scale",
    desc: "Your financial data stays protected in the cloud and accessible whenever you need it, on any device, as your finances grow.",
  },
];

const STEPS = [
  {
    number: "01",
    icon: Receipt,
    title: "Log or Connect Your Transactions",
    desc: "Track expenses manually or connect your cards and accounts. Either way, every transaction feeds straight into your reports.",
  },
  {
    number: "02",
    icon: BarChart2,
    title: "Watch Your Reports Build Themselves",
    desc: "Category breakdowns, trend charts, and monthly summaries update automatically — no formulas, no manual entry, no waiting.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Review, Filter & Act On What You See",
    desc: "Narrow any report to a card, account, or date range, spot what's changed, and adjust your spending before it becomes a problem.",
  },
];

const TRACKABLES = [
  {
    icon: PieChart,
    title: "Category Breakdowns",
    desc: "See exactly how your spending splits across every category, updated the moment a transaction happens.",
  },
  {
    icon: TrendingUp,
    title: "Monthly & Spending Trends",
    desc: "Compare spending across months automatically, so a pattern shows up clearly instead of staying buried in statements.",
  },
  {
    icon: CreditCard,
    title: "Card & Account Reports",
    desc: "Break any report down by credit card or bank account, so you always know where each dirham actually came from.",
  },
  {
    icon: CalendarRange,
    title: "Custom Date-Range Filtering",
    desc: "Narrow any chart to last week, last quarter, or a custom range, with every number recalculating instantly.",
  },
];

const REPORT_TIERS = [
  {
    icon: CalendarDays,
    title: "Daily Spending Report",
    tagline: "Ready the moment you open the app",
    desc: "Open the app and your day's spending is already sorted by category — no manual entry. Catching a pattern on day three beats catching it on day thirty.",
  },
  {
    icon: CalendarCheck,
    title: "Monthly Spending Summary",
    tagline: "Built the moment the month closes",
    desc: "Your daily reports roll up into one summary: total spending, category breakdowns, and how this month compares to your usual habits — no spreadsheet required.",
  },
];

const ANALYTICS_STATS = [
  { icon: PieChart, label: "Biggest category", value: "Dining · 34%" },
  { icon: CalendarRange, label: "Priciest week", value: "Week 3" },
  { icon: TrendingUp, label: "Trend direction", value: "+12% vs. usual" },
];

const MONTH_COMPARE = [
  { label: "Dining", thisMonth: "AED 1,240", delta: "+18%", up: true },
  { label: "Transport", thisMonth: "AED 640", delta: "−9%", up: false },
  { label: "Subscriptions", thisMonth: "AED 540", delta: "+2%", up: true },
];

const DIRHAM_SOURCES = [
  { icon: Landmark, label: "Bank Transfer" },
  { icon: CreditCard, label: "Card Swipe" },
  { icon: Wallet, label: "Cash" },
];

const REPORT_FAQS = [
  {
    icon: RefreshCw,
    q: "How Does Fixpenses Track My Daily And Monthly Expenses Automatically?",
    a: "Fixpenses logs each transaction as it happens and sorts it into a category, so your daily report is ready without any manual entry. At the end of the month, those daily entries roll up into a full monthly summary. You just check the app — there's no spreadsheet to build.",
  },
  {
    icon: CalendarRange,
    q: "Can I Compare My Spending Across Different Months In The Software?",
    a: "Yes, Fixpenses puts this month and previous months side by side so you can see exactly where spending went up or down. You can spot a trend early instead of noticing it only after your budget is already off track.",
  },
  {
    icon: PieChart,
    q: "What Kind Of Spending Analytics Does Fixpenses Provide?",
    a: "Fixpenses breaks your spending down by category, by week, and by month, so you can see patterns like which category takes up the biggest share of your budget or which week tends to cost the most.",
  },
  {
    icon: Landmark,
    q: "Is Fixpenses Designed For Tracking Expenses In AED/Dirhams?",
    a: "Yes, Fixpenses is built for UAE residents and tracks every expense in Dirhams, whether it's a card payment, bank transfer, or cash purchase — one clear view without converting or piecing numbers together yourself.",
  },
  {
    icon: Target,
    q: "How Can Budget Reports Help Me Stop Overspending?",
    a: "Budget reports show you where the money goes before the month ends, not after. Once you can see a category creeping up in week one or two, you have time to adjust instead of finding out when the bill is already too high.",
  },
];

export default function ExpenseReportsAnalyticsPage() {
  const maxTrend = Math.max(...TREND_POINTS);
  const trendPath = TREND_POINTS.map((v, i) => {
    const x = (i / (TREND_POINTS.length - 1)) * 100;
    const y = 40 - (v / maxTrend) * 34;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const areaPath = `${trendPath} L100,40 L0,40 Z`;

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
              Reports &amp; Analytics &middot; Start Today
            </span>
            <h1 className="se-hero-title text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              See Exactly Where Your Money{" "}
              <span className="text-[#1a9e5c] relative">
                Goes
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-[#1a9e5c]/60 via-[#1a9e5c]/30 to-transparent" />
              </span>
            </h1>
            <p className="se-hero-desc text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Every transaction becomes a chart the moment it happens.
              Fixpenses turns your spending into clear, live reports — no
              spreadsheets, no exporting, no waiting for month-end.
            </p>
            <div className="se-hero-btns flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base text-white shadow-lg shadow-[#1a9e5c]/30 se-animate-shimmer-btn border-0 hover:opacity-90 transition-opacity"
                asChild
              >
                <Link href="/signup">
                  See your reports <ArrowRight className="ml-2 h-4 w-4" />
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
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
                  Budgets, Reports &amp; Analytics: Track Every Dirham You
                  Spend, Daily And Monthly
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Managing money gets easier once you can actually see where
                  it goes. Fixpenses breaks down your spending by day and by
                  month, so every dirham is accounted for instead of
                  disappearing into a vague monthly total.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you&apos;re checking in after a busy week or
                  reviewing your whole month, the numbers are laid out in a
                  way you can act on right away.
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
                Stop rebuilding the same spreadsheet every month. Fixpenses
                charts every transaction the moment it lands, breaks it down
                by category automatically, and keeps your reports{" "}
                <span className="text-[#1a9e5c]">always current</span> — not
                just accurate on the day you built them.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── What Are Reports & Analytics? ───────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                What Are Reports &amp; Analytics in Fixpenses?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Most budgeting apps show you a single number at the end of
                the month — by then it&apos;s too late to change anything.
                Fixpenses works differently: you get a daily breakdown as
                you spend, plus a monthly view that pulls everything
                together, so small habits become visible before they turn
                into a real dent in your budget.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Fixpenses replaces the manual work of pulling numbers into a
                spreadsheet with reports that build themselves. Every
                transaction you log, a card swipe, a cash expense, a
                recurring bill, feeds straight into your category
                breakdowns, trend charts, and monthly summaries, updated the
                moment it happens.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left">
              <div className="bg-muted/30 border border-border rounded-3xl p-8">
                <div className="relative pl-2">
                  <div className="absolute left-[27px] top-3 bottom-3 w-px bg-gradient-to-b from-[#1a9e5c]/50 via-[#1a9e5c]/30 to-transparent" />
                  <div className="space-y-6">
                    {REPORT_FLOW.map(({ icon: Icon, label }) => (
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

        {/* ─── Daily & Monthly report tiers ────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <AnimateOnScroll
            type="fade-up"
            className="text-center max-w-2xl mx-auto space-y-3 mb-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              See Where Your Money Goes, Daily &amp; Monthly
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll
            type="stagger"
            className="grid sm:grid-cols-2 rounded-3xl border border-border overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border"
          >
            {REPORT_TIERS.map(({ icon: Icon, title, tagline, desc }) => (
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
              </div>
            ))}
          </AnimateOnScroll>
        </section>

        {/* ─── Spreadsheets vs Live Reports comparison ────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <AnimateOnScroll
              type="fade-up"
              className="text-center max-w-2xl mx-auto space-y-4 mb-6"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Spreadsheets vs. Live Reports: Which Costs You More?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A spreadsheet is accurate the day you build it and stale
                every day after. Fixpenses keeps every chart current
                automatically, so you&apos;re always looking at what&apos;s
                actually happening, not last month&apos;s snapshot.
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
                  Manual Spreadsheets
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

        {/* ─── Why people trust Fixpenses reports ─────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <AnimateOnScroll
            type="fade-up"
            className="text-center max-w-2xl mx-auto space-y-4 mb-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Why People Trust Fixpenses Reports
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A report only helps if it reflects what&apos;s actually
              happening. Here&apos;s what changes once your charts stop
              being a monthly chore.
            </p>
          </AnimateOnScroll>

          <div className="space-y-5">
            <AnimateOnScroll type="fade-up">
              <div className="rounded-3xl border border-border bg-background p-8 flex flex-col sm:flex-row items-center gap-8 hover:border-[#1a9e5c]/30 hover:shadow-lg transition-all">
                <div className="w-full sm:w-56 shrink-0">
                  <svg viewBox="0 0 100 40" className="w-full h-20" aria-hidden="true">
                    <path
                      d={areaPath}
                      fill="#1a9e5c"
                      fillOpacity="0.1"
                      stroke="none"
                    />
                    <path
                      d={trendPath}
                      fill="none"
                      stroke="#1a9e5c"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {[0, TREND_POINTS.length - 1].map((i) => {
                      const x = (i / (TREND_POINTS.length - 1)) * 100;
                      const y = 40 - (TREND_POINTS[i] / maxTrend) * 34;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="3"
                          fill="#1a9e5c"
                        />
                      );
                    })}
                  </svg>
                  <p className="text-[11px] font-medium text-muted-foreground text-center mt-1">
                    Dining spend, last 8 weeks
                  </p>
                </div>

                <div className="text-center sm:text-left">
                  <div className="w-11 h-11 rounded-2xl bg-[#1a9e5c]/10 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                    <TrendingUp className="w-5 h-5 text-[#1a9e5c]" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1.5">
                    Spot Trends Weeks Before Month-End
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                    Fixpenses charts your spending as it happens, so a
                    creeping category shows up as a trend line, not a
                    surprise on your statement.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll
              type="stagger"
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {SWITCH_REASONS.map(({ icon: Icon, title, desc }) => (
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

        {/* ─── Smart spending analytics (stat band) ────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <AnimateOnScroll
            type="fade-up"
            className="rounded-3xl border border-border bg-gradient-to-r from-[#1a9e5c]/5 via-background to-background p-6 sm:p-8"
          >
            <div className="grid sm:grid-cols-[1.1fr_1fr] gap-6 sm:gap-10 items-center">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Turn Raw Numbers Into Insights With Smart Spending
                  Analytics
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A list of transactions doesn&apos;t tell you much on its
                  own. Fixpenses turns that raw data into patterns you can
                  actually use, so you get a clear picture of your habits
                  instead of scrolling through a transaction history.
                </p>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-1 gap-3">
                {ANALYTICS_STATS.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 bg-background border border-border rounded-2xl px-4 py-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#1a9e5c]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* ─── Category breakdown showcase ─────────────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimateOnScroll type="fade-right" className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    See Your Spending Broken Down, Category by Category
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    A number without context doesn&apos;t tell you anything.
                    Fixpenses breaks every month down by category
                    automatically, so you know not just how much you spent,
                    but exactly where it went.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground">
                    Filter by Card, Account, or Date Range
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Look at spend from one credit card, one bank account, or
                    a custom date range without exporting anything. Every
                    report narrows instantly to the slice you care about.
                  </p>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll type="fade-left" className="flex justify-center">
                <div className="relative w-full max-w-sm">
                  <div className="absolute inset-0 bg-[#1a9e5c]/15 rounded-3xl blur-2xl scale-95 se-animate-pulse-glow" />
                  <div className="relative bg-background border border-border rounded-3xl shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
                      <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                      <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                      <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                      <span className="ml-2 text-xs font-semibold text-foreground">
                        Category breakdown &middot; August
                      </span>
                    </div>
                    <div className="p-5 space-y-4">
                      {CATEGORY_BREAKDOWN.map(({ label, amount, pct }, i) => (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-foreground">
                              {label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {amount}
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#1a9e5c]"
                              style={{
                                width: `${pct}%`,
                                opacity: 1 - i * 0.2,
                              }}
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

        {/* ─── Month-over-month comparison ─────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <AnimateOnScroll
            type="fade-up"
            className="text-center max-w-2xl mx-auto space-y-3 mb-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Compare This Month&apos;s Expenses To Last Month, In One Tap
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Spending rarely stays the same from one month to the next.
              Fixpenses lines up your spending across weeks and months so
              patterns stand out early, before they affect your savings
              goals.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll
            type="fade-up"
            className="rounded-3xl border border-border bg-background overflow-hidden"
          >
            <div className="grid grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 py-4 border-b border-border bg-muted/30">
              <span className="text-xs font-semibold text-foreground">
                This Month
              </span>
              <span className="text-[10px] font-bold text-muted-foreground px-2">
                VS
              </span>
              <span className="text-xs font-semibold text-muted-foreground text-right">
                Last Month
              </span>
            </div>
            <div className="divide-y divide-border">
              {MONTH_COMPARE.map(({ label, thisMonth, delta, up }) => (
                <div
                  key={label}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 sm:px-8 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {thisMonth}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
                      up
                        ? "bg-rose-500/10 text-rose-600"
                        : "bg-[#1a9e5c]/10 text-[#1a9e5c]"
                    }`}
                  >
                    {up ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {delta}
                  </span>
                  <p className="text-xs text-muted-foreground text-right">
                    vs. last month
                  </p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
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
              Reports That Never Fall Behind
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

        {/* ─── Built for UAE residents ──────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
          <AnimateOnScroll type="fade-up" className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Built for UAE Residents Who Want Total Control Over Their
              Dirhams
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Managing money in the UAE comes with its own rhythm — salaries
              often land at the start of the month, rent and bills are paid
              in bulk, and daily spending happens in cash or across
              multiple cards. Fixpenses is built around that pattern,
              tracking every dirham no matter how it moves.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll
            type="stagger"
            className="flex flex-wrap justify-center gap-4 pt-6"
          >
            {DIRHAM_SOURCES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 bg-background border border-border rounded-full pl-3 pr-5 py-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#1a9e5c]" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
              </div>
            ))}
          </AnimateOnScroll>
        </section>

        {/* ─── Why people choose us (pillar strip) ────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <AnimateOnScroll
              type="fade-up"
              className="text-center max-w-2xl mx-auto space-y-4 mb-6"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Why People Choose Our Reporting Software
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Fixpenses reports aren&apos;t a separate tool bolted onto
                your expense tracking — they run on the same live data, so
                every chart reflects reality the instant a transaction
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
              How Fixpenses Reports &amp; Analytics Work
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Getting your first live report takes three simple steps, and
              your charts start building themselves the same day.
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

        {/* ─── Everything you can report on (dark grid) ───────── */}
        <section className="bg-[#0f1f17]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <AnimateOnScroll
              type="fade-up"
              className="text-center max-w-2xl mx-auto space-y-4 mb-6"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Everything You Can Report On
              </h2>
              <p className="text-white/70 leading-relaxed">
                Fixpenses gives you one system to see every angle of your
                spending, so nothing gets missed and nothing needs a
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
                  Everything you need to know about daily and monthly
                  reports, analytics, and tracking in AED. Still curious?
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
                {REPORT_FAQS.map(({ icon: Icon, q, a }) => (
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
              See Your Numbers Clearly
            </h2>
            <p className="text-lg text-white/80">
              You don&apos;t need a spreadsheet or a complicated setup to
              start. Add your first expense today, and by the end of the
              week you&apos;ll already have a daily and weekly view of
              where your dirhams are going — free, no credit card required.
            </p>
            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-white text-[#0f1f17] hover:bg-white/90 font-semibold shadow-lg"
                asChild
              >
                <Link href="/signup">
                  See your reports <ArrowRight className="ml-2 h-4 w-4" />
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
