"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getTransactions, deleteTransaction } from "@/app/api/transaction-action";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TransactionModal from "@/components/transaction-modal";
import { getCreditCards } from "@/app/api/credit-card-action";
import { getBankAccounts } from "@/app/api/bank-account-action";
import { CreditCard, Wallet, Calendar, ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";
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

type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category: string;
  installments: number;
  parentTransactionId: string | null;
  installmentNumber: number | null;
  creditCardId: string | null;
  creditCard: { name: string } | null;
  bankAccountId: string | null;
  bankAccount: { name: string } | null;
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

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log("Fetching transactions...");
      const txns = await getTransactions();
      console.log("Transactions fetched:", txns);
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

  useEffect(() => {
    if (session && !dataLoaded) {
      fetchTransactions();
      fetchCreditCards();
      fetchBankAccounts();
      setDataLoaded(true);
    }
  }, [session, dataLoaded]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCategoryIcon = (category: string) => {
    // You can customize icons based on category if needed
    return <Wallet className="h-4 w-4" />;
  };

  // Debug logging
  console.log("=== DEBUG INFO ===");
  console.log("Total transactions:", transactions.length);
  console.log("Current Date:", currentDate);
  console.log("Current Month:", currentMonth, "Current Year:", currentYear);
  
  if (transactions.length > 0) {
    console.log("Sample transaction:", transactions[0]);
    console.log("Sample transaction date:", transactions[0].date);
    console.log("Sample transaction parsed:", new Date(transactions[0].date));
  }

  // Filter transactions by selected month
  const filteredTransactions = transactions.filter((transaction) => {
    const txDate = new Date(transaction.date);
    const matches = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    console.log(
      `Transaction: ${transaction.name}, Date: ${transaction.date}, Parsed: ${txDate}, Month: ${txDate.getMonth()}, Year: ${txDate.getFullYear()}, Matches: ${matches}`
    );
    return matches;
  });

  console.log("Filtered transactions:", filteredTransactions.length);

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

  return (
    <div className="max-w-7xl mx-auto">
      <Header />
      <main className="p-4 md:p-6 pb-48 md:pb-52">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">All Transactions</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            View and manage all your transactions
          </p>
        </div>

        {/* Month Navigation */}
        <div className="mb-4 flex items-center justify-between bg-white rounded-lg shadow-sm p-3 border">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="flex items-center gap-1 h-8 text-xs px-2"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          
          <div className="text-center">
            <h2 className="text-base font-semibold">{getMonthYearDisplay()}</h2>
            {!isCurrentMonth() && (
              <button
                onClick={() => setCurrentDate(new Date())}
                className="text-[10px] text-blue-600 hover:underline"
              >
                Back to current
              </button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="flex items-center gap-1 h-8 text-xs px-2"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-2 text-sm">
              No transactions found for {getMonthYearDisplay()}
            </p>
            <p className="text-gray-400 text-xs">
              Add your first transaction to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="bg-blue-500 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                    {transaction.creditCardId ? (
                      <CreditCard className="h-4 w-4 text-white" />
                    ) : (
                      <Wallet className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {transaction.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 leading-tight mt-0.5">
                      <Calendar className="h-2.5 w-2.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">{formatDate(transaction.date)}</span>
                      <span>•</span>
                      <span className="truncate">{transaction.category}</span>
                      {transaction.installments > 1 && (
                        <>
                          <span>•</span>
                          <span className="whitespace-nowrap">
                            {transaction.installments}x
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5 truncate leading-tight">
                      {transaction.creditCard
                        ? `${transaction.creditCard.name}`
                        : transaction.bankAccount
                        ? `${transaction.bankAccount.name}`
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`font-semibold text-xs whitespace-nowrap ${
                      transaction.amount < 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.amount < 0
                      ? formatCurrency(Math.abs(transaction.amount))
                      : formatCurrency(transaction.amount)}
                  </span>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className="p-1.5 hover:bg-blue-100 rounded-full transition-colors"
                      title="Edit transaction"
                      disabled={transaction.category === "Transfer"}
                    >
                      <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(transaction)}
                      className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer
        onAddTransaction={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        isTransactionDisabled={
          creditCards.length === 0 && bankAccounts.length === 0
        }
      />

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
              Are you sure you want to delete "{deletingTransaction?.name}"? 
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
    </div>
  );
}

