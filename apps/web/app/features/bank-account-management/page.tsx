import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Building2,
  Landmark,
  Wallet,
  RefreshCw,
  PiggyBank,
  History,
  CreditCard,
  LayoutDashboard,
  ArrowLeftRight,
  ShieldCheck,
  KeyRound,
  Lock,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Bank Account Management Made Simple with Fixpenses",
  description:
    "Track bank accounts and credit cards together, review transaction history by account, and stay in full control of your data.",
  keywords: [
    "UAE bank account tracker",
    "multiple bank accounts UAE",
    "bank balance tracker app",
    "net worth tracker UAE",
    "AED bank balance app",
    "manual bank account tracking",
    "bank and credit card tracker UAE",
  ],
  alternates: {
    canonical: `${SITE_URL}/features/bank-account-management`,
  },
  openGraph: {
    title: "Bank Account Management Made Simple with Fixpenses",
    description:
      "Track bank accounts and credit cards together, review transaction history by account, and stay in full control of your data.",
    url: `${SITE_URL}/features/bank-account-management`,
  },
};

const ACCOUNTS_PREVIEW = [
  { icon: Landmark, name: "Emirates NBD", type: "Current", amount: "AED 8,240" },
  { icon: Building2, name: "ADCB", type: "Savings", amount: "AED 14,900" },
  { icon: Wallet, name: "Wio Bank", type: "Current", amount: "AED 2,115" },
];

const HISTORY_ACCOUNTS = [
  {
    name: "Emirates NBD",
    rows: [
      { label: "Carrefour", amount: "-AED 186" },
      { label: "Salary", amount: "+AED 12,000" },
    ],
  },
  {
    name: "ADCB",
    rows: [
      { label: "DEWA", amount: "-AED 340" },
      { label: "Transfer in", amount: "+AED 1,500" },
    ],
  },
];

const CONTROL_POINTS = [
  {
    icon: KeyRound,
    title: "No bank login, ever",
    desc: "Fixpenses never asks for your bank credentials or API access.",
  },
  {
    icon: Lock,
    title: "You enter every number",
    desc: "Account details and balances are added by you, not pulled automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Nothing runs in the background",
    desc: "There's no automated connection quietly syncing with your bank.",
  },
];

const FAQS = [
  {
    icon: Landmark,
    q: "How Many Bank Accounts Can I Add to Fixpenses?",
    a: "There's no limit, you can add as many accounts as you actually use. Each one gets its own space on your dashboard, so adding more accounts never mixes up your balances or transaction history.",
  },
  {
    icon: KeyRound,
    q: "Does Fixpenses Need My Banking Login or Credentials?",
    a: "No, Fixpenses never asks for your bank login or API access. You add your account details and balances yourself, so your banking credentials stay with your bank and nowhere else.",
  },
  {
    icon: RefreshCw,
    q: "Does My Balance Update Automatically as I Spend?",
    a: "Your balance updates the moment you log a transaction, so the number on your dashboard reflects what's actually there. There's no need to manually refresh or cross-check it against a bank statement.",
  },
  {
    icon: PiggyBank,
    q: "Can I See My Total Balance Across All Accounts at Once?",
    a: "Yes, Fixpenses combines every account into a single net-worth widget, so your total cash position is one number instead of several you'd otherwise add up yourself. That total updates as each account changes.",
  },
  {
    icon: CreditCard,
    q: "Can I Track Bank Accounts and Credit Cards in the Same Dashboard?",
    a: "Yes, bank accounts and credit cards sit side by side in Fixpenses, so you can see your full financial position, cash and debt, in one place instead of switching between two separate views.",
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

export default function BankAccountsPage() {
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
              Bank Accounts &middot; Start Today
            </span>
            <h1 className="se-hero-title text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Manage All Your UAE Bank Accounts from{" "}
              <span className="text-[#1a9e5c] relative">
                One Dashboard
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-[#1a9e5c]/60 via-[#1a9e5c]/30 to-transparent" />
              </span>{" "}
              with Fixpenses
            </h1>
            <p className="se-hero-desc text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Checking your cash position across two or three bank accounts
              usually means logging into each one separately just to add up
              the numbers. Fixpenses brings every account into one dashboard,
              so you can see your total balance without switching between
              banking apps.
            </p>
            <div className="se-hero-btns flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base text-white shadow-lg shadow-[#1a9e5c]/30 se-animate-shimmer-btn border-0 hover:opacity-90 transition-opacity"
                asChild
              >
                <Link href="/signup">
                  Add your accounts <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-[#1a9e5c]/30 hover:border-[#1a9e5c]/60 hover:bg-[#1a9e5c]/5 transition-all"
                asChild
              >
                <Link href="#net-worth">See how it works</Link>
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
              <p className="text-xl sm:text-2xl font-semibold text-foreground leading-snug">
                Add your accounts once, and Fixpenses keeps the picture
                current from there. You get{" "}
                <span className="text-[#1a9e5c]">
                  one clear view of your cash
                </span>{" "}
                instead of piecing it together account by account.
              </p>
            </div>
          </AnimateOnScroll>
        </section>

        {/* ─── Add every account ───────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#1a9e5c]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Add Every Bank Account and See Your Full Cash Position
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Adding an account takes seconds, and there&apos;s no limit on
                how many you can connect, whether you bank with one
                institution or several across the UAE. Each account gets its
                own space on your dashboard, so you always know which balance
                belongs to which account.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Once your accounts are added, you get a full view of your
                cash position at a glance, every balance laid out side by
                side. That makes it easier to decide where to move money
                next, instead of adding up numbers from memory.
              </p>
              <InlineCta
                href="/signup"
                label="Add your first bank account to Fixpenses in seconds."
              />
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left">
              <div className="bg-muted/30 border border-border rounded-3xl p-6 sm:p-8 space-y-3">
                {ACCOUNTS_PREVIEW.map(({ icon: Icon, name, type, amount }) => (
                  <div
                    key={name}
                    className="flex items-center gap-4 bg-background border border-border rounded-2xl p-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#1a9e5c]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {name}
                      </p>
                      <p className="text-xs text-muted-foreground">{type}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground shrink-0">
                      {amount}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-center gap-2 border-2 border-dashed border-[#1a9e5c]/30 rounded-2xl p-4 text-sm font-medium text-[#1a9e5c]">
                  + Add another account
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Real-time balance ───────────────────────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimateOnScroll
                type="fade-right"
                className="order-2 lg:order-1 flex justify-center"
              >
                <div className="relative w-full max-w-xs">
                  <div className="absolute inset-0 bg-[#1a9e5c]/15 rounded-3xl blur-2xl scale-95 se-animate-pulse-glow" />
                  <div className="relative bg-background border border-border rounded-3xl shadow-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-[#1a9e5c]" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          Wio Bank
                        </p>
                      </div>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a9e5c] opacity-60" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1a9e5c]" />
                      </span>
                    </div>
                    <p className="text-3xl font-extrabold text-foreground">
                      AED 2,115.00
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#1a9e5c]">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Updated just now
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                type="fade-left"
                className="order-1 lg:order-2 space-y-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-[#1a9e5c]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Track Your Real-Time Balance Across Every Account
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Checking whether an account balance is actually up to date
                  usually means opening the bank&apos;s app and hoping it
                  refreshed recently. Fixpenses updates your balance the
                  moment you log a transaction, so the number on your
                  dashboard reflects what&apos;s really there.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You don&apos;t need to manually refresh or double-check
                  against a bank statement. Every account stays current at
                  the same time, so you&apos;re always working from real
                  numbers, not a balance that&apos;s a few days old.
                </p>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── Combined net worth widget ───────────────────────── */}
        <section id="net-worth" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-[#1a9e5c]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                See Your Combined Net Worth in One Dashboard Widget
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Adding up balances across several accounts by hand is easy to
                get wrong, especially when the numbers change throughout the
                day. Fixpenses combines every account into a single
                net-worth widget, so your total cash position is one number,
                not several you have to add together yourself.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                That combined view updates as each account changes, so you
                always know exactly where you stand overall. It&apos;s a
                faster way to answer &ldquo;how much do I actually
                have&rdquo; than opening each account one at a time.
              </p>
              <InlineCta
                href="/signup"
                label="See your combined net worth update in real time."
              />
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left" className="flex justify-center">
              <div className="relative w-full max-w-[280px]">
                <div className="absolute inset-0 bg-[#1a9e5c]/15 rounded-[2.5rem] blur-2xl scale-95 se-animate-pulse-glow" />
                <div className="relative bg-background border-[6px] border-foreground/90 rounded-[2.5rem] shadow-2xl overflow-hidden">
                  <div className="bg-[#1a9e5c] px-4 py-3 flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-semibold">
                      Net worth
                    </span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="text-center py-2">
                      <p className="text-2xl font-extrabold text-foreground">
                        AED 25,255
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Across 3 accounts
                      </p>
                    </div>
                    {ACCOUNTS_PREVIEW.map(({ name, amount }) => (
                      <div
                        key={name}
                        className="flex items-center justify-between bg-muted rounded-xl px-3 py-2"
                      >
                        <p className="text-xs font-semibold text-foreground">
                          {name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {amount}
                        </p>
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
        </section>

        {/* ─── Per-account transaction history ─────────────────── */}
        <section className="bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimateOnScroll
                type="fade-right"
                className="order-2 lg:order-1 grid sm:grid-cols-2 gap-4"
              >
                {HISTORY_ACCOUNTS.map(({ name, rows }) => (
                  <div
                    key={name}
                    className="bg-background border border-border rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#1a9e5c]/10 flex items-center justify-center">
                        <Landmark className="w-3.5 h-3.5 text-[#1a9e5c]" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        {name}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {rows.map(({ label, amount }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground">
                            {label}
                          </span>
                          <span
                            className={
                              amount.startsWith("+")
                                ? "text-[#1a9e5c] font-medium"
                                : "text-foreground font-medium"
                            }
                          >
                            {amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </AnimateOnScroll>

              <AnimateOnScroll
                type="fade-left"
                className="order-1 lg:order-2 space-y-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                  <History className="w-5 h-5 text-[#1a9e5c]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Review Transaction History for Each Account Separately
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Mixing transactions from multiple accounts into one long
                  list makes it hard to tell which purchase came from where.
                  Fixpenses keeps a separate transaction history for each
                  account, so you can review one account at a time without
                  sorting through the others.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You can check a specific account when you need detail, or
                  step back and look at everything together when you want
                  the bigger picture. Either way, the history is organized
                  by account from the start, not something you have to
                  filter after the fact.
                </p>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ─── Bank accounts + credit cards together ───────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateOnScroll type="fade-right" className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-[#1a9e5c]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Track Bank Accounts and Credit Cards Together
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Looking at your bank balances without factoring in credit
                card debt only gives you half the picture. Fixpenses tracks
                your bank accounts and credit cards side by side, so you can
                see your full financial position in one place instead of
                switching between two separate views.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                That combined view makes it easier to plan a big purchase or
                a payment, since you&apos;re weighing your actual cash
                against what you owe, not just one or the other. Everything
                you need to make that call sits on the same dashboard.
              </p>
              <InlineCta
                href="/features/credit-card-management"
                label="See how Fixpenses tracks your credit cards too."
              />
            </AnimateOnScroll>

            <AnimateOnScroll type="fade-left">
              <div className="bg-muted/30 border border-border rounded-3xl p-8 flex flex-col items-center gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center">
                      <Landmark className="w-6 h-6 text-[#1a9e5c]" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Bank accounts
                    </p>
                  </div>
                  <ArrowLeftRight className="w-5 h-5 text-[#1a9e5c]/50" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-[#1a9e5c]" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Credit cards
                    </p>
                  </div>
                </div>
                <div className="w-px h-6 bg-[#1a9e5c]/30" />
                <div className="flex items-center gap-2 bg-[#1a9e5c]/10 border border-[#1a9e5c]/20 rounded-2xl px-5 py-3">
                  <LayoutDashboard className="w-5 h-5 text-[#1a9e5c]" />
                  <p className="text-sm font-semibold text-[#1a9e5c]">
                    One Fixpenses dashboard
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ─── Full control, no credentials (dark) ─────────────── */}
        <section className="bg-[#0f1f17]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <AnimateOnScroll
              type="fade-up"
              className="text-center max-w-2xl mx-auto space-y-4 mb-6"
            >
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5 text-[#22d47a]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Stay in Full Control, No Bank Credentials Required
              </h2>
              <p className="text-white/70 leading-relaxed">
                Handing over your banking login to a third-party app is a
                fair thing to hesitate over. Fixpenses never asks for your
                bank credentials or API access, you add your account details
                and balances yourself, so your login information stays with
                your bank and nowhere else. That means you&apos;re always the
                one entering and updating your numbers, not an automated
                connection working in the background. It&apos;s a manual
                process by design, built around keeping you in control of
                your own data.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll
              type="stagger"
              className="grid grid-cols-1 sm:grid-cols-3 gap-5"
            >
              {CONTROL_POINTS.map(({ icon: Icon, title, desc }) => (
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

        {/* ─── FAQs ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden se-dot-grid border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-muted/30 pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
                  Everything you need to know about tracking your bank
                  accounts in Fixpenses. Still curious?
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
            className="relative max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-center space-y-5"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Start Tracking Your Bank Accounts in Fixpenses Today
            </h2>
            <p className="text-lg text-white/80">
              Adding your first account takes less time than logging into
              your bank&apos;s app. From there, Fixpenses keeps your balance
              current, your net worth in view, and your transaction history
              organized by account.
            </p>
            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-white text-[#0f1f17] hover:bg-white/90 font-semibold shadow-lg"
                asChild
              >
                <Link href="/signup">
                  Add your bank accounts <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-white/60">
              The sooner your accounts are added, the sooner you stop adding
              up balances by hand.
            </p>
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
