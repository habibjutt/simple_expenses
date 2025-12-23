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
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Wallet, Eye, EyeOff, Info, Trash2 } from "lucide-react";
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
  creditCardId: string | null;
  creditCard: { name: string } | null;
  bankAccountId: string | null;
  bankAccount: { name: string } | null;
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
  invoice: {
    id: string;
    isPaid: boolean;
  } | null;
};

type NextBill = {
  cardId: string;
  nextBillStartDate: Date;
  nextBillEndDate: Date;
  nextPaymentDueDate: Date;
  totalAmount: number;
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [nextBills, setNextBills] = useState<NextBill[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [showBills, setShowBills] = useState(true);

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

  const fetchInvoices = async () => {
    try {
      const invs = await getCurrentMonthInvoices();
      setInvoices(invs);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  const fetchNextBills = async () => {
    try {
      const bills = await getNextBillAmounts();
      setNextBills(bills);
    } catch (error) {
      console.error("Failed to fetch next bills:", error);
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
      fetchInvoices();
      fetchNextBills();
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
      await fetchInvoices();
      await fetchNextBills();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getTotalBalance = () => {
    return bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  };

  const getTotalBills = () => {
    return invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  };

  const getAccountIconColor = (index: number) => {
    const colors = ["bg-green-500", "bg-red-500", "bg-yellow-500", "bg-blue-500"];
    return colors[index % colors.length];
  };

  const getCardIconColor = (index: number) => {
    const colors = ["bg-orange-500", "bg-blue-600", "bg-pink-500", "bg-amber-700"];
    return colors[index % colors.length];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
  };

  const formatFullDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const totalBalance = getTotalBalance();
  const totalBills = getTotalBills();
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });

  return (
    <div className="max-w-7xl mx-auto">
      <Header />
      <main className="p-4 md:p-6 pb-48 md:pb-52">
        {/* Greeting Section */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">{getGreeting()},</p>
          <h1 className="text-2xl md:text-3xl font-bold">
            {session.user?.name || session.user?.email?.split("@")[0]}
          </h1>
        </div>

        {/* General Balance Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">General Balance</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Toggle balance visibility"
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="text-3xl md:text-4xl font-bold">
            {showBalance ? formatCurrency(totalBalance) : "••••••"}
          </div>
        </div>

        {/* My Accounts Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">My Accounts</h2>
            <Button
              onClick={() => setIsBankAccountModalOpen(true)}
              size="sm"
              className="text-xs bg-green-600 hover:bg-green-700 text-white"
            >
              Manage Accounts
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-4 text-gray-500 text-sm">Loading accounts...</div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-2 text-sm">No bank accounts added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bankAccounts.map((account, index) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('button')) {
                      router.push(`/bank-account/${account.id}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`${getAccountIconColor(index)} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{account.name}</div>
                      <div className="text-xs text-gray-500">Manual Account</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${
                      account.currentBalance >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {formatCurrency(account.currentBalance)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteAccountId(account.id);
                      }}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Delete ${account.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Bills Section */}
        {invoices.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{currentMonth} Bills</h2>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <button
                onClick={() => setShowBills(!showBills)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Toggle bills visibility"
              >
                {showBills ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="text-xl font-semibold text-red-600">
              {showBills ? formatCurrency(-totalBills) : "••••••"}
            </div>
          </div>
        )}

        {/* My Cards Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">My Cards</h2>
          {loading ? (
            <div className="text-center py-4 text-gray-500 text-sm">Loading cards...</div>
          ) : creditCards.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-2 text-sm">No credit cards added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {creditCards.map((card, index) => {
                const invoice = invoices.find((inv) => inv.cardId === card.id);
                const nextBill = nextBills.find((bill) => bill.cardId === card.id);
                return (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('button')) {
                        router.push(`/credit-card/${card.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`${getCardIconColor(index)} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{card.name}</div>
                        <div className="text-xs text-gray-500">Manual Card</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-sm font-semibold text-green-600">
                          Available: {formatCurrency(card.availableBalance)}
                        </div>
                        {invoice && (
                          <div className="text-xs text-red-600">
                            Current Bill (Due {formatDate(invoice.paymentDueDate)}): {formatCurrency(-invoice.totalAmount)}
                          </div>
                        )}
                        {nextBill && (
                          <div className={`text-xs ${nextBill.totalAmount > 0 ? 'text-gray-600' : 'text-gray-400'}`}>
                            Next Bill (Due {formatFullDate(nextBill.nextPaymentDueDate)}): {formatCurrency(nextBill.totalAmount)}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCardId(card.id);
                        }}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        aria-label={`Delete ${card.name}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer
        onAddTransaction={() => setIsTransactionModalOpen(true)}
        isTransactionDisabled={creditCards.length === 0 && bankAccounts.length === 0}
      />

      <CreditCardModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        onSuccess={async () => {
          await fetchCreditCards();
          await fetchInvoices();
          await fetchNextBills();
        }}
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
        onSuccess={async () => {
          await fetchCreditCards();
          await fetchBankAccounts();
          await fetchTransactions();
          await fetchInvoices();
          await fetchNextBills();
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
