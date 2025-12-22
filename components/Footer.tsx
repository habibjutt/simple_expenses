"use client";

import React from "react";
import { Plus, List, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface FooterProps {
  onAddTransaction?: () => void;
  isTransactionDisabled?: boolean;
}

const Footer = ({
  onAddTransaction,
  isTransactionDisabled = false,
}: FooterProps) => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isTransactions = pathname === "/transactions";

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-3 gap-3">
          {/* Home Button */}
          <Link href="/" className="flex">
            <Button
              variant={isHome ? "default" : "outline"}
              size="lg"
              className={`flex items-center justify-center h-auto py-4 w-full ${
                isHome ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-2"
              }`}
              aria-label="Home"
            >
              <Home className="h-6 w-6" />
            </Button>
          </Link>

          {/* All Transactions Button */}
          <Link href="/transactions" className="flex">
            <Button
              variant={isTransactions ? "default" : "outline"}
              size="lg"
              className={`flex items-center justify-center h-auto py-4 w-full ${
                isTransactions ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-2"
              }`}
              aria-label="All Transactions"
            >
              <List className="h-6 w-6" />
            </Button>
          </Link>

          {/* Add Transaction Button */}
          <Button
            onClick={onAddTransaction}
            disabled={isTransactionDisabled}
            size="lg"
            className="flex items-center justify-center h-auto py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Add Transaction"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
