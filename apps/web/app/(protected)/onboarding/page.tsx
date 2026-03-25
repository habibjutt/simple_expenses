"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getUserProfile, completeOnboarding, updatePreferredCurrency } from "@/app/api/user-action";
import { createBankAccount } from "@/app/api/bank-account-action";
import { createCreditCard } from "@/app/api/credit-card-action";
import { SUPPORTED_CURRENCIES } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Wallet,
  CreditCard,
  Globe,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

const QUICK_CURRENCIES = ["AED", "USD", "EUR", "GBP", "SAR", "INR", "PKR"] as const;

const STEPS = [
  { id: 0, label: "Welcome" },
  { id: 1, label: "Bank Account" },
  { id: 2, label: "Credit Card" },
  { id: 3, label: "Done" },
];

function ProgressBar({ step }: { step: number }) {
  const pct = Math.round(((step + 1) / STEPS.length) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2",
                s.id < step
                  ? "bg-[#1a9e5c] border-[#1a9e5c] text-white"
                  : s.id === step
                  ? "bg-white border-[#1a9e5c] text-[#1a9e5c]"
                  : "bg-white border-slate-200 text-slate-300"
              )}
            >
              {s.id < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.id + 1}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium hidden sm:block",
                s.id <= step ? "text-[#1a9e5c]" : "text-slate-300"
              )}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-[#1a9e5c] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {children}
    </div>
  );
}

// ── Step 0: Welcome + Currency ───────────────────────────────────────────────
function WelcomeStep({
  userName,
  currency,
  setCurrency,
  onNext,
  loading,
}: {
  userName: string;
  currency: string;
  setCurrency: (c: string) => void;
  onNext: () => void;
  loading: boolean;
}) {
  return (
    <StepWrapper>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a9e5c]/10 mb-4">
          <Sparkles className="w-8 h-8 text-[#1a9e5c]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {userName}! 👋
        </h1>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          Let&apos;s set up your account in a few quick steps.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            <Globe className="inline w-4 h-4 mr-1.5 text-slate-400" />
            Your default currency
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150",
                  currency === c
                    ? "bg-[#1a9e5c] border-[#1a9e5c] text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-[#1a9e5c]/40"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <select
            value={QUICK_CURRENCIES.includes(currency as (typeof QUICK_CURRENCIES)[number]) ? "" : currency}
            onChange={(e) => { if (e.target.value) setCurrency(e.target.value); }}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:border-[#1a9e5c] transition-colors"
          >
            <option value="">Other currencies…</option>
            {SUPPORTED_CURRENCIES.filter(
              (c) => !QUICK_CURRENCIES.includes(c.code as (typeof QUICK_CURRENCIES)[number])
            ).map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">
            What you&apos;ll set up
          </p>
          <ul className="space-y-2">
            {[
              { icon: Wallet, label: "A bank account to track cash & debit" },
              { icon: CreditCard, label: "A credit card (optional)" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm text-slate-600">
                <div className="w-6 h-6 rounded-lg bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#1a9e5c]" />
                </div>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onNext}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#1a9e5c] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#158a4e] transition-colors disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Get started <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </StepWrapper>
  );
}

// ── Step 1: Bank Account ─────────────────────────────────────────────────────
function BankAccountStep({
  currency,
  onNext,
  onSkip,
}: {
  currency: string;
  onNext: (name: string, balance: string, currency: string) => Promise<void>;
  onSkip: () => void;
}) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("0");
  const [acctCurrency, setAcctCurrency] = useState(currency);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Account name is required"); return; }
    setLoading(true);
    try {
      await onNext(name.trim(), balance, acctCurrency);
    } catch {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StepWrapper>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-3">
          <Wallet className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Add a bank account</h2>
        <p className="text-slate-500 mt-1.5 text-sm">
          Track your savings, salary, or everyday spending.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Account name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emirates NBD, Cash Wallet"
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-[#1a9e5c] transition-colors bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Current balance
            </label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-[#1a9e5c] transition-colors bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Currency
            </label>
            <select
              value={acctCurrency}
              onChange={(e) => setAcctCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-[#1a9e5c] transition-colors bg-white"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#1a9e5c] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#158a4e] transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
            Add Account <ChevronRight className="w-4 h-4" />
          </>}
        </button>
      </form>

      <button
        onClick={onSkip}
        disabled={loading}
        className="w-full mt-3 py-2.5 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
      >
        Skip for now →
      </button>
    </StepWrapper>
  );
}

// ── Step 2: Credit Card ──────────────────────────────────────────────────────
function CreditCardStep({
  currency,
  onNext,
  onSkip,
}: {
  currency: string;
  onNext: (data: { name: string; limit: string; billDate: string; paymentDate: string; currency: string }) => Promise<void>;
  onSkip: () => void;
}) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("10000");
  const [billDate, setBillDate] = useState("25");
  const [payDate, setPayDate] = useState("5");
  const [cardCurrency, setCardCurrency] = useState(currency);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Card name is required"); return; }
    setLoading(true);
    try {
      await onNext({ name: name.trim(), limit, billDate, paymentDate: payDate, currency: cardCurrency });
    } catch {
      setError("Failed to add card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <StepWrapper>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 mb-3">
          <CreditCard className="w-7 h-7 text-violet-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Add a credit card</h2>
        <p className="text-slate-500 mt-1.5 text-sm">
          Track spending, installments, and billing cycles.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Card name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emirates Islamic Visa"
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-[#1a9e5c] transition-colors bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Credit limit
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              min="0.01"
              step="any"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-[#1a9e5c] transition-colors bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Currency
            </label>
            <select
              value={cardCurrency}
              onChange={(e) => setCardCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-[#1a9e5c] transition-colors bg-white"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Bill generation day
            </label>
            <select
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-[#1a9e5c] transition-colors bg-white"
            >
              {dateOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Day invoice is issued</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Payment due day
            </label>
            <select
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-[#1a9e5c] transition-colors bg-white"
            >
              {dateOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Day payment is due</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
            Add Card <ChevronRight className="w-4 h-4" />
          </>}
        </button>
      </form>

      <button
        onClick={onSkip}
        disabled={loading}
        className="w-full mt-3 py-2.5 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
      >
        Skip for now →
      </button>
    </StepWrapper>
  );
}

// ── Step 3: Done ─────────────────────────────────────────────────────────────
function DoneStep({
  summary,
  onFinish,
  loading,
}: {
  summary: { currency: string; hasAccount: boolean; hasCard: boolean };
  onFinish: () => void;
  loading: boolean;
}) {
  const items = [
    { label: `Default currency set to ${summary.currency}`, done: true },
    { label: "Bank account added", done: summary.hasAccount },
    { label: "Credit card added", done: summary.hasCard },
  ];

  return (
    <StepWrapper>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#1a9e5c]/10 mb-5">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">You&apos;re all set!</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Here&apos;s what we set up for you. You can always add more later.
        </p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                item.done ? "bg-[#1a9e5c]/15" : "bg-slate-200"
              )}
            >
              {item.done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1a9e5c]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              )}
            </div>
            <span
              className={cn(
                "text-sm",
                item.done ? "text-slate-700 font-medium" : "text-slate-400 line-through"
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onFinish}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#1a9e5c] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#158a4e] transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </>}
      </button>
    </StepWrapper>
  );
}

// ── Main Onboarding Page ─────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState("AED");
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const [hasAccount, setHasAccount] = useState(false);
  const [hasCard, setHasCard] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    getUserProfile().then((profile) => {
      if (profile?.onboardingCompleted) {
        router.push("/dashboard");
        return;
      }
      if (profile?.preferredCurrency) {
        setCurrency(profile.preferredCurrency);
      }
      setCheckingProfile(false);
    });
  }, [session, router]);

  const handleWelcomeNext = async () => {
    setLoading(true);
    await updatePreferredCurrency(currency);
    setLoading(false);
    setStep(1);
  };

  const handleBankAccountNext = async (name: string, balance: string, curr: string) => {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("initialBalance", balance);
    fd.set("currency", curr);
    await createBankAccount(fd);
    setHasAccount(true);
    setStep(2);
  };

  const handleCreditCardNext = async (data: {
    name: string; limit: string; billDate: string; paymentDate: string; currency: string;
  }) => {
    const fd = new FormData();
    fd.set("name", data.name);
    fd.set("cardLimit", data.limit);
    fd.set("billGenerationDate", data.billDate);
    fd.set("paymentDate", data.paymentDate);
    fd.set("currency", data.currency);
    await createCreditCard(fd);
    setHasCard(true);
    setStep(3);
  };

  const handleFinish = async () => {
    setLoading(true);
    await completeOnboarding();
    router.push("/dashboard");
  };

  if (isPending || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-[#1a9e5c] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Setting up…</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const userName = session.user.name || session.user.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0faf5] via-white to-[#f5f7ff] flex flex-col items-center justify-center px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-[#1a9e5c] flex items-center justify-center">
          <span className="text-white font-bold text-sm">SE</span>
        </div>
        <span className="font-bold text-slate-800 text-base">Simple Expenses</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="mb-8">
          <ProgressBar step={step} />
        </div>

        {step === 0 && (
          <WelcomeStep
            userName={userName}
            currency={currency}
            setCurrency={setCurrency}
            onNext={handleWelcomeNext}
            loading={loading}
          />
        )}
        {step === 1 && (
          <BankAccountStep
            currency={currency}
            onNext={handleBankAccountNext}
            onSkip={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <CreditCardStep
            currency={currency}
            onNext={handleCreditCardNext}
            onSkip={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <DoneStep
            summary={{ currency, hasAccount, hasCard }}
            onFinish={handleFinish}
            loading={loading}
          />
        )}
      </div>

      <p className="mt-6 text-xs text-slate-400">
        You can skip any step and come back to it later from the dashboard.
      </p>
    </div>
  );
}
