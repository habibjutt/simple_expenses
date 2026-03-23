"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { createTransaction, createTransfer, updateTransaction } from "@/app/api/transaction-action";
import { cn, formatCurrency } from "@/lib/utils";
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
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, ChevronDown, ChevronUp, RefreshCw, Layers } from "lucide-react";
import { FormCombobox } from "@/components/ui/form-combobox";

type TransactionType = "expense" | "income" | "transfer";
type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

type EditTransaction = {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category: string;
  notes: string | null;
  installments: number;
  creditCardId: string | null;
  bankAccountId: string | null;
  isRecurring?: boolean;
  recurringFrequency?: string | null;
  recurringEndDate?: Date | null;
};

const CATEGORIES = [
  "Food & Dining", "Shopping", "Transportation", "Entertainment",
  "Bills & Utilities", "Healthcare", "Groceries", "Salary",
  "Investment", "Yumni", "Splitwise", "Loan", "Others",
];

export default function TransactionModal({
  open,
  setOpen,
  creditCards,
  bankAccounts,
  onSuccess,
  editTransaction,
  defaultBankAccountId,
  defaultCreditCardId,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  creditCards: Array<{ id: string; name: string; availableBalance: number }>;
  bankAccounts: Array<{ id: string; name: string; currentBalance: number }>;
  onSuccess?: () => void;
  editTransaction?: EditTransaction | null;
  defaultBankAccountId?: string;
  defaultCreditCardId?: string;
}) {
  const [transactionType, setTransactionType] = useState<TransactionType>("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [paymentType, setPaymentType] = useState<"creditCard" | "bankAccount">("bankAccount");
  const [creditCardId, setCreditCardId] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [installments, setInstallments] = useState("1");
  const [isInstallments, setIsInstallments] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>("monthly");
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editTransaction && open) {
      setName(editTransaction.name);
      setAmount(Math.abs(editTransaction.amount).toString());
      setDate(new Date(editTransaction.date).toISOString().split("T")[0]);
      setCategory(editTransaction.category);
      setNotes(editTransaction.notes || "");
      setInstallments(editTransaction.installments.toString());
      setIsInstallments(editTransaction.installments > 1);
      setIsRecurring(editTransaction.isRecurring ?? false);
      setRecurringFrequency((editTransaction.recurringFrequency as RecurringFrequency) ?? "monthly");
      setRecurringEndDate(
        editTransaction.recurringEndDate
          ? new Date(editTransaction.recurringEndDate).toISOString().split("T")[0]
          : ""
      );
      if (editTransaction.isRecurring || editTransaction.notes) setShowAdvanced(true);
      
      // Determine transaction type and payment method
      if (editTransaction.amount < 0) {
        setTransactionType("income");
        if (editTransaction.creditCardId) {
          setPaymentType("creditCard");
          setCreditCardId(editTransaction.creditCardId);
        } else {
          setPaymentType("bankAccount");
          setBankAccountId(editTransaction.bankAccountId || "");
        }
      } else if (editTransaction.category === "Transfer") {
        setTransactionType("transfer");
      } else {
        setTransactionType("expense");
        if (editTransaction.creditCardId) {
          setPaymentType("creditCard");
          setCreditCardId(editTransaction.creditCardId);
        } else {
          setPaymentType("bankAccount");
          setBankAccountId(editTransaction.bankAccountId || "");
        }
      }
    } else if (open && !editTransaction) {
      resetForm();
    }
  }, [editTransaction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Validate required combobox fields
      if (transactionType === "transfer") {
        if (!fromAccountId) throw new Error("Please select a source account");
        if (!toAccountId) throw new Error("Please select a destination account");
      } else {
        if (!category) throw new Error("Please select a category");
        if (paymentType === "creditCard" && !creditCardId) throw new Error("Please select a credit card");
        if (paymentType === "bankAccount" && !bankAccountId) throw new Error("Please select a bank account");
      }

      if (editTransaction) {
        // Update existing transaction (transfers cannot be edited)
        if (transactionType === "transfer") {
          throw new Error("Transfers cannot be edited");
        }
        
        const formData = new FormData();
        formData.append("name", name);
        formData.append("amount", transactionType === "income" ? `-${amount}` : amount);
        formData.append("date", date);
        formData.append("category", category);
        formData.append("notes", notes);
        formData.append("installments", isInstallments ? installments : "1");
        formData.append("isRecurring", isRecurring ? "true" : "false");
        if (isRecurring) {
          formData.append("recurringFrequency", recurringFrequency);
          if (recurringEndDate) formData.append("recurringEndDate", recurringEndDate);
        }
        
        const result = await updateTransaction(editTransaction.id, formData);
        if (result?.error) throw new Error(result.error);
      } else {
        // Create new transaction
        if (transactionType === "transfer") {
          // Handle transfer logic
          if (!fromAccountId || !toAccountId) {
            throw new Error("Please select both source and destination accounts");
          }
          if (fromAccountId === toAccountId) {
            throw new Error("Source and destination accounts must be different");
          }
          
          const formData = new FormData();
          formData.append("name", name || "Transfer");
          formData.append("amount", amount);
          formData.append("date", date);
          formData.append("fromAccountId", fromAccountId);
          formData.append("toAccountId", toAccountId);
          
          const result = await createTransfer(formData);
          if (result?.error) throw new Error(result.error);
        } else {
          const formData = new FormData();
          formData.append("name", name);
          formData.append("amount", transactionType === "income" ? `-${amount}` : amount);
          formData.append("date", date);
          formData.append("category", category);
          formData.append("notes", notes);
          if (paymentType === "creditCard") {
            formData.append("creditCardId", creditCardId);
          } else {
            formData.append("bankAccountId", bankAccountId);
          }
          formData.append("installments", isInstallments ? installments : "1");
          formData.append("isRecurring", isRecurring ? "true" : "false");
          if (isRecurring) {
            formData.append("recurringFrequency", recurringFrequency);
            if (recurringEndDate) formData.append("recurringEndDate", recurringEndDate);
          }
          const result = await createTransaction(formData);
          if (result?.error) throw new Error(result.error);
        }
      }
      
      setOpen(false);
      resetForm();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError((err as Error).message || "Failed to " + (editTransaction ? "update" : "create") + " transaction");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategory("");
    setNotes("");
    if (defaultCreditCardId) {
      setPaymentType("creditCard");
      setCreditCardId(defaultCreditCardId);
      setBankAccountId("");
    } else {
      setPaymentType("bankAccount");
      setCreditCardId("");
      setBankAccountId(defaultBankAccountId ?? "");
    }
    setFromAccountId("");
    setToAccountId("");
    setInstallments("1");
    setIsInstallments(false);
    setIsRecurring(false);
    setRecurringFrequency("monthly");
    setRecurringEndDate("");
    setShowAdvanced(false);
    setDatePickerOpen(false);
    setEndDatePickerOpen(false);
  };

  // Sort credit cards and bank accounts by name
  const sortedCreditCards = [...creditCards].sort((a, b) => a.name.localeCompare(b.name));
  const sortedBankAccounts = [...bankAccounts].sort((a, b) => a.name.localeCompare(b.name));

  const typeConfig = {
    expense: { label: "Expense", color: "text-red-600", activeBg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-800" },
    income:  { label: "Income",  color: "text-green-600", activeBg: "bg-green-50 dark:bg-green-950/40", border: "border-green-200 dark:border-green-800" },
    transfer:{ label: "Transfer",color: "text-blue-600",  activeBg: "bg-blue-50 dark:bg-blue-950/40",   border: "border-blue-200 dark:border-blue-800"  },
  };

  const canShowInstallments = transactionType === "expense" && paymentType === "creditCard" && !isRecurring;
  const canShowRecurring = transactionType !== "transfer" && !isInstallments;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-0">
          <DialogTitle className="text-base font-semibold">
            {editTransaction ? "Edit Transaction" : "New Transaction"}
          </DialogTitle>
        </DialogHeader>

        {/* Transaction Type Tabs */}
        <div className="flex gap-1.5 p-1 rounded-lg bg-muted/60">
          {(["expense", "income", "transfer"] as TransactionType[]).map((type) => {
            const cfg = typeConfig[type];
            const isActive = transactionType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setTransactionType(type);
                  if (type === "transfer") { setIsInstallments(false); setIsRecurring(false); }
                }}
                disabled={!!editTransaction}
                className={cn(
                  "flex-1 py-2 px-2 rounded-md text-sm font-medium transition-all duration-150",
                  isActive
                    ? `${cfg.color} ${cfg.activeBg} border ${cfg.border} shadow-sm`
                    : "text-muted-foreground hover:text-foreground",
                  editTransaction && "opacity-40 cursor-not-allowed"
                )}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Amount + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">AED</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  min={0}
                  step="0.01"
                  className="pl-12 font-semibold"
                  aria-label="Transaction amount"
                />
              </div>
            </Field>
            <Field label="Date" required>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Select transaction date"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {date
                      ? format(new Date(date + "T00:00:00"), "MMM d, yyyy")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date ? new Date(date + "T00:00:00") : undefined}
                    onSelect={(d) => {
                      if (d) {
                        setDate(d.toISOString().split("T")[0]);
                        setDatePickerOpen(false);
                      }
                    }}
                    captionLayout="dropdown"
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What was this for?"
              aria-label="Transaction description"
            />
          </Field>

          {/* Transfer fields */}
          {transactionType === "transfer" ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="From Account" required>
                <FormCombobox
                  value={fromAccountId}
                  onValueChange={setFromAccountId}
                  options={sortedBankAccounts.map((a) => ({
                    value: a.id,
                    label: `${a.name} (${formatCurrency(a.currentBalance)})`,
                  }))}
                  placeholder="Select account…"
                  searchPlaceholder="Search accounts…"
                  emptyText="No accounts found."
                />
              </Field>
              <Field label="To Account" required>
                <FormCombobox
                  value={toAccountId}
                  onValueChange={setToAccountId}
                  options={sortedBankAccounts.map((a) => ({
                    value: a.id,
                    label: `${a.name} (${formatCurrency(a.currentBalance)})`,
                    disabled: a.id === fromAccountId,
                  }))}
                  placeholder="Select account…"
                  searchPlaceholder="Search accounts…"
                  emptyText="No accounts found."
                />
              </Field>
            </div>
          ) : (
            <>
              {/* Category */}
              <Field label="Category" required>
                <FormCombobox
                  value={category}
                  onValueChange={setCategory}
                  options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                  placeholder="Select category…"
                  searchPlaceholder="Search categories…"
                  emptyText="No category found."
                />
              </Field>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <Field label={transactionType === "income" ? "Receive To" : "Pay With"} required>
                  <FormCombobox
                    value={paymentType}
                    onValueChange={(v) => {
                      const val = (v || "bankAccount") as "creditCard" | "bankAccount";
                      setPaymentType(val);
                      setCreditCardId("");
                      setBankAccountId("");
                      if (val !== "creditCard") setIsInstallments(false);
                    }}
                    options={[
                      { value: "bankAccount", label: "Bank Account" },
                      {
                        value: "creditCard",
                        label: transactionType === "income" ? "Credit Card (Cashback)" : "Credit Card",
                      },
                    ]}
                    placeholder="Select…"
                    searchPlaceholder="Search…"
                  />
                </Field>

                {paymentType === "creditCard" ? (
                  <Field label="Credit Card" required>
                    <FormCombobox
                      value={creditCardId}
                      onValueChange={setCreditCardId}
                      options={sortedCreditCards.map((card) => ({
                        value: card.id,
                        label: `${card.name} (${formatCurrency(card.availableBalance)})`,
                      }))}
                      placeholder="Select card…"
                      searchPlaceholder="Search cards…"
                      emptyText="No cards found."
                    />
                  </Field>
                ) : (
                  <Field label="Bank Account" required>
                    <FormCombobox
                      value={bankAccountId}
                      onValueChange={setBankAccountId}
                      options={sortedBankAccounts.map((a) => ({
                        value: a.id,
                        label: `${a.name} (${formatCurrency(a.currentBalance)})`,
                      }))}
                      placeholder="Select account…"
                      searchPlaceholder="Search accounts…"
                      emptyText="No accounts found."
                    />
                  </Field>
                )}
              </div>
            </>
          )}

          {/* Advanced Section */}
          {transactionType !== "transfer" && (
            <div className="border border-dashed border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {(isInstallments || isRecurring) ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  ) : null}
                  Advanced options
                </span>
                {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {showAdvanced && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-dashed border-border">
                  {/* Notes */}
                  <Field label="Notes (optional)">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add a note…"
                      rows={2}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      aria-label="Transaction notes"
                    />
                  </Field>

                  {/* Installments - credit card expense only */}
                  {canShowInstallments && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Layers size={14} className="text-muted-foreground" />
                          Split into Installments
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isInstallments}
                          onClick={() => { setIsInstallments(!isInstallments); if (isInstallments) setInstallments("1"); }}
                          className={cn(
                            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isInstallments ? "bg-primary" : "bg-muted-foreground/30"
                          )}
                        >
                          <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform", isInstallments ? "translate-x-4" : "translate-x-1")} />
                        </button>
                      </div>
                      {isInstallments && (
                        <Field label="Number of Installments">
                          <Input
                            type="number"
                            value={installments}
                            onChange={(e) => setInstallments(e.target.value)}
                            placeholder="e.g. 3"
                            min={2}
                            max={60}
                            required
                            aria-label="Number of installments"
                          />
                        </Field>
                      )}
                    </div>
                  )}

                  {/* Recurring Transaction */}
                  {canShowRecurring && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <RefreshCw size={14} className="text-muted-foreground" />
                          Recurring Transaction
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isRecurring}
                          onClick={() => setIsRecurring(!isRecurring)}
                          className={cn(
                            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isRecurring ? "bg-primary" : "bg-muted-foreground/30"
                          )}
                        >
                          <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform", isRecurring ? "translate-x-4" : "translate-x-1")} />
                        </button>
                      </div>

                      {isRecurring && (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Repeat every</p>
                            <div className="grid grid-cols-4 gap-1.5">
                              {(["daily", "weekly", "monthly", "yearly"] as RecurringFrequency[]).map((freq) => (
                                <button
                                  key={freq}
                                  type="button"
                                  onClick={() => setRecurringFrequency(freq)}
                                  className={cn(
                                    "py-1.5 px-2 rounded-md text-xs font-medium border capitalize transition-colors",
                                    recurringFrequency === freq
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                                  )}
                                >
                                  {freq}
                                </button>
                              ))}
                            </div>
                          </div>
                          <Field label="End date (optional)">
                            <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  aria-label="Select recurring end date"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !recurringEndDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                  {recurringEndDate
                                    ? format(new Date(recurringEndDate + "T00:00:00"), "MMM d, yyyy")
                                    : "No end date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={recurringEndDate ? new Date(recurringEndDate + "T00:00:00") : undefined}
                                  onSelect={(d) => {
                                    setRecurringEndDate(d ? d.toISOString().split("T")[0] : "");
                                    setEndDatePickerOpen(false);
                                  }}
                                  disabled={(d) =>
                                    date ? d < new Date(date + "T00:00:00") : false
                                  }
                                  captionLayout="dropdown"
                                  autoFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </Field>
                          <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                            A new transaction will be created automatically each {recurringFrequency === "daily" ? "day" : recurringFrequency === "weekly" ? "week" : recurringFrequency === "monthly" ? "month" : "year"}. You can pause or stop this anytime.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/40 px-3 py-2 rounded-md" role="alert">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              variant="default"
              disabled={loading}
              className={cn(
                "w-full font-medium",
                transactionType === "expense" && "bg-red-600 hover:bg-red-700",
                transactionType === "income" && "bg-green-600 hover:bg-green-700",
                transactionType === "transfer" && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {loading
                ? (editTransaction ? "Updating…" : "Adding…")
                : (editTransaction ? "Update Transaction" : `Add ${typeConfig[transactionType].label}`)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
