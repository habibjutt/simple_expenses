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
import { CreditCard, Wallet, Eye, EyeOff, Info, Trash2, Pencil } from "lucide-react";
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
    paidAmount: number;
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
  const [editCard, setEditCard] = useState<CreditCard | null>(null);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [showBills, setShowBills] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

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
    if (session && !dataLoaded) {
      fetchCreditCards();
      fetchBankAccounts();
      fetchTransactions();
      fetchInvoices();
      fetchNextBills();
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

  const getTotalNextBills = () => {
    return nextBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
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
  const totalNextBills = getTotalNextBills();
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });

  return (
    <div className="max-w-7xl mx-auto">
      {/* <Header /> */}
      <main className="p-4 md:p-6 pb-24">
        {/* Greeting Section */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-0.5">{getGreeting()},</p>
          <h1 className="text-xl md:text-2xl font-bold">
            {session.user?.name || session.user?.email?.split("@")[0]}
          </h1>
        </div>

        {/* General Balance Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">General Balance</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Toggle balance visibility"
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="text-2xl md:text-3xl font-bold">
            {showBalance ? formatCurrency(totalBalance) : "••••••"}
          </div>
        </div>

        {/* My Accounts Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">My Accounts</h2>
          </div>
          {loading ? (
            <div className="text-center py-4 text-gray-500 text-sm">Loading accounts...</div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-2 text-sm">No bank accounts added yet</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {bankAccounts.map((account, index) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('button')) {
                      router.push(`/bank-account/${account.id}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className={`${getAccountIconColor(index)} w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{account.name}</div>
                      {/* <div className="text-xs text-gray-500">Manual Account</div> */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${account.currentBalance >= 0 ? "text-black" : "text-red-600"
                      }`}>
                      {formatCurrency(account.currentBalance)}
                    </span>
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditAccount(account);
                        setIsBankAccountModalOpen(true);
                      }}
                      className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      aria-label={`Edit ${account.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button> */}
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteAccountId(account.id);
                      }}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Delete ${account.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button> */}
                  </div>
                </div>
              ))}
            </div>

          )}
          <Button
            onClick={() => setIsBankAccountModalOpen(true)}
            size="lg"
            className="my-4 text-base w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Manage Accounts
          </Button>
        </div>

        {/* Monthly Bills Section */}
        {invoices.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">{currentMonth} Bills</h2>
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
            <div className="text-lg font-semibold text-red-600">
              {showBills ? formatCurrency(-totalBills) : "••••••"}
            </div>
          </div>
        )}

        {/* My Cards Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h2 className="text-base font-semibold">My Cards</h2>
            </div>
          </div>
          {totalNextBills > 0 && (
            <span className="text-base font-semibold text-red-600 whitespace-nowrap">
              Bills: {formatCurrency(totalNextBills)}
            </span>
          )}
          {loading ? (
            <div className="text-center py-4 text-gray-500 text-sm">Loading cards...</div>
          ) : creditCards.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-2 text-sm">No credit cards added yet</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {creditCards.map((card, index) => {
                const invoice = invoices.find((inv) => inv.cardId === card.id);
                const nextBill = nextBills.find((bill) => bill.cardId === card.id);
                const availablePercentage = card.cardLimit > 0 ? (card.availableBalance / card.cardLimit) * 100 : 0;
                return (
                  <div key={card.id} className="bg-gray-50 rounded-lg">
                    <div
                      className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        if (!(e.target as HTMLElement).closest('button')) {
                          router.push(`/credit-card/${card.id}`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className={`${getCardIconColor(index)} w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0`}>
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{card.name}</div>
                          {/* <div className="text-xs text-gray-500">Manual Card</div> */}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="text-xs font-semibold text-green-600 whitespace-nowrap">
                            {formatCurrency(card.availableBalance)}
                          </div>
                          {invoice && invoice.totalAmount > 0 && (
                            <div className="text-[10px] text-red-600 text-right leading-tight">
                              {invoice.invoice?.paidAmount && invoice.invoice.paidAmount > 0 && !invoice.invoice.isPaid ? (
                                <>
                                  Paid: {formatCurrency(invoice.invoice.paidAmount)}
                                </>
                              ) : (
                                <>
                                  Due {formatDate(invoice.paymentDueDate)}: {formatCurrency(-invoice.totalAmount)}
                                </>
                              )}
                            </div>
                          )}
                          {nextBill && nextBill.totalAmount > 0 && (
                            <div className={`text-[10px] text-red-600 font-medium text-right leading-tight`}>
                              Next: {formatCurrency(nextBill.totalAmount)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditCard(card);
                              setIsModalOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
                            aria-label={`Edit ${card.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteCardId(card.id);
                            }}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                            aria-label={`Delete ${card.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button> */}
                        </div>
                      </div>
                    </div>
                    {/* Available Limit Progress Bar */}
                    <div className="px-2.5 pb-2">
                      <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all duration-300 rounded-full"
                          style={{ width: `${Math.min(availablePercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="my-4 text-base w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Manage Cards
        </Button>
      </main>
      <Footer
        onAddTransaction={() => setIsTransactionModalOpen(true)}
        isTransactionDisabled={creditCards.length === 0 && bankAccounts.length === 0}
      />

      <CreditCardModal
        open={isModalOpen}
        setOpen={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditCard(null);
          }
        }}
        editCard={editCard}
        onSuccess={async () => {
          await fetchCreditCards();
          await fetchInvoices();
          await fetchNextBills();
          setEditCard(null);
        }}
      />

      <BankAccountModal
        open={isBankAccountModalOpen}
        setOpen={(open) => {
          setIsBankAccountModalOpen(open);
          if (!open) {
            setEditAccount(null);
          }
        }}
        editAccount={editAccount}
        onSuccess={() => {
          fetchBankAccounts();
          setEditAccount(null);
        }}
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
