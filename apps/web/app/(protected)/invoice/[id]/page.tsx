"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInvoiceDetail } from "@/app/api/notification-action";
import { payInvoice } from "@/app/api/credit-card-action";
import { getBankAccounts } from "@/app/api/bank-account-action";
import { unpayInvoice } from "@/app/api/invoice-action";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Wallet,
  TrendingDown,
  Receipt,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormCombobox } from "@/components/ui/form-combobox";

type InvoiceData = Awaited<ReturnType<typeof getInvoiceDetail>>;
type BankAccount = { id: string; name: string; currentBalance: number };

const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍔",
  Groceries: "🛒",
  Transport: "🚗",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Health: "💊",
  Utilities: "💡",
  Education: "📚",
  Travel: "✈️",
  Coffee: "☕",
  Rent: "🏠",
  Salary: "💰",
  Freelance: "💻",
  Investment: "📈",
  Gift: "🎁",
  Others: "💳",
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [unpayLoading, setUnpayLoading] = useState(false);

  useEffect(() => {
    fetchData();
    fetchBankAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getInvoiceDetail(invoiceId);
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const accounts = await getBankAccounts();
      setBankAccounts(accounts);
    } catch {
      // silently fail
    }
  };

  const handlePay = async () => {
    if (!selectedBankId || !data) return;
    setPayLoading(true);
    setPayError(null);
    try {
      const inv = data.invoice;
      const result = await payInvoice(
        inv.creditCardId,
        selectedBankId,
        new Date(inv.billStartDate),
        new Date(inv.billEndDate),
        new Date(inv.paymentDueDate),
        inv.totalAmount,
      );
      if (result?.error) {
        setPayError(result.error);
        return;
      }
      await fetchData();
      setPayDialogOpen(false);
    } catch (err) {
      setPayError((err as Error).message);
    } finally {
      setPayLoading(false);
    }
  };

  const handleUnpay = async () => {
    setUnpayLoading(true);
    try {
      const result = await unpayInvoice(invoiceId);
      if (result?.error) {
        alert(result.error);
        return;
      }
      await fetchData();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUnpayLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#1a9e5c] border-t-transparent" />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-4">
              {error || "Invoice not found"}
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Go back
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const { invoice, transactions } = data;
  const billStart = new Date(invoice.billStartDate);
  const billEnd = new Date(invoice.billEndDate);
  const dueDate = new Date(invoice.paymentDueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isOverdue = !invoice.isPaid && daysUntilDue < 0;

  // Group by category
  const categoryTotals = transactions.reduce(
    (acc, t) => {
      const key = t.category || "Others";
      acc[key] = (acc[key] || 0) + t.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f0f2f5]">
        {/* Hero banner */}
        <div className="bg-[#1a9e5c] text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-white/75 hover:text-white text-sm mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-5 w-5 text-white/80" />
                  <p className="text-white/80 text-sm">
                    {invoice.creditCard.name}
                  </p>
                </div>
                <h1 className="text-2xl font-bold">Invoice</h1>
                <p className="text-white/70 text-sm mt-1">
                  {billStart.toLocaleDateString("en-AE", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  –{" "}
                  {billEnd.toLocaleDateString("en-AE", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-white/70 text-sm">Total Amount</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(invoice.totalAmount)}
                </p>
                <div className="mt-2">
                  {invoice.isPaid ? (
                    <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Paid
                    </span>
                  ) : isOverdue ? (
                    <span className="inline-flex items-center gap-1.5 bg-red-500/30 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      <XCircle className="h-3.5 w-3.5" />
                      Overdue
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-yellow-400/30 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      <Clock className="h-3.5 w-3.5" />
                      {daysUntilDue === 0
                        ? "Due today"
                        : `Due in ${daysUntilDue} days`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-4">
          {/* Details card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Payment Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Bill Period Start</p>
                <p className="text-sm font-medium text-slate-800">
                  {billStart.toLocaleDateString("en-AE", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Bill Period End</p>
                <p className="text-sm font-medium text-slate-800">
                  {billEnd.toLocaleDateString("en-AE", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Payment Due</p>
                <p
                  className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-slate-800"}`}
                >
                  {dueDate.toLocaleDateString("en-AE", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">
                  {invoice.isPaid ? "Paid From" : "Status"}
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {invoice.isPaid
                    ? (invoice.paidFromBankAccount?.name ?? "—")
                    : isOverdue
                      ? "Overdue"
                      : "Unpaid"}
                </p>
              </div>
            </div>

            {/* Payment actions */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
              {!invoice.isPaid ? (
                <Button
                  onClick={() => setPayDialogOpen(true)}
                  className="bg-[#1a9e5c] hover:bg-[#158a4f] text-white"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Pay Invoice
                </Button>
              ) : (
                <Button
                  onClick={handleUnpay}
                  disabled={unpayLoading}
                  variant="outline"
                  className="text-slate-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {unpayLoading ? "Reverting..." : "Mark as Unpaid"}
                </Button>
              )}
              <Link href={`/credit-card/${invoice.creditCardId}`}>
                <Button variant="outline" className="text-slate-600">
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Card
                </Button>
              </Link>
            </div>
          </div>

          {/* Spending by category */}
          {topCategories.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">
                Spending Breakdown
              </h2>
              <div className="space-y-3">
                {topCategories.map(([category, amount]) => {
                  const pct = Math.round((amount / invoice.totalAmount) * 100);
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-700 flex items-center gap-1.5">
                          <span>{CATEGORY_ICONS[category] ?? "💳"}</span>
                          {category}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {formatCurrency(amount)}
                          <span className="text-xs text-slate-400 ml-1">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1a9e5c] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transactions list */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">
                  Transactions ({transactions.length})
                </h2>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(invoice.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="p-10 text-center">
                <Receipt className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  No transactions in this period
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-base shrink-0">
                      {CATEGORY_ICONS[txn.category || "Others"] ?? "💳"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {txn.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">
                          {new Date(txn.date).toLocaleDateString("en-AE", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {txn.category && (
                          <>
                            <span className="text-xs text-slate-300">·</span>
                            <span className="text-xs text-slate-400">
                              {txn.category}
                            </span>
                          </>
                        )}
                        {txn.installmentNumber && txn.installmentNumber > 0 && (
                          <>
                            <span className="text-xs text-slate-300">·</span>
                            <span className="text-xs text-blue-500">
                              Installment {txn.installmentNumber}/
                              {txn.installments}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-red-600 shrink-0">
                      -{formatCurrency(txn.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Pay Invoice Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pay Invoice</DialogTitle>
            <DialogDescription>
              Pay {formatCurrency(invoice.totalAmount)} for{" "}
              {invoice.creditCard.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Pay from bank account
              </label>
              <FormCombobox
                value={selectedBankId}
                onValueChange={setSelectedBankId}
                options={bankAccounts.map((acc) => ({
                  value: acc.id,
                  label: `${acc.name} — ${formatCurrency(acc.currentBalance)}`,
                }))}
                placeholder="Select account…"
                searchPlaceholder="Search account…"
                emptyText="No accounts found."
              />
            </div>

            {payError && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {payError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={!selectedBankId || payLoading}
              className="bg-[#1a9e5c] hover:bg-[#158a4f] text-white"
            >
              {payLoading ? "Paying..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
