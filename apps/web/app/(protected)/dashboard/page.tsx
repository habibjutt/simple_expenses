"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreditCardModal from "@/components/credit-card-modal";
import BankAccountModal from "@/components/bank-account-modal";
import TransactionModal from "@/components/transaction-modal";
import PlanLimitAlert, { type PlanLimitType } from "@/components/PlanLimitAlert";
import type { GuardResult } from "@/lib/plan-guards";
import { PLAN_LIMITS, type PlanLimits } from "@/lib/plans";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboardData } from "@/app/api/dashboard-action";
import { deleteCreditCard } from "@/app/api/credit-card-action";
import { deleteBankAccount } from "@/app/api/bank-account-action";
import { seedDefaultCategories } from "@/app/api/category-action";
import { getReportData } from "@/app/api/reports-action";
import { getUserProfile, completeOnboarding } from "@/app/api/user-action";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import {
  CreditCard as CreditCardIcon,
  Wallet,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronRight,
  Settings2,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  BarChart2,
  Target,
  Calendar,
  ArrowRight,
  Tag,
  CheckCircle2,
  X,
} from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import EmptyState from "@/components/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ACCOUNT_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-orange-500",
];

type CreditCardType = {
  id: string;
  name: string;
  billGenerationDate: number;
  paymentDate: number;
  cardLimit: number;
  availableBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};
type BankAccount = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};
type Invoice = {
  cardId: string;
  cardName: string;
  billStartDate: Date;
  billEndDate: Date;
  paymentDueDate: Date;
  totalAmount: number;
  invoice: { id: string; isPaid: boolean; paidAmount: number } | null;
};
type NextBill = {
  cardId: string;
  nextBillStartDate: Date;
  nextBillEndDate: Date;
  nextPaymentDueDate: Date;
  totalAmount: number;
};
type CategoryStat = {
  category: string;
  amount: number;
  color: string;
  icon: string;
};

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [hasTransactions, setHasTransactions] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [nextBills, setNextBills] = useState<NextBill[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [editCard, setEditCard] = useState<CreditCardType | null>(null);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [monthIncome, setMonthIncome] = useState(0);
  const [monthExpenses, setMonthExpenses] = useState(0);
  const [topCategories, setTopCategories] = useState<CategoryStat[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    boolean | null
  >(null);
  const [dismissChecklist, setDismissChecklist] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState<string | null>(
    null,
  );
  const [planLimits, setPlanLimits] = useState<PlanLimits>(PLAN_LIMITS.free);
  const [planAlert, setPlanAlert] = useState<{
    limitType: PlanLimitType;
    guardResult: GuardResult;
  } | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      // Single consolidated query (replaces 5 separate server action calls)
      const [dashData, profile] = await Promise.all([
        getDashboardData(),
        getUserProfile(),
      ]);
      setCreditCards(dashData.creditCards);
      setBankAccounts(dashData.bankAccounts);
      setHasTransactions(dashData.hasTransactions);
      setInvoices(dashData.invoices);
      setNextBills(dashData.nextBills);
      setOnboardingCompleted(profile?.onboardingCompleted ?? true);
      if (profile?.preferredCurrency)
        setPreferredCurrency(profile.preferredCurrency);
      if (profile?.planLimits) setPlanLimits(profile.planLimits);

      const now = new Date();
      try {
        const reportData = await getReportData(
          now.getMonth() + 1,
          now.getFullYear(),
        );
        setMonthIncome(reportData.totalIncome);
        setMonthExpenses(reportData.totalExpenses);
        setTopCategories(reportData.expenseStats.slice(0, 5));
      } catch {
        /* reports optional */
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending]);

  useEffect(() => {
    if (onboardingCompleted === false) router.push("/onboarding");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingCompleted]);

  useEffect(() => {
    if (session && !dataLoaded) {
      setDataLoaded(true);
      fetchAll();
      seedDefaultCategories().catch(() => {});
    }
  }, [session, dataLoaded, fetchAll]);

  // ── Derived values (memoised to avoid re-computation on unrelated renders) ──
  const totalBalance = useMemo(
    () => bankAccounts.reduce((s, a) => s + a.currentBalance, 0),
    [bankAccounts],
  );
  const totalBills = useMemo(
    () => invoices.reduce((s, i) => s + i.totalAmount, 0),
    [invoices],
  );
  const totalNextBills = useMemo(
    () => nextBills.reduce((s, b) => s + b.totalAmount, 0),
    [nextBills],
  );
  const sortedAccounts = useMemo(
    () => [...bankAccounts].sort((a, b) => a.name.localeCompare(b.name)),
    [bankAccounts],
  );
  const sortedCards = useMemo(
    () => [...creditCards].sort((a, b) => a.name.localeCompare(b.name)),
    [creditCards],
  );
  const fmt = useCallback(
    (v: number) => {
      if (loading || preferredCurrency === null) return "—";
      return showBalance ? formatCurrency(v, preferredCurrency) : "•••••";
    },
    [loading, showBalance, preferredCurrency],
  );

  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      try {
        await deleteCreditCard(cardId);
        await fetchAll();
        setDeleteCardId(null);
      } catch (err) {
        console.error(err);
      }
    },
    [fetchAll],
  );

  const handleDeleteAccount = useCallback(
    async (accountId: string) => {
      try {
        await deleteBankAccount(accountId);
        await fetchAll();
        setDeleteAccountId(null);
      } catch (err) {
        console.error(err);
      }
    },
    [fetchAll],
  );

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f7f8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-[#1a9e5c] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }
  if (!session) return null;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const now = new Date();
  const currentMonth = now.toLocaleString("en-US", { month: "long" });

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />

      <main className="pb-20 lg:pb-8">
        {/* ── Welcome Banner ──────────────────────────────────────── */}
        <div className="bg-[#1a9e5c] text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm">
                  {getGreeting()},{" "}
                  <span className="font-semibold text-white">
                    {session.user.name || session.user.email?.split("@")[0]}
                  </span>{" "}
                  👋
                </p>
                <p className="text-white/60 text-xs mt-0.5">
                  {currentMonth} {now.getFullYear()} · Financial Overview
                </p>
              </div>
              <button
                onClick={() => setShowBalance((b) => !b)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Toggle balance visibility"
              >
                {showBalance ? (
                  <EyeOff className="h-5 w-5 text-white/70" />
                ) : (
                  <Eye className="h-5 w-5 text-white/70" />
                )}
              </button>
            </div>

            {/* Month stats */}
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white/10 rounded-2xl p-2.5 sm:p-3.5">
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                  <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-300 shrink-0" />
                  <span className="text-white/60 text-[10px] sm:text-xs font-medium">
                    Expenses
                  </span>
                </div>
                <p className="text-white font-bold text-[11px] sm:text-sm leading-tight">
                  {fmt(monthExpenses)}
                </p>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 sm:p-3.5">
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                  <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-300 shrink-0" />
                  <span className="text-white/60 text-[10px] sm:text-xs font-medium">
                    Income
                  </span>
                </div>
                <p className="text-white font-bold text-[11px] sm:text-sm leading-tight">
                  {fmt(monthIncome)}
                </p>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 sm:p-3.5">
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                  <Wallet className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-sky-300 shrink-0" />
                  <span className="text-white/60 text-[10px] sm:text-xs font-medium">
                    Balance
                  </span>
                </div>
                <p className="text-white font-bold text-[11px] sm:text-sm leading-tight">
                  {fmt(totalBalance)}
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-5 flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => setIsTransactionModalOpen(true)}
                disabled={creditCards.length === 0 && bankAccounts.length === 0}
                className="flex items-center gap-2 bg-white text-[#1a9e5c] px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4 shrink-0" />
                Add Transaction
              </button>
              <button
                onClick={() => {
                  const limit = planLimits.creditCards;
                  if (limit !== null && creditCards.length >= limit) {
                    setPlanAlert({
                      limitType: "creditCard",
                      guardResult: {
                        allowed: false,
                        reason: `Your Free plan allows up to ${limit} credit card${limit === 1 ? "" : "s"}. You already have ${creditCards.length}.`,
                        currentCount: creditCards.length,
                        limit,
                        requiredPlan: "pro",
                      },
                    });
                    return;
                  }
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-white/15 text-white border border-white/20 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/25 transition-colors cursor-pointer"
              >
                <CreditCardIcon className="h-4 w-4 shrink-0" />
                Add Card
              </button>
              <button
                onClick={() => {
                  const limit = planLimits.bankAccounts;
                  if (limit !== null && bankAccounts.length >= limit) {
                    setPlanAlert({
                      limitType: "bankAccount",
                      guardResult: {
                        allowed: false,
                        reason: `Your Free plan allows up to ${limit} bank account${limit === 1 ? "" : "s"}. You already have ${bankAccounts.length}.`,
                        currentCount: bankAccounts.length,
                        limit,
                        requiredPlan: "pro",
                      },
                    });
                    return;
                  }
                  setIsBankAccountModalOpen(true);
                }}
                className="flex items-center gap-2 bg-white/15 text-white border border-white/20 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/25 transition-colors cursor-pointer"
              >
                <Wallet className="h-4 w-4 shrink-0" />
                Add Account
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
          {/* ── Overdue bills alert ─────────────────────────────── */}
          {invoices.length > 0 && (
            <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-800">
                    Bills due this month
                  </p>
                  <p className="text-xs text-red-500">
                    Total: {formatCurrency(totalBills, preferredCurrency ?? "AED")}
                  </p>
                </div>
                <Link
                  href="/manage-cards"
                  className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-0.5"
                >
                  View <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-1.5">
                {invoices.slice(0, 3).map((inv) => (
                  <div
                    key={inv.cardId}
                    className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-red-100"
                  >
                    <span className="text-sm text-red-800 font-medium">
                      {inv.cardName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-red-400">
                        Due{" "}
                        {new Date(inv.paymentDueDate).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short" },
                        )}
                      </span>
                      <span className="text-sm font-bold text-red-700">
                        {formatCurrency(
                          inv.totalAmount,
                          creditCards.find((c) => c.id === inv.cardId)
                            ?.currency ?? (preferredCurrency ?? "AED"),
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Getting Started checklist ────────────────────────── */}
          {onboardingCompleted === false && !dismissChecklist && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <Target className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">
                      Getting Started
                    </p>
                    <p className="text-xs text-emerald-600">
                      Complete your setup to get the most out of Fixpenses
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setDismissChecklist(true);
                    await completeOnboarding();
                  }}
                  className="text-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer"
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  {
                    done: true,
                    label: "Account created",
                    sub: "You're logged in and ready",
                  },
                  {
                    done: bankAccounts.length > 0,
                    label: "Add a bank account",
                    sub: "Track your savings and spending",
                    href: "/manage-accounts",
                  },
                  {
                    done: creditCards.length > 0,
                    label: "Add a credit card",
                    sub: "Monitor bills and due dates",
                    href: "/manage-cards",
                  },
                  {
                    done: hasTransactions,
                    label: "Record your first transaction",
                    sub: "Start tracking your expenses",
                    action: () => setIsTransactionModalOpen(true),
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      !item.done &&
                      (item.action
                        ? item.action()
                        : item.href && router.push(item.href))
                    }
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all",
                      item.done
                        ? "bg-white border-emerald-100 opacity-60"
                        : "bg-white border-emerald-200 hover:border-emerald-400 cursor-pointer hover:shadow-sm",
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                        item.done
                          ? "bg-emerald-500"
                          : "bg-slate-100 border-2 border-slate-200",
                      )}
                    >
                      {item.done && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          item.done
                            ? "line-through text-slate-400"
                            : "text-slate-800",
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {item.sub}
                      </p>
                    </div>
                    {!item.done && (
                      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between">
                <p className="text-xs text-emerald-600">
                  {[
                    bankAccounts.length > 0,
                    creditCards.length > 0,
                    hasTransactions,
                  ].filter(Boolean).length + 1}
                  /4 completed
                </p>
                <button
                  onClick={async () => {
                    setDismissChecklist(true);
                    await completeOnboarding();
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                >
                  Dismiss checklist
                </button>
              </div>
            </div>
          )}

          {/* ── Two-column grid ─────────────────────────────────── */}
          <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:items-start">
            {/* LEFT: Accounts + Cards (3/5) */}
            <div className="lg:col-span-3 space-y-5">
              {/* Bank Accounts */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-[#1a9e5c]" />
                    <h2 className="text-sm font-bold text-slate-800">
                      Bank Accounts
                    </h2>
                    <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                      {sortedAccounts.length}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push("/manage-accounts")}
                    className="text-xs text-[#1a9e5c] hover:text-[#158a4f] font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Settings2 className="h-3 w-3" /> Manage
                  </button>
                </div>

                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-14 rounded-xl bg-slate-100 animate-pulse"
                      />
                    ))}
                  </div>
                ) : sortedAccounts.length === 0 ? (
                  <EmptyState
                    icon={Wallet}
                    title="No accounts yet"
                    description="Add your first bank account to start tracking"
                    actionLabel="+ Add your first account"
                    onAction={() => setIsBankAccountModalOpen(true)}
                    actionStyle="link"
                    size="sm"
                  />
                ) : (
                  <div className="divide-y divide-slate-50">
                    {sortedAccounts.map((acc, i) => (
                      <button
                        key={acc.id}
                        onClick={() => router.push(`/bank-account/${acc.id}`)}
                        className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            ACCOUNT_COLORS[i % ACCOUNT_COLORS.length],
                          )}
                        >
                          <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {acc.name}
                          </p>
                          <p className="text-xs text-slate-400">Bank Account</p>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              "text-sm font-bold tabular-nums",
                              acc.currentBalance >= 0
                                ? "text-slate-800"
                                : "text-red-500",
                            )}
                          >
                            {showBalance
                              ? formatCurrency(acc.currentBalance, acc.currency)
                              : "•••••"}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 shrink-0 transition-colors" />
                      </button>
                    ))}
                    <div className="px-5 py-3 bg-slate-50 flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-medium">
                        Total balance
                      </span>
                      <span
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          totalBalance >= 0 ? "text-[#1a9e5c]" : "text-red-500",
                        )}
                      >
                        {fmt(totalBalance)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Credit Cards */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-indigo-500" />
                    <h2 className="text-sm font-bold text-slate-800">
                      Credit Cards
                    </h2>
                    <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                      {sortedCards.length}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push("/manage-cards")}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Settings2 className="h-3 w-3" /> Manage
                  </button>
                </div>

                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-20 rounded-xl bg-slate-100 animate-pulse"
                      />
                    ))}
                  </div>
                ) : sortedCards.length === 0 ? (
                  <EmptyState
                    icon={CreditCardIcon}
                    title="No credit cards yet"
                    description="Add your first credit card to start tracking"
                    actionLabel="+ Add your first card"
                    onAction={() => setIsModalOpen(true)}
                    actionStyle="link"
                    size="sm"
                  />
                ) : (
                  <div className="divide-y divide-slate-50">
                    {sortedCards.map((card) => {
                      const invoice = invoices.find(
                        (inv) => inv.cardId === card.id,
                      );
                      const nextBill = nextBills.find(
                        (b) => b.cardId === card.id,
                      );
                      const usedAmount = card.cardLimit - card.availableBalance;
                      const usedPct =
                        card.cardLimit > 0
                          ? Math.min((usedAmount / card.cardLimit) * 100, 100)
                          : 0;
                      return (
                        <button
                          key={card.id}
                          onClick={() => router.push(`/credit-card/${card.id}`)}
                          className="w-full flex items-start gap-3.5 px-5 py-4 hover:bg-slate-50 transition-colors group text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                            <CreditCardIcon className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {card.name}
                              </p>
                              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 shrink-0 mt-0.5" />
                            </div>
                            {/* Limit bar */}
                            <div className="mt-2 mb-1.5">
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>
                                  Used:{" "}
                                  {showBalance
                                    ? formatCurrency(usedAmount, card.currency)
                                    : "•••••"}
                                </span>
                                <span>
                                  Limit:{" "}
                                  {showBalance
                                    ? formatCurrency(
                                        card.cardLimit,
                                        card.currency,
                                      )
                                    : "•••••"}
                                </span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    usedPct > 80
                                      ? "bg-red-500"
                                      : usedPct > 50
                                        ? "bg-amber-500"
                                        : "bg-indigo-500",
                                  )}
                                  style={{ width: `${usedPct}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              {invoice && (
                                <span className="text-red-600 font-medium">
                                  Due{" "}
                                  {new Date(
                                    invoice.paymentDueDate,
                                  ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                  :{" "}
                                  {formatCurrency(
                                    invoice.totalAmount,
                                    card.currency,
                                  )}
                                </span>
                              )}
                              {!invoice &&
                                nextBill &&
                                nextBill.totalAmount > 0 && (
                                  <span className="text-amber-600 font-medium">
                                    Due{" "}
                                    {new Date(
                                      nextBill.nextPaymentDueDate,
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                    })}
                                    :{" "}
                                    {formatCurrency(
                                      nextBill.totalAmount,
                                      card.currency,
                                    )}
                                  </span>
                                )}
                              <span className="text-emerald-600 font-medium ml-auto">
                                Available:{" "}
                                {showBalance
                                  ? formatCurrency(
                                      card.availableBalance,
                                      card.currency,
                                    )
                                  : "•••••"}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Next upcoming bills */}
              {totalNextBills > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-amber-200/60 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-5 rounded-full bg-amber-500" />
                      <h2 className="text-sm font-bold text-slate-800">
                        Upcoming Bills
                      </h2>
                    </div>
                    <span className="text-sm font-bold text-amber-600">
                      {formatCurrency(totalNextBills, preferredCurrency ?? "AED")}
                    </span>
                  </div>
                  <div className="divide-y divide-amber-50">
                    {nextBills
                      .filter((b) => b.totalAmount > 0)
                      .map((bill) => {
                        const card = creditCards.find(
                          (c) => c.id === bill.cardId,
                        );
                        return (
                          <div
                            key={bill.cardId}
                            className="flex items-center gap-3 px-5 py-3"
                          >
                            <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
                            <span className="flex-1 text-sm text-slate-700">
                              {card?.name ?? "Card"}
                            </span>
                            <span className="text-xs text-amber-500">
                              {new Date(
                                bill.nextPaymentDueDate,
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                            <span className="text-sm font-bold text-amber-600">
                              {formatCurrency(
                                bill.totalAmount,
                                card?.currency ?? (preferredCurrency ?? "AED"),
                              )}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Quick links + Categories (2/5) */}
            <div className="lg:col-span-2 space-y-5 mt-5 lg:mt-0">
              {/* Quick Links */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
                <h3 className="text-sm font-bold text-slate-700 mb-3">
                  Quick Access
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      href: "/transactions",
                      icon: ArrowLeftRight,
                      label: "Transactions",
                      color: "bg-blue-50 text-blue-600",
                    },
                    {
                      href: "/reports",
                      icon: BarChart2,
                      label: "Reports",
                      color: "bg-purple-50 text-purple-600",
                    },
                    {
                      href: "/spending-limits",
                      icon: Target,
                      label: "Budgets",
                      color: "bg-orange-50 text-orange-600",
                    },
                    {
                      href: "/categories",
                      icon: Tag,
                      label: "Categories",
                      color: "bg-teal-50 text-teal-600",
                    },
                    {
                      href: "/manage-cards",
                      icon: CreditCardIcon,
                      label: "Cards",
                      color: "bg-indigo-50 text-indigo-600",
                    },
                    {
                      href: "/manage-accounts",
                      icon: Wallet,
                      label: "Accounts",
                      color: "bg-emerald-50 text-emerald-600",
                    },
                  ].map(({ href, icon: Icon, label, color }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex flex-col items-center gap-2 py-3 px-1 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm",
                          color,
                        )}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 text-center leading-tight">
                        {label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Top Spending Categories */}
              {topCategories.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-5 rounded-full bg-rose-500" />
                      <h2 className="text-sm font-bold text-slate-800">
                        Top Spending
                      </h2>
                    </div>
                    <Link
                      href="/reports"
                      className="text-xs text-rose-600 font-semibold flex items-center gap-0.5 hover:text-rose-800"
                    >
                      View all <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="p-4 space-y-3">
                    {topCategories.map((cat, i) => {
                      const maxAmt = topCategories[0]?.amount || 1;
                      const pct = Math.round((cat.amount / maxAmt) * 100);
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: cat.color + "22" }}
                              >
                                <CategoryIcon
                                  icon={cat.icon}
                                  className="h-3 w-3"
                                  color={cat.color}
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
                                {cat.category}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-slate-800 tabular-nums">
                              {formatCurrency(cat.amount, preferredCurrency ?? "AED")}
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: cat.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Month summary card */}
              <div className="bg-gradient-to-br from-[#1a9e5c] to-[#0d7a44] rounded-2xl shadow-sm overflow-hidden text-white p-5">
                <h3 className="text-sm font-bold text-white/80 mb-4">
                  {currentMonth} Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-200" />
                      </div>
                      <span className="text-sm text-white/80">Income</span>
                    </div>
                    <span className="text-sm font-bold">
                      {fmt(monthIncome)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                        <TrendingDown className="h-3.5 w-3.5 text-red-300" />
                      </div>
                      <span className="text-sm text-white/80">Expenses</span>
                    </div>
                    <span className="text-sm font-bold">
                      {fmt(monthExpenses)}
                    </span>
                  </div>
                  <div className="border-t border-white/15 pt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">
                      Net
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        monthIncome - monthExpenses >= 0
                          ? "text-emerald-200"
                          : "text-red-300",
                      )}
                    >
                      {fmt(monthIncome - monthExpenses)}
                    </span>
                  </div>
                </div>
                <Link
                  href="/reports"
                  className="mt-4 flex items-center justify-center gap-1.5 w-full bg-white/15 hover:bg-white/25 transition-colors rounded-xl py-2 text-xs font-semibold text-white"
                >
                  View full report <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <CreditCardModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        onSuccess={fetchAll}
        editCard={editCard}
        preferredCurrency={preferredCurrency ?? "AED"}
      />
      <BankAccountModal
        open={isBankAccountModalOpen}
        setOpen={setIsBankAccountModalOpen}
        onSuccess={fetchAll}
        editAccount={editAccount}
        preferredCurrency={preferredCurrency ?? "AED"}
      />
      <TransactionModal
        open={isTransactionModalOpen}
        setOpen={setIsTransactionModalOpen}
        onSuccess={fetchAll}
        creditCards={creditCards.map((c) => ({
          id: c.id,
          name: c.name,
          availableBalance: c.availableBalance,
          currency: c.currency,
        }))}
        bankAccounts={bankAccounts.map((b) => ({
          id: b.id,
          name: b.name,
          currentBalance: b.currentBalance,
          currency: b.currency,
        }))}
      />

      {/* Plan limit alert (shown before opening create modals) */}
      {planAlert && (
        <PlanLimitAlert
          open={!!planAlert}
          onClose={() => setPlanAlert(null)}
          limitType={planAlert.limitType}
          guardResult={planAlert.guardResult}
        />
      )}

      {/* Delete card confirm */}
      <AlertDialog
        open={!!deleteCardId}
        onOpenChange={() => setDeleteCardId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete credit card?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the card and all its invoices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCardId && handleDeleteCard(deleteCardId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete account confirm */}
      <AlertDialog
        open={!!deleteAccountId}
        onOpenChange={() => setDeleteAccountId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bank account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account and all associated
              transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteAccountId && handleDeleteAccount(deleteAccountId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
