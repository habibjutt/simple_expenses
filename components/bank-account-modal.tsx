"use client";

import React, { useState, useEffect } from "react";
import { createBankAccount, updateBankAccount } from "@/app/api/bank-account-action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type BankAccount = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
};

export default function BankAccountModal({
  open,
  setOpen,
  onSuccess,
  editAccount,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSuccess?: () => void;
  editAccount?: BankAccount | null;
}) {
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setInitialBalance(editAccount.initialBalance.toString());
    } else {
      setName("");
      setInitialBalance("");
    }
    setError(null);
  }, [editAccount, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("initialBalance", initialBalance);
      
      if (editAccount) {
        await updateBankAccount(editAccount.id, formData);
      } else {
        await createBankAccount(formData);
      }
      
      setOpen(false);
      setName("");
      setInitialBalance("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${editAccount ? "update" : "create"} bank account`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editAccount ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Account Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Checking Account"
              required
              aria-label="Bank account name"
            />
          </Field>
          <Field label="Initial Balance" required>
            <Input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="Enter initial balance"
              required
              min={0}
              step="0.01"
              aria-label="Initial balance"
            />
          </Field>
          {error && (
            <div className="text-red-500 text-sm" role="alert">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" variant="default" disabled={loading}>
              {loading ? (editAccount ? "Updating..." : "Adding...") : (editAccount ? "Update Account" : "Add Account")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
