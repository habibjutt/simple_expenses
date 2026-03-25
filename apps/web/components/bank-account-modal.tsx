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
import PlanLimitAlert from "./PlanLimitAlert";
import type { GuardResult } from "@/lib/plan-guards";

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
  preferredCurrency = "AED",
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSuccess?: () => void;
  editAccount?: BankAccount | null;
  preferredCurrency?: string;
}) {
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planAlert, setPlanAlert] = useState<GuardResult | null>(null);

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setInitialBalance(editAccount.initialBalance.toString());
    } else {
      setName("");
      setInitialBalance("");
    }
    setError(null);
    setPlanAlert(null);
  }, [editAccount, open]);

  // Currency: preserve existing on edit, use preferred for new accounts
  const currency = editAccount?.currency ?? preferredCurrency;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlanAlert(null);
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
        if (result.planLimitReached) {
          setPlanAlert({ allowed: false, reason: result.error, requiredPlan: result.requiredPlan });
          return;
        }
        setError(result.error);
        return;
      }
      
      setOpen(false);
      setName("");
      setInitialBalance("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editAccount ? "update" : "create"} bank account`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            <p className="text-xs text-slate-500">
              Currency: <span className="font-medium text-slate-700">{currency}</span>
            </p>
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

      {planAlert && (
        <PlanLimitAlert
          open={!!planAlert}
          onClose={() => { setPlanAlert(null); setOpen(false); }}
          limitType="bankAccount"
          guardResult={planAlert}
        />
      )}
    </>
  );
}
