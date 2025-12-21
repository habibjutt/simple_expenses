"use client";

import React from "react";
import { Plus, List, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onAddTransaction?: () => void;
  onViewTransactions?: () => void;
  onAddCreditCard?: () => void;
  onAddBankAccount?: () => void;
  isTransactionDisabled?: boolean;
}

const Footer = ({
  onAddTransaction,
  onViewTransactions,
  onAddCreditCard,
  onAddBankAccount,
  isTransactionDisabled = false,
}: FooterProps) => {
  const scrollToTransactions = () => {
    const element = document.getElementById("transactions-section");
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {/* Add Transaction Button */}
          <Button
            onClick={onAddTransaction}
            disabled={isTransactionDisabled}
            size="lg"
            className="flex flex-col items-center justify-center gap-2 h-auto py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs font-semibold">Add Transaction</span>
          </Button>

          {/* View Transactions Button */}
          <Button
            onClick={onViewTransactions || scrollToTransactions}
            variant="outline"
            size="lg"
            className="flex flex-col items-center justify-center gap-2 h-auto py-4 border-2"
          >
            <List className="h-6 w-6" />
            <span className="text-xs font-semibold">View All</span>
          </Button>

          {/* Add Credit Card Button */}
          <Button
            onClick={onAddCreditCard}
            variant="outline"
            size="lg"
            className="flex flex-col items-center justify-center gap-2 h-auto py-4 border-2 hidden md:flex"
          >
            <CreditCard className="h-6 w-6" />
            <span className="text-xs font-semibold">Add Card</span>
          </Button>

          {/* Add Bank Account Button */}
          <Button
            onClick={onAddBankAccount}
            variant="outline"
            size="lg"
            className="flex flex-col items-center justify-center gap-2 h-auto py-4 border-2 hidden md:flex"
          >
            <Wallet className="h-6 w-6" />
            <span className="text-xs font-semibold">Add Account</span>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
