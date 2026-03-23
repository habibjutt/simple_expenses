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
import { SUPPORTED_CURRENCIES } from "@/lib/utils";

type BankAccount = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
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
  const [currency, setCurrency] = useState("AED");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setInitialBalance(editAccount.initialBalance.toString());
      setCurrency(editAccount.currency ?? "AED");
    } else {
      setName("");
      setInitialBalance("");
      setCurrency("AED");
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
      formData.append("currency", currency);
      
      let result;
      if (editAccount) {
        result = await updateBankAccount(editAccount.id, formData);
      } else {
        result = await createBankAccount(formData);
      }
      if (result?.error) {
        setError(result.error);
        return;
      }
      
      setOpen(false);
      setName("");
      setInitialBalance("");
      setCurrency("AED");
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
          <Field label="Currency">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
              aria-label="Currency"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
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
