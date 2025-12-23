"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBankAccountTransactions, getBankAccounts } from "@/app/api/bank-account-action";
import { deleteTransaction } from "@/app/api/transaction-action";
import { getCreditCards } from "@/app/api/credit-card-action";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, DollarSign, Wallet, ChevronLeft, ChevronRight, Utensils, ShoppingCart, Home, Car, Coffee, Gift, Heart, TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
import TransactionModal from "@/components/transaction-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category: string;
  installments: number;
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
        <Header />
        <main className="p-4 md:p-6 pb-48 md:pb-52">
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
        <Header />
        <main className="p-4 md:p-6 pb-48 md:pb-52">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="mb-6"
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

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups: Record<string, Transaction[]>, transaction) => {
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
  
  // Calculate income and expenses
  const totalIncome = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalExpenses = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6 pb-32 md:pb-36">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Account Header - More Compact */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            {account.name}
          </h1>

          <div className="grid grid-cols-2 gap-3">
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">Current Balance</div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(account.currentBalance)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">This Month</div>
                <div className="text-lg font-bold text-red-600">
                  -{formatCurrency(totalAmount)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Month Navigation - More Compact */}
        <div className="mb-4">
          <div className="flex items-center justify-between bg-white rounded-lg p-3 border shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex flex-col items-center">
              <h2 className="text-base font-semibold">{getMonthYearLabel()}</h2>
              {!isCurrentMonth() && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleCurrentMonth}
                  className="text-xs h-auto p-0 mt-1"
                >
                  Current
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Transactions List - Compact Style */}
        <div className="mb-20">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-sm">No transactions for this month</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([dateKey, dayTransactions]) => (
                <div key={dateKey}>
                  <div className="text-xs font-semibold text-gray-500 mb-2 px-1">
                    {dateKey}
                  </div>
                  <div className="bg-white rounded-lg border shadow-sm divide-y">
                    {dayTransactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                      >
                        {/* Category Icon */}
                        <div className={`${getCategoryColor(transaction.category)} text-white rounded-full p-2 flex-shrink-0`}>
                          {getCategoryIcon(transaction.category)}
                        </div>
                        
                        {/* Transaction Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {transaction.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{transaction.category}</span>
                            {transaction.installments > 1 && (
                              <span className="text-blue-600">• {transaction.installments}x</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Amount */}
                        <div className="flex-shrink-0 text-right">
                          <div className={`text-base font-semibold ${transaction.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount < 0 ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.amount < 0 ? 'income' : 'expense'}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex-shrink-0 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingTransactionId(transaction.id);
                              setIsDeleteTransactionConfirmOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Fixed Bottom Summary - Like the mobile app */}
      {transactions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white border-t border-gray-700 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-around text-center">
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-gray-400">income</span>
                </div>
                <div className="text-base font-semibold text-green-400">
                  {formatCurrency(totalIncome)}
                </div>
              </div>
              
              <div className="w-px h-12 bg-gray-700"></div>
              
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-gray-400">expenses</span>
                </div>
                <div className="text-base font-semibold text-red-400">
                  -{formatCurrency(totalExpenses)}
                </div>
              </div>
              
              <div className="w-px h-12 bg-gray-700"></div>
              
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Wallet className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-400">balance</span>
                </div>
                <div className={`text-base font-semibold ${netBalance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                  {formatCurrency(netBalance)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
    </div>
  );
}
