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
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Wallet, TrendingDown, TrendingUp, Calendar, DollarSign, Trash2 } from "lucide-react";
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

type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category: string;
  installments: number;
  creditCardId: string;
  creditCard: { name: string };
  bankAccountId: string;
  bankAccount: { name: string };
  createdAt: Date;
  updatedAt: Date;
};

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  const fetchCreditCards = async () => {
    try {
      setLoading(true);
      const cards = await getCreditCards();
      setCreditCards(cards);
    } catch (error) {
      console.error("Failed to fetch credit cards:", error);
    } finally {
      setLoading(false);
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

  const fetchTransactions = async () => {
    try {
      const txns = await getTransactions();
      setTransactions(txns);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchCreditCards();
      fetchBankAccounts();
      fetchTransactions();
    }
  }, [session]);

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

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCreditCard(cardId);
      await fetchCreditCards();
      setDeleteCardId(null);
    } catch (error) {
      console.error("Failed to delete credit card:", error);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteBankAccount(accountId);
      await fetchBankAccounts();
      setDeleteAccountId(null);
    } catch (error) {
      console.error("Failed to delete bank account:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Header />
      <main className="p-4 md:p-6 pb-48 md:pb-52">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-xl md:text-2xl font-bold">
              Welcome, {session.user?.name || session.user?.email}!
            </h1>
            <div className="hidden md:flex gap-3">
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="default"
                aria-label="Add credit card"
              >
                + Add Credit Card
              </Button>
              <Button
                onClick={() => setIsBankAccountModalOpen(true)}
                variant="default"
                aria-label="Add bank account"
              >
                + Add Bank Account
              </Button>
              <Button
                onClick={() => setIsTransactionModalOpen(true)}
                variant="default"
                aria-label="Add transaction"
                disabled={creditCards.length === 0 && bankAccounts.length === 0}
              >
                + Add Transaction
              </Button>
            </div>
          </div>
          <p className="text-gray-600 mb-6 text-sm md:text-base">You are successfully logged in.</p>

          <div className="mt-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Your Credit Cards
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading credit cards...
              </div>
            ) : creditCards.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-2">No credit cards added yet</p>
                <p className="text-sm text-gray-400">
                  Click &quot;Add Credit Card&quot; to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creditCards.map((card) => (
                  <Card 
                    key={card.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={(e) => {
                      // Don't navigate if clicking delete button
                      if (!(e.target as HTMLElement).closest('button')) {
                        router.push(`/credit-card/${card.id}`);
                      }
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-base md:text-lg">{card.name}</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteCardId(card.id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label={`Delete ${card.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Card Limit:</span>
                          <span className="font-semibold">
                            {formatCurrency(card.cardLimit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(card.availableBalance)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Used:</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(card.cardLimit - card.availableBalance)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bill Date:</span>
                          <span className="font-semibold">
                            {card.billGenerationDate}
                            {card.billGenerationDate === 1
                              ? "st"
                              : card.billGenerationDate === 2
                              ? "nd"
                              : card.billGenerationDate === 3
                              ? "rd"
                              : "th"}{" "}
                            of month
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Due:</span>
                          <span className="font-semibold">
                            {card.paymentDate}
                            {card.paymentDate === 1
                              ? "st"
                              : card.paymentDate === 2
                              ? "nd"
                              : card.paymentDate === 3
                              ? "rd"
                              : "th"}{" "}
                            of month
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Bank Accounts Section */}
          <div className="mt-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Your Bank Accounts
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading bank accounts...
              </div>
            ) : bankAccounts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-2">No bank accounts added yet</p>
                <p className="text-sm text-gray-400">
                  Click &quot;Add Bank Account&quot; to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bankAccounts.map((account) => (
                  <Card 
                    key={account.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={(e) => {
                      // Don't navigate if clicking delete button
                      if (!(e.target as HTMLElement).closest('button')) {
                        router.push(`/bank-account/${account.id}`);
                      }
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-base md:text-lg">{account.name}</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteAccountId(account.id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label={`Delete ${account.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Balance:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(account.currentBalance)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Transactions Section */}
          <div className="mt-12" id="transactions-section">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recent Transactions
            </h2>
            {transactions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-2">No transactions yet</p>
                <p className="text-sm text-gray-400">
                  Add a transaction to start tracking your expenses
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Installments
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {txn.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(txn.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(txn.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {txn.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {txn.creditCard?.name || txn.bankAccount?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {txn.installments}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer
        onAddTransaction={() => setIsTransactionModalOpen(true)}
        onAddCreditCard={() => setIsModalOpen(true)}
        onAddBankAccount={() => setIsBankAccountModalOpen(true)}
        isTransactionDisabled={creditCards.length === 0 && bankAccounts.length === 0}
      />

      <CreditCardModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        onSuccess={fetchCreditCards}
      />

      <BankAccountModal
        open={isBankAccountModalOpen}
        setOpen={setIsBankAccountModalOpen}
        onSuccess={fetchBankAccounts}
      />

      <TransactionModal
        open={isTransactionModalOpen}
        setOpen={setIsTransactionModalOpen}
        creditCards={creditCards}
        bankAccounts={bankAccounts}
        onSuccess={() => {
          fetchCreditCards();
          fetchBankAccounts();
          fetchTransactions();
        }}
      />

      <AlertDialog
        open={deleteCardId !== null}
        onOpenChange={(open) => !open && setDeleteCardId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credit Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this credit card? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCardId && handleDeleteCard(deleteCardId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteAccountId !== null}
        onOpenChange={(open) => !open && setDeleteAccountId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bank account? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccountId && handleDeleteAccount(deleteAccountId)}
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
