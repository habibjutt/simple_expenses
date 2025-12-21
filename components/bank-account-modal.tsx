"use client";

import React, { useState } from "react";
import { createBankAccount } from "@/app/api/bank-account-action";
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

export default function BankAccountModal({
  open,
  setOpen,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("initialBalance", initialBalance);
      await createBankAccount(formData);
      setOpen(false);
      setName("");
      setInitialBalance("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create bank account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
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
              {loading ? "Adding..." : "Add Account"}
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
