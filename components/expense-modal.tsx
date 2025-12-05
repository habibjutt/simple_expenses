import React, { useState } from "react";
import { createExpenseAccount } from "@/app/api/expense-account-action";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function ExpenseModal({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [accountName, setAccountName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("accountName", accountName);
      formData.append("initialBalance", initialBalance);
      await createExpenseAccount(formData);
      setOpen(false);
      setAccountName("");
      setInitialBalance("");
    } catch (err: any) {
      setError(err.message || "Failed to create expense account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Expense Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Account Name" required>
            <Input
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              placeholder="Enter account name"
              required
            />
          </Field>
          <Field label="Initial Balance" required>
            <Input
              type="number"
              value={initialBalance}
              onChange={e => setInitialBalance(e.target.value)}
              placeholder="Enter initial balance"
              required
              min={0}
            />
          </Field>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
