"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreditCardModal from "@/components/credit-card-modal";
import BankAccountModal from "@/components/bank-account-modal";
import TransactionModal from "@/components/transaction-modal";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCreditCards, deleteCreditCard } from "@/app/api/credit-card-action";
import { getBankAccounts, deleteBankAccount } from "@/app/api/bank-account-action";
import { getTransactions } from "@/app/api/transaction-action";
import { getCurrentMonthInvoices, getNextBillAmounts } from "@/app/api/invoice-action";
import { seedDefaultCategories } from "@/app/api/category-action";
import { getReportData } from "@/app/api/reports-action";
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
} from "lucide-react";
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

const ACCOUNT_COLORS = ["bg-emerald-500","bg-blue-500","bg-violet-500","bg-amber-500","bg-rose-500","bg-teal-500","bg-indigo-500","bg-orange-500"];

type CreditCardType = {
  id: string; name: string; billGenerationDate: number; paymentDate: number;
  cardLimit: number; availableBalance: number; createdAt: Date; updatedAt: Date;
};
type BankAccount = {
  id: string; name: string; initialBalance: number; currentBalance: number;
  createdAt: Date; updatedAt: Date;
};
type Transaction = {
  id: string; name: string; amount: number; date: Date; category: string;
  installments: number; creditCardId: string | null; creditCard: { name: string } | null;
  bankAccountId: string | null; bankAccount: { name: string } | null;
  createdAt: Date; updatedAt: Date;
};
type Invoice = {
  cardId: string; cardName: string; billStartDate: Date; billEndDate: Date;
  paymentDueDate: Date; totalAmount: number;
  invoice: { id: string; isPaid: boolean; paidAmount: number } | null;
};
type NextBill = {
  cardId: string; nextBillStartDate: Date; nextBillEndDate: Date;
  nextPaymentDueDate: Date; totalAmount: number;
};
type CategoryStat = { category: string; amount: number; color: string };

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [, setTransactions] = useState<Transaction[]>([]);
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

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [cards, accounts, txns, invs, bills] = await Promise.all([
        getCreditCards(), getBankAccounts(), getTransactions(),
        getCurrentMonthInvoices(), getNextBillAmounts(),
      ]);
      setCreditCards(cards);
      setBankAccounts(accounts);
      setTransactions(txns);
      setInvoices(invs);
      setNextBills(bills);

      const now = new Date();
      try {
        const reportData = await getReportData(now.getMonth() + 1, now.getFullYear());
        setMonthIncome(reportData.totalIncome);
        setMonthExpenses(reportData.totalExpenses);
        setTopCategories(reportData.expenseStats.slice(0, 5));
      } catch {/* reports optional */}
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending]);

  useEffect(() => {
    if (session && !dataLoaded) {
      setDataLoaded(true);
      fetchAll();
      seedDefaultCategories().catch(() => {});
    }
  }, [session, dataLoaded]);

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

  const handleDeleteCard = async (cardId: string) => {
    try { await deleteCreditCard(cardId); await fetchAll(); setDeleteCardId(null); }
    catch (err) { console.error(err); }
  };
  const handleDeleteAccount = async (accountId: string) => {
    try { await deleteBankAccount(accountId); await fetchAll(); setDeleteAccountId(null); }
    catch (err) { console.error(err); }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const totalBalance = bankAccounts.reduce((s, a) => s + a.currentBalance, 0);
  const totalBills = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalNextBills = nextBills.reduce((s, b) => s + b.totalAmount, 0);
  const now = new Date();
  const currentMonth = now.toLocaleString("en-US", { month: "long" });
  const sortedAccounts = [...bankAccounts].sort((a, b) => a.name.localeCompare(b.name));
  const sortedCards = [...creditCards].sort((a, b) => a.name.localeCompare(b.name));

  const fmt = (v: number) => showBalance ? formatCurrency(v) : "•••••";

  // Today's transactions (recent)
  const todayStr = now.toDateString();

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />

      <main className="pb-20 lg:pb-8">
        {/* ── Welcome Banner ──────────────────────────────────────── */}
        <div className="bg-[#1a9e5c] text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm">{getGreeting()}, <span className="font-semibold text-white">{session.user.name || session.user.email?.split("@")[0]}</span> 👋</p>
                <p className="text-white/60 text-xs mt-0.5">{currentMonth} {now.getFullYear()} · Financial Overview</p>
              </div>
              <button
                onClick={() => setShowBalance((b) => !b)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Toggle balance visibility"
              >
                {showBalance ? <EyeOff className="h-5 w-5 text-white/70" /> : <Eye className="h-5 w-5 text-white/70" />}
              </button>
            </div>

            {/* Month stats */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-red-300" />
                  <span className="text-white/60 text-xs font-medium">Expenses</span>
                </div>
                <p className="text-white font-bold text-base truncate">{fmt(monthExpenses)}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-white/60 text-xs font-medium">Income</span>
                </div>
                <p className="text-white font-bold text-base truncate">{fmt(monthIncome)}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Wallet className="h-3.5 w-3.5 text-sky-300" />
                  <span className="text-white/60 text-xs font-medium">Balance</span>
                </div>
                <p className="text-white font-bold text-base truncate">{fmt(totalBalance)}</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setIsTransactionModalOpen(true)}
                disabled={creditCards.length === 0 && bankAccounts.length === 0}
                className="flex items-center gap-2 bg-white text-[#1a9e5c] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-white/15 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/25 transition-colors"
              >
                <CreditCardIcon className="h-4 w-4" />
                Add Card
              </button>
              <button
                onClick={() => setIsBankAccountModalOpen(true)}
                className="flex items-center gap-2 bg-white/15 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/25 transition-colors"
              >
                <Wallet className="h-4 w-4" />
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
                  <p className="text-sm font-bold text-red-800">Bills due this month</p>
                  <p className="text-xs text-red-500">Total: {formatCurrency(totalBills)}</p>
                </div>
                <Link href="/manage-cards" className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-0.5">
                  View <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-1.5">
                {invoices.slice(0, 3).map((inv) => (
                  <div key={inv.cardId} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-red-100">
                    <span className="text-sm text-red-800 font-medium">{inv.cardName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-red-400">Due {new Date(inv.paymentDueDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</span>
                      <span className="text-sm font-bold text-red-700">{formatCurrency(inv.totalAmount)}</span>
                    </div>
                  </div>
                ))}
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
                    <h2 className="text-sm font-bold text-slate-800">Bank Accounts</h2>
                    <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{sortedAccounts.length}</span>
                  </div>
                  <button
                    onClick={() => router.push("/manage-accounts")}
                    className="text-xs text-[#1a9e5c] hover:text-[#158a4f] font-semibold flex items-center gap-0.5"
                  >
                    <Settings2 className="h-3 w-3" /> Manage
                  </button>
                </div>

                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1,2].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}
                  </div>
                ) : sortedAccounts.length === 0 ? (
                  <div className="flex flex-col items-center py-10 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                      <Wallet className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No accounts yet</p>
                    <button
                      onClick={() => setIsBankAccountModalOpen(true)}
                      className="mt-3 text-xs text-[#1a9e5c] font-semibold hover:underline"
                    >
                      + Add your first account
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {sortedAccounts.map((acc, i) => (
                      <button
                        key={acc.id}
                        onClick={() => router.push(`/bank-account/${acc.id}`)}
                        className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", ACCOUNT_COLORS[i % ACCOUNT_COLORS.length])}>
                          <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{acc.name}</p>
                          <p className="text-xs text-slate-400">Bank Account</p>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-sm font-bold tabular-nums", acc.currentBalance >= 0 ? "text-slate-800" : "text-red-500")}>
                            {fmt(acc.currentBalance)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 shrink-0 transition-colors" />
                      </button>
                    ))}
                    <div className="px-5 py-3 bg-slate-50 flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-medium">Total balance</span>
                      <span className={cn("text-sm font-bold tabular-nums", totalBalance >= 0 ? "text-[#1a9e5c]" : "text-red-500")}>
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
                    <h2 className="text-sm font-bold text-slate-800">Credit Cards</h2>
                    <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{sortedCards.length}</span>
                  </div>
                  <button
                    onClick={() => router.push("/manage-cards")}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
                  >
                    <Settings2 className="h-3 w-3" /> Manage
                  </button>
                </div>

                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1,2].map(i => <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />)}
                  </div>
                ) : sortedCards.length === 0 ? (
                  <div className="flex flex-col items-center py-10 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                      <CreditCardIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No credit cards yet</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
                    >
                      + Add your first card
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {sortedCards.map((card) => {
                      const invoice = invoices.find(inv => inv.cardId === card.id);
                      const nextBill = nextBills.find(b => b.cardId === card.id);
                      const usedAmount = card.cardLimit - card.availableBalance;
                      const usedPct = card.cardLimit > 0 ? Math.min((usedAmount / card.cardLimit) * 100, 100) : 0;
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
                              <p className="text-sm font-semibold text-slate-800 truncate">{card.name}</p>
                              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 shrink-0 mt-0.5" />
                            </div>
                            {/* Limit bar */}
                            <div className="mt-2 mb-1.5">
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Used: {formatCurrency(usedAmount)}</span>
                                <span>Limit: {formatCurrency(card.cardLimit)}</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full transition-all", usedPct > 80 ? "bg-red-500" : usedPct > 50 ? "bg-amber-500" : "bg-indigo-500")}
                                  style={{ width: `${usedPct}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              {invoice && (
                                <span className="text-red-600 font-medium">
                                  Due: {formatCurrency(invoice.totalAmount)}
                                </span>
                              )}
                              {nextBill && nextBill.totalAmount > 0 && (
                                <span className="text-amber-600 font-medium">
                                  Next: {formatCurrency(nextBill.totalAmount)}
                                </span>
                              )}
                              <span className="text-emerald-600 font-medium ml-auto">
                                Available: {fmt(card.availableBalance)}
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
                      <h2 className="text-sm font-bold text-slate-800">Upcoming Bills</h2>
                    </div>
                    <span className="text-sm font-bold text-amber-600">{formatCurrency(totalNextBills)}</span>
                  </div>
                  <div className="divide-y divide-amber-50">
                    {nextBills.filter(b => b.totalAmount > 0).map((bill) => {
                      const card = creditCards.find(c => c.id === bill.cardId);
                      return (
                        <div key={bill.cardId} className="flex items-center gap-3 px-5 py-3">
                          <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="flex-1 text-sm text-slate-700">{card?.name ?? "Card"}</span>
                          <span className="text-xs text-amber-500">
                            {new Date(bill.nextPaymentDueDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}
                          </span>
                          <span className="text-sm font-bold text-amber-600">{formatCurrency(bill.totalAmount)}</span>
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
                <h3 className="text-sm font-bold text-slate-700 mb-3">Quick Access</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { href:"/transactions", icon:ArrowLeftRight, label:"Transactions", color:"bg-blue-50 text-blue-600" },
                    { href:"/reports", icon:BarChart2, label:"Reports", color:"bg-purple-50 text-purple-600" },
                    { href:"/spending-limits", icon:Target, label:"Budgets", color:"bg-orange-50 text-orange-600" },
                    { href:"/categories", icon:Tag, label:"Categories", color:"bg-teal-50 text-teal-600" },
                    { href:"/manage-cards", icon:CreditCardIcon, label:"Cards", color:"bg-indigo-50 text-indigo-600" },
                    { href:"/manage-accounts", icon:Wallet, label:"Accounts", color:"bg-emerald-50 text-emerald-600" },
                  ].map(({ href, icon: Icon, label, color }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 text-center leading-tight">{label}</span>
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
                      <h2 className="text-sm font-bold text-slate-800">Top Spending</h2>
                    </div>
                    <Link href="/reports" className="text-xs text-rose-600 font-semibold flex items-center gap-0.5 hover:text-rose-800">
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
                            <span className="text-xs font-medium text-slate-600 truncate max-w-[130px]">{cat.category}</span>
                            <span className="text-xs font-bold text-slate-800 tabular-nums">{formatCurrency(cat.amount)}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: cat.color }}
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
                <h3 className="text-sm font-bold text-white/80 mb-4">{currentMonth} Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-200" />
                      </div>
                      <span className="text-sm text-white/80">Income</span>
                    </div>
                    <span className="text-sm font-bold">{fmt(monthIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                        <TrendingDown className="h-3.5 w-3.5 text-red-300" />
                      </div>
                      <span className="text-sm text-white/80">Expenses</span>
                    </div>
                    <span className="text-sm font-bold">{fmt(monthExpenses)}</span>
                  </div>
                  <div className="border-t border-white/15 pt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Net</span>
                    <span className={cn("text-sm font-bold", monthIncome - monthExpenses >= 0 ? "text-emerald-200" : "text-red-300")}>
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
        open={isModalOpen} setOpen={setIsModalOpen}
        onSuccess={fetchAll} editCard={editCard}
      />
      <BankAccountModal
        open={isBankAccountModalOpen} setOpen={setIsBankAccountModalOpen}
        onSuccess={fetchAll} editAccount={editAccount}
      />
      <TransactionModal
        open={isTransactionModalOpen} setOpen={setIsTransactionModalOpen}
        onSuccess={fetchAll}
        creditCards={creditCards.map(c => ({ id: c.id, name: c.name, availableBalance: c.availableBalance }))}
        bankAccounts={bankAccounts.map(b => ({ id: b.id, name: b.name, currentBalance: b.currentBalance }))}
      />

      {/* Delete card confirm */}
      <AlertDialog open={!!deleteCardId} onOpenChange={() => setDeleteCardId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete credit card?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the card and all its invoices.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteCardId && handleDeleteCard(deleteCardId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete account confirm */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bank account?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the account and all associated transactions.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteAccountId && handleDeleteAccount(deleteAccountId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

