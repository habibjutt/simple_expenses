"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getBankAccounts, deleteBankAccount } from "@/app/api/bank-account-action";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BankAccountModal from "@/components/bank-account-modal";
import { Wallet, Edit2, Trash2, Plus, TrendingUp, TrendingDown } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      alert("Error fetching bank accounts: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAccounts();
    }
  }, [session]);

  const handleAddAccount = () => {
    setEditingAccount(null);
    setIsAccountModalOpen(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setIsAccountModalOpen(true);
  };

  const handleDeleteClick = (account: BankAccount) => {
    setDeletingAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAccount) return;

    try {
      await deleteBankAccount(deletingAccount.id);
      await fetchAccounts();
      setDeleteDialogOpen(false);
      setDeletingAccount(null);
    } catch (error) {
      console.error("Failed to delete bank account:", error);
      alert("Error deleting bank account: " + (error as Error).message);
    }
  };

  const handleModalSuccess = () => {
    fetchAccounts();
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#E3E3E3]">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="text-center py-12">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const balanceChange = (account: BankAccount) => account.currentBalance - account.initialBalance;

  return (
    <div className="min-h-screen flex flex-col bg-[#E3E3E3]">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Bank Accounts</h1>
          <Button onClick={handleAddAccount} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>

        {accounts.length > 0 && (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Balance</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
                <p className="text-xs text-gray-500 mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {accounts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">No bank accounts found</p>
                <Button onClick={handleAddAccount}>Add Your First Account</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const change = balanceChange(account);
              const isPositive = change >= 0;
              
              return (
                <Card key={account.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAccount(account)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(account)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(account.currentBalance)}
                      </p>
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Initial Balance</span>
                        <span className="font-semibold">{formatCurrency(account.initialBalance)}</span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-600">Change</span>
                        <span className={`font-semibold flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatCurrency(Math.abs(change))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      <BankAccountModal
        open={isAccountModalOpen}
        setOpen={setIsAccountModalOpen}
        onSuccess={handleModalSuccess}
        editAccount={editingAccount}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bank account &quot;{deletingAccount?.name}&quot;. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
