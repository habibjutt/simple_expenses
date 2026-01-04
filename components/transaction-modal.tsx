"use client";

import React, { useState, useEffect } from "react";
import { createTransaction, createTransfer, updateTransaction } from "@/app/api/transaction-action";
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

type TransactionType = "expense" | "income" | "transfer";

type EditTransaction = {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category: string;
  installments: number;
  creditCardId: string | null;
  bankAccountId: string | null;
};

export default function TransactionModal({
  open,
  setOpen,
  creditCards,
  bankAccounts,
  onSuccess,
  editTransaction,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  creditCards: Array<{ id: string; name: string; availableBalance: number }>;
  bankAccounts: Array<{ id: string; name: string; currentBalance: number }>;
  onSuccess?: () => void;
  editTransaction?: EditTransaction | null;
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
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editTransaction && open) {
      setName(editTransaction.name);
      setAmount(Math.abs(editTransaction.amount).toString());
      setDate(new Date(editTransaction.date).toISOString().split("T")[0]);
      setCategory(editTransaction.category);
      setInstallments(editTransaction.installments.toString());
      setIsRecurring(editTransaction.installments > 1);
      
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
        formData.append("installments", isRecurring ? installments : "1");
        
        await updateTransaction(editTransaction.id, formData);
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
          
          await createTransfer(formData);
        } else {
          const formData = new FormData();
          formData.append("name", name);
          formData.append("amount", transactionType === "income" ? `-${amount}` : amount);
          formData.append("date", date);
          formData.append("category", category);
          if (paymentType === "creditCard") {
            formData.append("creditCardId", creditCardId);
          } else {
            formData.append("bankAccountId", bankAccountId);
          }
          formData.append("installments", isRecurring ? installments : "1");
          await createTransaction(formData);
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
    setCreditCardId("");
    setBankAccountId("");
    setFromAccountId("");
    setToAccountId("");
    setInstallments("1");
    setIsRecurring(false);
  };

  // Sort credit cards and bank accounts by name
  const sortedCreditCards = [...creditCards].sort((a, b) => a.name.localeCompare(b.name));
  const sortedBankAccounts = [...bankAccounts].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{editTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        </DialogHeader>

        {/* Transaction Type Tabs - Disabled when editing */}
        <div className="flex border-b border-gray-200 -mx-6 px-6">
          <button
            type="button"
            onClick={() => setTransactionType("expense")}
            disabled={!!editTransaction}
            className={`flex-1 py-2.5 px-3 text-center text-sm font-medium transition-colors ${
              transactionType === "expense"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            } ${editTransaction ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setTransactionType("income")}
            disabled={!!editTransaction}
            className={`flex-1 py-2.5 px-3 text-center text-sm font-medium transition-colors ${
              transactionType === "income"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            } ${editTransaction ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setTransactionType("transfer")}
            disabled={!!editTransaction}
            className={`flex-1 py-2.5 px-3 text-center text-sm font-medium transition-colors ${
              transactionType === "transfer"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            } ${editTransaction ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-3">
          {/* Amount Field - Prominent at top */}
          <Field label="Amount" required>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              min={0}
              step="0.01"
              className="text-xl font-bold text-center h-12"
              aria-label="Transaction amount"
            />
          </Field>

          {/* Description Field */}
          <Field label="Description">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add a description"
              aria-label="Transaction description"
            />
          </Field>

          {transactionType === "transfer" ? (
            <>
              {/* Transfer From */}
              <Field label="From Account" required>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Select source account"
                >
                  <option value="">Select source account</option>
                  {sortedBankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (${account.currentBalance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </Field>

              {/* Transfer To */}
              <Field label="To Account" required>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Select destination account"
                >
                  <option value="">Select destination account</option>
                  {sortedBankAccounts.map((account) => (
                    <option key={account.id} value={account.id} disabled={account.id === fromAccountId}>
                      {account.name} (${account.currentBalance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : (
            <>
              {/* Category */}
              <Field label="Category" required>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Select category"
                >
                  <option value="">Select category</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Salary">Salary</option>
                  <option value="Investment">Investment</option>
                  <option value="Others">Others</option>
                </select>
              </Field>

              {/* Payment Method - Only for expenses */}
              {transactionType === "expense" && (
                <>
                  <Field label="Payment Method" required>
                    <select
                      value={paymentType}
                      onChange={(e) => {
                        setPaymentType(e.target.value as "creditCard" | "bankAccount");
                        setCreditCardId("");
                        setBankAccountId("");
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Select payment method"
                    >
                      <option value="bankAccount">Bank Account</option>
                      <option value="creditCard">Credit Card</option>
                    </select>
                  </Field>

                  {paymentType === "creditCard" ? (
                    <Field label="Credit Card" required>
                      <select
                        value={creditCardId}
                        onChange={(e) => setCreditCardId(e.target.value)}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Select credit card"
                      >
                        <option value="">Select a credit card</option>
                        {sortedCreditCards.map((card) => (
                          <option key={card.id} value={card.id}>
                            {card.name} (Available: ${card.availableBalance.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </Field>
                  ) : (
                    <Field label="Bank Account" required>
                      <select
                        value={bankAccountId}
                        onChange={(e) => setBankAccountId(e.target.value)}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Select bank account"
                      >
                        <option value="">Select a bank account</option>
                        {sortedBankAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} (Balance: ${account.currentBalance.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                </>
              )}

              {/* For income, allow selection between bank account and credit card */}
              {transactionType === "income" && (
                <>
                  <Field label="Receive Income To" required>
                    <select
                      value={paymentType}
                      onChange={(e) => {
                        setPaymentType(e.target.value as "creditCard" | "bankAccount");
                        setCreditCardId("");
                        setBankAccountId("");
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Select income destination"
                    >
                      <option value="bankAccount">Bank Account</option>
                      <option value="creditCard">Credit Card (Cashback)</option>
                    </select>
                  </Field>

                  {paymentType === "creditCard" ? (
                    <Field label="Credit Card" required>
                      <select
                        value={creditCardId}
                        onChange={(e) => setCreditCardId(e.target.value)}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Select credit card"
                      >
                        <option value="">Select a credit card</option>
                        {sortedCreditCards.map((card) => (
                          <option key={card.id} value={card.id}>
                            {card.name} (Available: ${card.availableBalance.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </Field>
                  ) : (
                    <Field label="Bank Account" required>
                      <select
                        value={bankAccountId}
                        onChange={(e) => setBankAccountId(e.target.value)}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Select bank account"
                      >
                        <option value="">Select a bank account</option>
                        {sortedBankAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} (Balance: ${account.currentBalance.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                </>
              )}
            </>
          )}

          {/* Date Field */}
          <Field label="Date" required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              aria-label="Transaction date"
            />
          </Field>

          {/* Repeat Transaction - Only for non-transfer */}
          {transactionType !== "transfer" && (
            <div className="space-y-2">
              <label className="text-xs font-medium">Repeat Transaction</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!isRecurring ? "default" : "outline"}
                  onClick={() => setIsRecurring(false)}
                  className="flex-1 h-9 text-sm"
                >
                  One-time
                </Button>
                <Button
                  type="button"
                  variant={isRecurring ? "default" : "outline"}
                  onClick={() => setIsRecurring(true)}
                  className="flex-1 h-9 text-sm"
                >
                  Installments
                </Button>
              </div>
              
              {isRecurring && (
                <Field label="Number of Installments">
                  <Input
                    type="number"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    placeholder="Enter number of installments"
                    min={2}
                    required
                    aria-label="Number of installments"
                  />
                </Field>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm" role="alert">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button type="submit" variant="default" disabled={loading} className="w-full">
              {loading 
                ? (editTransaction ? "Updating..." : "Adding...") 
                : (editTransaction ? "Update Transaction" : "Add Transaction")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
