import {
  ListOrdered,
  Target,
  BarChart2,
  PiggyBank,
  CreditCard,
  Building2,
} from "lucide-react";

export const FEATURE_LINKS = [
  {
    href: "/features/expense-tracking",
    label: "Expense Tracking",
    icon: ListOrdered,
    description:
      "Log and categorize every transaction in seconds. Full history, smart filters, and installment support built-in.",
  },
  {
    href: "/features/budgets",
    label: "Budgets & Spending Limits",
    icon: Target,
    description:
      "Set monthly spending limits per category and get instant alerts before you overspend.",
  },
  {
    href: "/features/reports",
    label: "Reports & Analytics",
    icon: BarChart2,
    description:
      "Beautiful charts and breakdowns that turn raw transactions into actionable financial insights.",
  },
  {
    href: "/features/goals",
    label: "Savings Goals",
    icon: PiggyBank,
    description:
      "Define savings targets, track your progress, and celebrate every milestone along the way.",
  },
  {
    href: "/features/credit-cards",
    label: "Credit Card Management",
    icon: CreditCard,
    description:
      "Track balances, due dates, payment dates, and invoices for all your credit cards in one place.",
  },
  {
    href: "/features/bank-accounts",
    label: "Bank Account Management",
    icon: Building2,
    description:
      "Connect multiple bank accounts and keep a real-time view of your total available balance.",
  },
];
