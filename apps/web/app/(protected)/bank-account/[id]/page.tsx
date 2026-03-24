"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBankAccountTransactions, getBankAccounts } from "@/app/api/bank-account-action";
import { deleteTransaction } from "@/app/api/transaction-action";
import { getCreditCards } from "@/app/api/credit-card-action";
import { getCategories } from "@/app/api/category-action";
import { type Category as CategoryType } from "@/lib/category-data";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil, Trash2, Filter, X, Plus } from "lucide-react";
import TransactionModal from "@/components/transaction-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category: string;
  installments: number;
  notes: string | null;
  createdAt: Date;
};

type BankAccountData = {
  monthStartDate: Date;
  monthEndDate: Date;
  transactions: Transaction[];
  totalAmount: number;
  account: {
    id: string;
    name: string;
    initialBalance: number;
    currentBalance: number;
    currency: string;
  };
};

export default function BankAccountDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  const [accountData, setAccountData] = useState<BankAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Month navigation state
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  
  // Transaction edit/delete state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<{
    id: string;
    name: string;
    amount: number;
    date: Date;
    category: string;
    installments: number;
    notes: string | null;
    creditCardId: string | null;
    bankAccountId: string | null;
  } | null>(null);
  const [isDeleteTransactionConfirmOpen, setIsDeleteTransactionConfirmOpen] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [transactionDeleteLoading, setTransactionDeleteLoading] = useState(false);
  const [transactionDeleteError, setTransactionDeleteError] = useState<string | null>(null);
  const [creditCards, setCreditCards] = useState<Array<{ id: string; name: string; availableBalance: number }>>([]);
  const [bankAccounts, setBankAccounts] = useState<Array<{ id: string; name: string; currentBalance: number }>>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  
  // Filter state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        const data = await getBankAccountTransactions(accountId, selectedMonth, selectedYear);
        setAccountData(data);
        
        // Load credit cards and bank accounts for the modal
        const [cards, accounts, cats] = await Promise.all([
          getCreditCards(),
          getBankAccounts(),
          getCategories(),
        ]);
        setCreditCards(cards);
        setBankAccounts(accounts);
        setCategories(cats);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load bank account data");
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchAccountData();
    }
  }, [accountId, selectedMonth, selectedYear]);
  
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  const handleCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };
  
  const getMonthYearLabel = () => {
    const date = new Date(selectedYear, selectedMonth);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };
  
  const isCurrentMonth = () => {
    const now = new Date();
    return selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction({
      id: transaction.id,
      name: transaction.name,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category,
      installments: transaction.installments,
      notes: transaction.notes ?? null,
      creditCardId: null,
      bankAccountId: accountId,
    });
    setIsTransactionModalOpen(true);
  };
  
  const handleDeleteTransaction = async () => {
    if (!deletingTransactionId) return;
    
    try {
      setTransactionDeleteLoading(true);
      setTransactionDeleteError(null);
      
      await deleteTransaction(deletingTransactionId);
      
      // Refresh account data
      const data = await getBankAccountTransactions(accountId, selectedMonth, selectedYear);
      setAccountData(data);
      
      setIsDeleteTransactionConfirmOpen(false);
      setDeletingTransactionId(null);
    } catch (err: any) {
      setTransactionDeleteError(err.message || "Failed to delete transaction");
    } finally {
      setTransactionDeleteLoading(false);
    }
  };
  
  const handleTransactionSuccess = async () => {
    // Refresh account data after edit
    const data = await getBankAccountTransactions(accountId, selectedMonth, selectedYear);
    setAccountData(data);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const catMap = new Map(categories.map((c) => [c.name, c]));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-24">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-[3px] border-[#1a9e5c] border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !accountData) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-24">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-red-500">{error || "Failed to load account data"}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { account, transactions, totalAmount } = accountData;

  // Sort transactions by createdAt (most recently added first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Apply filters
  const filteredTransactions = sortedTransactions.filter((transaction) => {
    // Apply category filter
    if (filterCategory && transaction.category.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }
    // Apply name filter (case-insensitive)
    if (filterName && !transaction.name.toLowerCase().includes(filterName.toLowerCase())) {
      return false;
    }
    return true;
  });
  
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

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups: Record<string, Transaction[]>, transaction) => {
    const dateKey = new Date(transaction.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {});
  
  // Calculate income and expenses from filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />
      <main className="pb-24 lg:pb-8">
        {/* Page header */}
        <div className="bg-[#1a9e5c] text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </button>

            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-lg font-bold truncate">{account.name}</h1>
                <p className="text-white/60 text-sm mt-0.5">Bank Account</p>

                {/* Stats row */}
                <div className="flex items-center gap-5 mt-4">
                  <div>
                    <div className="text-white/50 text-xs font-medium">Current Balance</div>
                    <div className="text-xl font-bold">{formatCurrency(account.currentBalance, account.currency)}</div>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div>
                    <div className="text-white/50 text-xs font-medium">Initial Balance</div>
                    <div className="text-base font-semibold">{formatCurrency(account.initialBalance, account.currency)}</div>
                  </div>
                </div>
              </div>

              {/* Add Transaction CTA */}
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsTransactionModalOpen(true);
                }}
                className="shrink-0 flex items-center gap-2 bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/30 hover:border-white/50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 backdrop-blur-sm shadow-sm"
                aria-label="Add new transaction"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span className="hidden sm:inline">Add Transaction</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-5">
          {/* Month Navigation */}
          <div className="mb-5 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
              className="flex items-center gap-1 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <span className="text-sm font-semibold text-slate-800">{getMonthYearLabel()}</span>
              {!isCurrentMonth() && (
                <div>
                  <button onClick={handleCurrentMonth} className="text-[10px] text-[#1a9e5c] hover:underline">
                    Back to current
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="flex items-center gap-1 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Monthly Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
              <div className="text-xs text-slate-500 font-medium mb-1">Income</div>
              <div className="text-lg font-bold text-emerald-600">+{formatCurrency(totalIncome, account.currency)}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
              <div className="text-xs text-slate-500 font-medium mb-1">Expenses</div>
              <div className="text-lg font-bold text-red-600">-{formatCurrency(totalExpenses, account.currency)}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
              <div className="text-xs text-slate-500 font-medium mb-1">Net</div>
              <div className={`text-lg font-bold ${netBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(netBalance, account.currency)}
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterDialogOpen(true)}
              className="flex items-center gap-2 h-9"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 bg-[#1a9e5c] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(filterCategory ? 1 : 0) + (filterName ? 1 : 0)}
                </span>
              )}
            </Button>

            {hasActiveFilters && (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  {filterCategory && (
                    <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded text-xs">
                      <span>Category: {filterCategory}</span>
                      <button
                        onClick={() => setFilterCategory("")}
                        className="hover:bg-indigo-100 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filterName && (
                    <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded text-xs">
                      <span>Name: {filterName}</span>
                      <button
                        onClick={() => setFilterName("")}
                        className="hover:bg-indigo-100 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear all
                </Button>
              </>
            )}
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && filteredTransactions.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-900">
                  <span className="font-medium">{filteredTransactions.length}</span> transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                </div>
                <div className="text-sm font-semibold">
                  Total: <span className={filteredTotal < 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(Math.abs(filteredTotal), account.currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="mb-6">
            {transactions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-sm">No transactions for this month</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedTransactions).map(([dateKey, dayTransactions]) => (
                  <div key={dateKey}>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      {dateKey}
                    </div>
                    <div className="space-y-2">
                      {dayTransactions.map((transaction) => {
                        const isIncome = transaction.amount < 0;
                        return (
                          <div
                            key={transaction.id}
                            className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Category Icon */}
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: (catMap.get(transaction.category)?.color ?? "#64748b") + "22" }}
                              >
                                <CategoryIcon
                                  icon={catMap.get(transaction.category)?.icon ?? "tag"}
                                  className="h-4 w-4"
                                  color={catMap.get(transaction.category)?.color ?? "#64748b"}
                                />
                              </div>

                              {/* Transaction Info */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {transaction.name}
                                </div>
                                <div className="flex items-center gap-2">
                                  {transaction.installments > 1 && (
                                    <div className="text-xs text-gray-500">
                                      {transaction.installments} installments
                                    </div>
                                  )}
                                  {/* Amount */}
                                  <div className={`text-xs font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                    {isIncome ? '+' : ''}{formatCurrency(Math.abs(transaction.amount), account.currency)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                onClick={() => handleEditTransaction(transaction)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setDeletingTransactionId(transaction.id);
                                  setIsDeleteTransactionConfirmOpen(true);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Transaction Modal (create & edit) */}
      <TransactionModal
        open={isTransactionModalOpen}
        setOpen={setIsTransactionModalOpen}
        creditCards={creditCards}
        bankAccounts={bankAccounts}
        onSuccess={handleTransactionSuccess}
        editTransaction={editingTransaction}
        defaultBankAccountId={accountId}
      />

      {/* Delete Transaction Confirmation Modal */}
      <Dialog open={isDeleteTransactionConfirmOpen} onOpenChange={setIsDeleteTransactionConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone and will update your bank account balance.
            </DialogDescription>
          </DialogHeader>

          {transactionDeleteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {transactionDeleteError}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteTransactionConfirmOpen(false);
                setDeletingTransactionId(null);
                setTransactionDeleteError(null);
              }}
              disabled={transactionDeleteLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteTransaction}
              disabled={transactionDeleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {transactionDeleteLoading ? "Deleting..." : "Delete Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Transactions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-category">Category</Label>
              <Input
                id="filter-category"
                placeholder="Enter category name"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                list="categories"
              />
              <datalist id="categories">
                {uniqueCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              {uniqueCategories.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Available categories: {uniqueCategories.join(", ")}
                </div>
              )}
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