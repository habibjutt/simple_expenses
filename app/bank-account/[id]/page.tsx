"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBankAccountTransactions, getBankAccounts } from "@/app/api/bank-account-action";
import { deleteTransaction } from "@/app/api/transaction-action";
import { getCreditCards } from "@/app/api/credit-card-action";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, DollarSign, Wallet, ChevronLeft, ChevronRight, Utensils, ShoppingCart, Home, Car, Coffee, Gift, Heart, TrendingUp, TrendingDown, Pencil, Trash2, Filter, X } from "lucide-react";
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

type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category: string;
  installments: number;
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
    creditCardId: string | null;
    bankAccountId: string | null;
  } | null>(null);
  const [isDeleteTransactionConfirmOpen, setIsDeleteTransactionConfirmOpen] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [transactionDeleteLoading, setTransactionDeleteLoading] = useState(false);
  const [transactionDeleteError, setTransactionDeleteError] = useState<string | null>(null);
  const [creditCards, setCreditCards] = useState<Array<{ id: string; name: string; availableBalance: number }>>([]);
  const [bankAccounts, setBankAccounts] = useState<Array<{ id: string; name: string; currentBalance: number }>>([]);
  
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
        const [cards, accounts] = await Promise.all([
          getCreditCards(),
          getBankAccounts(),
        ]);
        setCreditCards(cards);
        setBankAccounts(accounts);
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
  
  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("food") || categoryLower.includes("restaurant")) {
      return <Utensils className="h-5 w-5" />;
    } else if (categoryLower.includes("grocery") || categoryLower.includes("groceries") || categoryLower.includes("supermarket")) {
      return <ShoppingCart className="h-5 w-5" />;
    } else if (categoryLower.includes("home") || categoryLower.includes("rent") || categoryLower.includes("utilities")) {
      return <Home className="h-5 w-5" />;
    } else if (categoryLower.includes("transport") || categoryLower.includes("car") || categoryLower.includes("gas")) {
      return <Car className="h-5 w-5" />;
    } else if (categoryLower.includes("coffee") || categoryLower.includes("cafe")) {
      return <Coffee className="h-5 w-5" />;
    } else if (categoryLower.includes("gift") || categoryLower.includes("shopping")) {
      return <Gift className="h-5 w-5" />;
    } else if (categoryLower.includes("health") || categoryLower.includes("medical")) {
      return <Heart className="h-5 w-5" />;
    } else {
      return <DollarSign className="h-5 w-5" />;
    }
  };
  
  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("food") || categoryLower.includes("restaurant")) {
      return "bg-pink-500";
    } else if (categoryLower.includes("grocery") || categoryLower.includes("groceries")) {
      return "bg-orange-500";
    } else if (categoryLower.includes("home") || categoryLower.includes("rent")) {
      return "bg-blue-500";
    } else if (categoryLower.includes("transport") || categoryLower.includes("car")) {
      return "bg-green-500";
    } else if (categoryLower.includes("coffee")) {
      return "bg-amber-600";
    } else if (categoryLower.includes("gift") || categoryLower.includes("shopping")) {
      return "bg-purple-500";
    } else if (categoryLower.includes("health")) {
      return "bg-red-500";
    } else {
      return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* <Header /> */}
        <main className="p-4 md:p-6 pb-24">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">Loading account details...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !accountData) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* <Header /> */}
        <main className="p-4 md:p-6 pb-24">
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
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col bg-white">
      {/* <Header /> */}
      <main className="flex-1 p-4 md:p-6 pb-32 md:pb-36">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-2">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="sm"
            className="h-9 px-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-sm font-bold">Account Details</h1>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>

        {/* Month Navigation */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousMonth}
            className="h-10 px-3"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="px-6 py-2 bg-gray-900 text-white rounded-full">
            <span className="font-semibold">{getMonthYearLabel()}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            className="h-10 px-3"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Account Card */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-2">
          {/* Left Card - Account Info */}
          <Card className="shadow-md py-2">
            <CardContent className="p-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-600">Bank Account</div>
                  <div className="text-sm font-bold mt-0.5">{account.name}</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-gray-500">Current Balance</div>
                  <div className="font-bold text-green-600">
                    {formatCurrency(account.currentBalance)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Initial Balance</div>
                  <div className="font-bold">
                    {formatCurrency(account.initialBalance)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Card - Monthly Summary */}
          <Card className="shadow-md bg-gray-800 text-white py-2">
            <CardContent className="p-2 space-y-3">
              <div>
                <div className="text-gray-400 text-xs">Income</div>
                <div className="text-sm font-bold text-green-400">
                  +{formatCurrency(totalIncome)}
                </div>
              </div>
              
              <div>
                <div className="text-gray-400 text-xs">Expenses</div>
                <div className="text-sm font-bold text-red-400">
                  -{formatCurrency(totalExpenses)}
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-600">
                <div className="text-gray-400 text-xs">Net Balance</div>
                <div className={`text-sm font-bold ${netBalance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                  {formatCurrency(netBalance)}
                </div>
              </div>
            </CardContent>
          </Card>
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
              <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {(filterCategory ? 1 : 0) + (filterName ? 1 : 0)}
              </span>
            )}
          </Button>
          
          {hasActiveFilters && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                {filterCategory && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    <span>Category: {filterCategory}</span>
                    <button
                      onClick={() => setFilterCategory("")}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filterName && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    <span>Name: {filterName}</span>
                    <button
                      onClick={() => setFilterName("")}
                      className="hover:bg-blue-200 rounded-full p-0.5"
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
                  {formatCurrency(Math.abs(filteredTotal))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transactions List - Simplified */}
        <div className="mb-20">
          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm">No transactions for this month</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedTransactions).map(([dateKey, dayTransactions]) => (
                <div key={dateKey}>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {dateKey}
                  </div>
                  <div className="space-y-2">
                    {dayTransactions.map((transaction) => {
                      const isIncome = transaction.amount < 0;
                      return (
                        <div 
                          key={transaction.id} 
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Category Icon */}
                            <div className={`w-10 h-10 ${isIncome ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <div className={`${isIncome ? 'text-green-600' : 'text-red-600'} text-xs font-bold`}>
                                {transaction.category.substring(0, 2).toUpperCase()}
                              </div>
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
                                {/* Amount - shown below name on mobile */}
                                <div className={`text-xs font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                  {isIncome ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 flex-shrink-0">
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
      </main>
      
      {/* Floating Action Button */}
      <button
        onClick={() => setIsTransactionModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-20"
        aria-label="Add transaction"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      
      <Footer />
      
      {/* Transaction Edit Modal */}
      <TransactionModal
        open={isTransactionModalOpen}
        setOpen={setIsTransactionModalOpen}
        creditCards={creditCards}
        bankAccounts={bankAccounts}
        onSuccess={handleTransactionSuccess}
        editTransaction={editingTransaction}
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