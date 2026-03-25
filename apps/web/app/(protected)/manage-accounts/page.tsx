"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  getBankAccounts,
  deleteBankAccount,
} from "@/app/api/bank-account-action";
import { getUserProfile } from "@/app/api/user-action";
import { formatCurrency, cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BankAccountModal from "@/components/bank-account-modal";
import {
  Wallet,
  Edit2,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from "lucide-react";
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

const ACCOUNT_COLOR_CONFIGS = [
  { bgClass: "bg-emerald-500", shadow: "shadow-emerald-200" },
  { bgClass: "bg-blue-500", shadow: "shadow-blue-200" },
  { bgClass: "bg-violet-500", shadow: "shadow-violet-200" },
  { bgClass: "bg-amber-500", shadow: "shadow-amber-200" },
  { bgClass: "bg-rose-500", shadow: "shadow-rose-200" },
  { bgClass: "bg-teal-500", shadow: "shadow-teal-200" },
  { bgClass: "bg-indigo-500", shadow: "shadow-indigo-200" },
  { bgClass: "bg-orange-500", shadow: "shadow-orange-200" },
];

type BankAccount = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function ManageAccountsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(
    null,
  );
  const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState("AED");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const [fetchedAccounts, profile] = await Promise.all([
        getBankAccounts(),
        getUserProfile(),
      ]);
      setAccounts(fetchedAccounts);
      if (profile?.preferredCurrency)
        setPreferredCurrency(profile.preferredCurrency);
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
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div
          className="h-44 animate-pulse"
          style={{
            background:
              "linear-gradient(135deg, #0b6e3a 0%, #1a9e5c 55%, #22c068 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-white animate-pulse shadow-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!session) return null;

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + acc.currentBalance,
    0,
  );
  const balanceChange = (account: BankAccount) =>
    account.currentBalance - account.initialBalance;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero */}
      <div
        className="relative overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(135deg, #0b6e3a 0%, #1a9e5c 55%, #22c068 100%)",
        }}
      >
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-8 w-48 h-48 rounded-full bg-black/10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-[0.15em] mb-1.5">
                Manage
              </p>
              <h1 className="text-2xl font-bold leading-tight">
                Bank Accounts
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {accounts.length} account{accounts.length !== 1 ? "s" : ""} on
                file
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="flex-shrink-0 flex items-center gap-2 bg-white text-[#1a9e5c] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-black/20"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Account</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {accounts.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-2">
                  Total Balance
                </p>
                <p className="text-white font-bold text-xl leading-none">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-2">
                  Accounts
                </p>
                <p className="text-white font-bold text-xl leading-none">
                  {accounts.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-28 lg:pb-10">
        {accounts.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No bank accounts yet"
            description="Add your first account to start tracking your finances"
            actionLabel="Add Account"
            onAction={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account, i) => {
              const change = balanceChange(account);
              const isPositive = change >= 0;
              const config =
                ACCOUNT_COLOR_CONFIGS[i % ACCOUNT_COLOR_CONFIGS.length];
              const initial = account.name.charAt(0).toUpperCase();

              return (
                <div
                  key={account.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Color accent bar */}
                  <div className={`h-1 ${config.bgClass}`} />

                  <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl ${config.bgClass} ${config.shadow} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                        >
                          {initial}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight">
                            {account.name}
                          </h3>
                          <span className="inline-block text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full mt-0.5">
                            Bank Account
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => {
                            setEditingAccount(account);
                            setIsAccountModalOpen(true);
                          }}
                          className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit account"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingAccount(account);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete account"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/bank-account/${account.id}`)
                          }
                          className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="View details"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                        Current Balance
                      </p>
                      <p className="text-3xl font-bold text-slate-900 tracking-tight">
                        {formatCurrency(account.currentBalance)}
                      </p>
                    </div>

                    {/* Stats footer */}
                    <div className="bg-slate-50 rounded-xl p-3.5 grid grid-cols-2 gap-3 border border-slate-100/80">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          Initial
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {formatCurrency(account.initialBalance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          Change
                        </p>
                        <div
                          className={cn(
                            "flex items-center gap-1 text-sm font-bold",
                            isPositive ? "text-emerald-600" : "text-red-500",
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
        preferredCurrency={preferredCurrency}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingAccount?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
