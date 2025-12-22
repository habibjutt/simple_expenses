"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getTransactions } from "@/app/api/transaction-action";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TransactionModal from "@/components/transaction-modal";
import { getCreditCards } from "@/app/api/credit-card-action";
import { getBankAccounts } from "@/app/api/bank-account-action";
import { CreditCard, Wallet, Calendar } from "lucide-react";

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
    if (session) {
      fetchTransactions();
      fetchCreditCards();
      fetchBankAccounts();
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

  return (
    <div className="max-w-7xl mx-auto">
      <Header />
      <main className="p-4 md:p-6 pb-48 md:pb-52">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">All Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your transactions
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-2 text-sm">No transactions found</p>
            <p className="text-gray-400 text-xs">
              Add your first transaction to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                    {transaction.creditCardId ? (
                      <CreditCard className="h-5 w-5 text-white" />
                    ) : (
                      <Wallet className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {transaction.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(transaction.date)}</span>
                      <span>•</span>
                      <span>{transaction.category}</span>
                      {transaction.installments > 1 && (
                        <>
                          <span>•</span>
                          <span>
                            {transaction.installments} installments
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {transaction.creditCard
                        ? `Credit Card: ${transaction.creditCard.name}`
                        : transaction.bankAccount
                        ? `Bank Account: ${transaction.bankAccount.name}`
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold text-sm ${
                      transaction.amount < 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.amount < 0
                      ? formatCurrency(Math.abs(transaction.amount))
                      : formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer
        onAddTransaction={() => setIsTransactionModalOpen(true)}
        isTransactionDisabled={
          creditCards.length === 0 && bankAccounts.length === 0
        }
      />

      <TransactionModal
        open={isTransactionModalOpen}
        setOpen={setIsTransactionModalOpen}
        creditCards={creditCards}
        bankAccounts={bankAccounts}
        onSuccess={async () => {
          await fetchTransactions();
          await fetchCreditCards();
          await fetchBankAccounts();
        }}
      />
    </div>
  );
}

