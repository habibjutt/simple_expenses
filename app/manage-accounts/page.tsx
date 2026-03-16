"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getBankAccounts, deleteBankAccount } from "@/app/api/bank-account-action";
import { formatCurrency, cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BankAccountModal from "@/components/bank-account-modal";
import { Wallet, Edit2, Trash2, Plus, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
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

const ACCOUNT_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-orange-500",
];

type BankAccount = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function ManageAccountsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const fetchedAccounts = await getBankAccounts();
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error("Failed to fetch bank accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAccounts();
    }
  }, [session]);

  const handleDeleteConfirm = async () => {
    if (!deletingAccount) return;
    try {
      await deleteBankAccount(deletingAccount.id);
      await fetchAccounts();
      setDeleteDialogOpen(false);
      setDeletingAccount(null);
    } catch (error) {
      console.error("Failed to delete bank account:", error);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) return null;

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const balanceChange = (account: BankAccount) => account.currentBalance - account.initialBalance;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />

      {/* Page hero */}
      <div className="bg-[#1a9e5c] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">Bank Accounts</h1>
              <p className="text-white/60 text-sm mt-0.5">
                {accounts.length} account{accounts.length !== 1 ? "s" : ""} managed
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="flex items-center gap-2 bg-white text-[#1a9e5c] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Account
            </button>
          </div>

          {accounts.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-2xl p-3.5">
                <p className="text-white/60 text-xs font-medium mb-1">Total Balance</p>
                <p className="text-white font-bold text-lg">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3.5">
                <p className="text-white/60 text-xs font-medium mb-1">Accounts</p>
                <p className="text-white font-bold text-lg">{accounts.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24 lg:pb-8">
        {accounts.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">No bank accounts yet</p>
            <p className="text-slate-400 text-sm mb-5">Add your first account to start tracking</p>
            <button
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[#1a9e5c] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#158a4f] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Account
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map((account, i) => {
              const change = balanceChange(account);
              const isPositive = change >= 0;
              const colorClass = ACCOUNT_COLORS[i % ACCOUNT_COLORS.length];
              const initial = account.name.charAt(0).toUpperCase();

              return (
                <div
                  key={account.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden"
                >
                  <div className={`h-1.5 ${colorClass}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${colorClass} flex items-center justify-center text-white font-bold text-lg`}
                        >
                          {initial}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{account.name}</h3>
                          <p className="text-xs text-slate-400">Bank Account</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingAccount(account);
                            setIsAccountModalOpen(true);
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit account"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingAccount(account);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete account"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                        <button
                          onClick={() => router.push(`/bank-account/${account.id}`)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View details"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Current Balance</p>
                        <p className="text-2xl font-bold text-slate-800">
                          {formatCurrency(account.currentBalance)}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Initial Balance</p>
                          <p className="text-sm font-semibold text-slate-600">
                            {formatCurrency(account.initialBalance)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Change</p>
                          <div
                            className={cn(
                              "flex items-center gap-1 text-sm font-semibold",
                              isPositive ? "text-emerald-600" : "text-red-500"
                            )}
                          >
                            {isPositive ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}
                            {formatCurrency(Math.abs(change))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <BankAccountModal
        open={isAccountModalOpen}
        setOpen={setIsAccountModalOpen}
        onSuccess={fetchAccounts}
        editAccount={editingAccount}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingAccount?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

