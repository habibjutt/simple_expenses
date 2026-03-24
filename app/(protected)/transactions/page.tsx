"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getTransactions, deleteTransaction } from "@/app/api/transaction-action";
import { getCategories } from "@/app/api/category-action";
import { type Category as CategoryType } from "@/lib/category-data";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatCurrency } from "@/lib/utils";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TransactionModal from "@/components/transaction-modal";
import { getCreditCards } from "@/app/api/credit-card-action";
import { getBankAccounts } from "@/app/api/bank-account-action";
import { CreditCard, Wallet, ChevronLeft, ChevronRight, Edit2, Trash2, Filter, X, Search, Download, RefreshCw, Receipt } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCombobox } from "@/components/ui/form-combobox";

type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category: string;
  notes: string | null;
  installments: number;
  parentTransactionId: string | null;
  installmentNumber: number | null;
  creditCardId: string | null;
  creditCard: { name: string } | null;
  bankAccountId: string | null;
  bankAccount: { name: string } | null;
  isRecurring: boolean;
  isRecurringActive: boolean;
  recurringFrequency: string | null;
  parentRecurringId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CreditCard = {
  id: string;
  name: string;
  billGenerationDate: number;
  paymentDate: number;
  cardLimit: number;
  availableBalance: number;
  createdAt: Date;
  updatedAt: Date;
};

type BankAccount = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function TransactionsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Month navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Filter state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const txns = await getTransactions();
      setTransactions(txns);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      alert("Error fetching transactions: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditCards = async () => {
    try {
      const cards = await getCreditCards();
      setCreditCards(cards);
    } catch (error) {
      console.error("Failed to fetch credit cards:", error);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const accounts = await getBankAccounts();
      setBankAccounts(accounts);
    } catch (error) {
      console.error("Failed to fetch bank accounts:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    if (session && !dataLoaded) {
      fetchTransactions();
      fetchCreditCards();
      fetchBankAccounts();
      fetchCategories();
      setDataLoaded(true);
    }
  }, [session, dataLoaded]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-slate-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const catMap = new Map(categories.map((c) => [c.name, c]));

  // Filter transactions by selected month and filters
  const filteredTransactions = transactions
    .filter((transaction) => {
      const txDate = new Date(transaction.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    })
    .filter((transaction) => {
      // Apply category filter
      if (filterCategory && transaction.category !== filterCategory) {
        return false;
      }
      // Apply name filter (case-insensitive)
      if (filterName && !transaction.name.toLowerCase().includes(filterName.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by createdAt descending (most recently added first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  console.log("Filtered transactions:", filteredTransactions.length);
  
  // Calculate total of filtered transactions
  const filteredTotal = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  
  // Get unique categories for filter suggestions
  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category))).sort();
  
  // Check if any filters are active
  const hasActiveFilters = filterCategory !== "" || filterName !== "";
  
  // Clear all filters
  const clearFilters = () => {
    setFilterCategory("");
    setFilterName("");
  };

  const [exportingCsv, setExportingCsv] = useState(false);

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const params = new URLSearchParams({
        month: String(currentMonth + 1),
        year: String(currentYear),
      });
      const res = await fetch(`/api/v1/transactions/export?${params}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        let message = "Export failed";
        try {
          const body = (await res.json()) as { error?: string };
          if (body.error) message = body.error;
        } catch {
          /* ignore */
        }
        alert(message);
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      const match = cd?.match(/filename="([^"]+)"/);
      const fallback = `transactions-${currentYear}-${String(currentMonth + 1).padStart(2, "0")}.csv`;
      const filename = match?.[1] ?? fallback;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExportingCsv(false);
    }
  };

  // Month navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentMonth === now.getMonth() && currentYear === now.getFullYear();
  };

  // Format month and year for display
  const getMonthYearDisplay = () => {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  // Handle delete transaction
  const handleDeleteClick = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingTransaction) return;
    
    try {
      await deleteTransaction(deletingTransaction.id);
      await fetchTransactions();
      await fetchCreditCards();
      await fetchBankAccounts();
      setDeleteDialogOpen(false);
      setDeletingTransaction(null);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert((error as Error).message || "Failed to delete transaction");
    }
  };

  // Group filtered transactions by date (Organizze-style)
  const groupedByDate = filteredTransactions.reduce(
    (groups, t) => {
      const dateKey = new Date(t.date).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
      return groups;
    },
    {} as Record<string, Transaction[]>
  );
  const groupedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />
      <main className="pb-24 lg:pb-8">
        {/* Page header */}
        <div className="bg-[#1a9e5c] text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-lg font-bold">Transactions</h1>
                <p className="text-white/60 text-sm mt-0.5">{getMonthYearDisplay()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-white/60 text-xs font-medium">Expenses</p>
                  <p className="text-sm font-bold tabular-nums">
                    {formatCurrency(filteredTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0))}
                  </p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-white/60 text-xs font-medium">Income</p>
                  <p className="text-sm font-bold tabular-nums">
                    {formatCurrency(Math.abs(filteredTransactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)))}
                  </p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-white/60 text-xs font-medium">Count</p>
                  <p className="text-sm font-bold tabular-nums">{filteredTransactions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-5">

        {/* Month Navigation */}
        <div className="mb-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="flex items-center gap-1 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Prev</span>
          </Button>
          
          <div className="text-center">
            <h2 className="text-sm font-semibold text-slate-800">{getMonthYearDisplay()}</h2>
            {!isCurrentMonth() && (
              <button
                onClick={() => setCurrentDate(new Date())}
                className="text-[10px] text-[#1a9e5c] hover:underline"
              >
                Back to current
              </button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="flex items-center gap-1 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <span className="hidden sm:inline text-sm">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Search + Filter + Export toolbar */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          {/* Inline search bar */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c]/30 focus:border-[#1a9e5c]"
            />
            {filterName && (
              <button
                onClick={() => setFilterName("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterDialogOpen(true)}
            className="flex items-center gap-2 h-9 border-slate-200 hover:bg-slate-50 shrink-0"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {filterCategory && (
              <span className="ml-1 bg-[#1a9e5c] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">1</span>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className="flex items-center gap-2 h-9 border-slate-200 hover:bg-slate-50 shrink-0"
            title="Download transactions as CSV"
            aria-label="Export transactions as CSV"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{exportingCsv ? "Exporting…" : "Export CSV"}</span>
          </Button>
          
          {filterCategory && (
            <div className="flex items-center gap-1 bg-[#1a9e5c]/10 text-[#1a9e5c] border border-[#1a9e5c]/20 px-2 py-1 rounded-full text-xs">
              <span>Category: {filterCategory}</span>
              <button onClick={() => setFilterCategory("")} className="hover:bg-[#1a9e5c]/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && filteredTransactions.length > 0 && (
          <div className="mb-4 p-3 bg-[#1a9e5c]/10 border border-[#1a9e5c]/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-700">
                <span className="font-medium">{filteredTransactions.length}</span> transaction{filteredTransactions.length !== 1 ? 's' : ''} found
              </div>
              <div className="text-sm font-semibold">
                Total: <span className={filteredTotal < 0 ? "text-emerald-600" : "text-red-600"}>
                  {formatCurrency(Math.abs(filteredTotal))}
                </span>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={`No transactions found for ${getMonthYearDisplay()}`}
            description="Add your first transaction to get started"
            actionLabel="Add Transaction"
            onAction={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
          />
        ) : (
          <div>
            {groupedDates.map((dateKey) => {
              const dayTransactions = groupedByDate[dateKey];
              const date = new Date(dateKey);
              const dayTotal = dayTransactions.reduce((s, t) => s + t.amount, 0);

              const dateLabel = date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                weekday: "short",
              });

              return (
                <div key={dateKey}>
                  {/* Full-width date header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {dateLabel}
                    </span>
                  </div>

                  {/* Day transactions card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-5">
                    {dayTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 group transition-colors border-b border-slate-50 last:border-b-0"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: (catMap.get(transaction.category)?.color ?? "#64748b") + "22" }}
                        >
                          <CategoryIcon
                            icon={catMap.get(transaction.category)?.icon ?? "tag"}
                            className="h-4 w-4"
                            color={catMap.get(transaction.category)?.color ?? "#64748b"}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {transaction.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: (catMap.get(transaction.category)?.color ?? "#64748b") + "22",
                                color: catMap.get(transaction.category)?.color ?? "#64748b",
                              }}
                            >
                              {transaction.category}
                            </span>
                            {transaction.installments > 1 && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                                {transaction.installments}x
                              </span>
                            )}
                            {transaction.isRecurring && (
                              <span
                                className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                  transaction.isRecurringActive
                                    ? "bg-violet-100 text-violet-600"
                                    : "bg-slate-100 text-slate-400 line-through"
                                }`}
                                title={transaction.isRecurringActive ? `Repeats ${transaction.recurringFrequency}` : "Recurring paused"}
                              >
                                <RefreshCw className="h-2 w-2" />
                                {transaction.recurringFrequency}
                              </span>
                            )}
                            {(transaction.creditCard || transaction.bankAccount) && (
                              <span className="text-[10px] bg-[#1a9e5c]/10 text-[#1a9e5c] px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                                {transaction.creditCard?.name || transaction.bankAccount?.name}
                              </span>
                            )}
                            {transaction.notes && (
                              <span className="text-[10px] text-slate-400 italic truncate max-w-[160px]" title={transaction.notes}>
                                {transaction.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span
                            className={`text-sm font-bold whitespace-nowrap ${
                              transaction.category === "Transfer"
                                ? "text-blue-600"
                                : transaction.amount < 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.amount < 0 ? "+" : ""}
                            {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                          <div className="hidden sm:flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit transaction"
                              disabled={transaction.category === "Transfer"}
                            >
                              <Edit2 className="h-3 w-3 text-slate-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(transaction)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete transaction"
                            >
                              <Trash2 className="h-3 w-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Day total */}
                    <div className="px-4 py-2 bg-slate-50 flex justify-end border-t border-slate-100">
                      <span
                        className={`text-xs font-semibold ${
                          dayTotal < 0 ? "text-emerald-600" : dayTotal > 0 ? "text-red-600" : "text-slate-500"
                        }`}
                      >
                        {dayTotal < 0 ? "+" : dayTotal > 0 ? "-" : ""}
                        {formatCurrency(Math.abs(dayTotal))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>{/* close max-w-5xl wrapper */}
      </main>
      <Footer />

      <TransactionModal
        open={isTransactionModalOpen}
        setOpen={(open) => {
          setIsTransactionModalOpen(open);
          if (!open) {
            setEditingTransaction(null);
          }
        }}
        creditCards={creditCards}
        bankAccounts={bankAccounts}
        editTransaction={editingTransaction}
        onSuccess={async () => {
          await fetchTransactions();
          await fetchCreditCards();
          await fetchBankAccounts();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingTransaction?.name}&rdquo;? 
              {deletingTransaction?.category === "Transfer" && (
                <span className="block mt-2 text-yellow-600 font-medium">
                  Warning: This is a transfer transaction. Deleting it will affect both accounts.
                </span>
              )}
              <span className="block mt-2">
                This action cannot be undone and will restore the affected account balance.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Transactions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <FormCombobox
                value={filterCategory}
                onValueChange={setFilterCategory}
                options={uniqueCategories.map((cat) => ({ value: cat, label: cat }))}
                placeholder="Select category…"
                searchPlaceholder="Search categories…"
                emptyText="No categories found."
              />
            </div>

            {/* Name Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-name">Transaction Name</Label>
              <Input
                id="filter-name"
                placeholder="Search by name (case-insensitive)"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Search will match any part of the transaction name
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-2 pt-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Button
                onClick={() => setFilterDialogOpen(false)}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



