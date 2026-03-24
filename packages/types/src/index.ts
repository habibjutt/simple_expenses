import { z } from "zod";

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

export const SUPPORTED_CURRENCIES = [
  { code: "AED", name: "UAE Dirham" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "BHD", name: "Bahraini Dinar" },
  { code: "OMR", name: "Omani Rial" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "INR", name: "Indian Rupee" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "SGD", name: "Singapore Dollar" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  preferredCurrency: string;
  onboardingCompleted: boolean;
  subscriptionStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Credit Card
// ---------------------------------------------------------------------------

export interface CreditCard {
  id: string;
  name: string;
  billGenerationDate: number;
  paymentDate: number;
  cardLimit: number;
  availableBalance: number;
  currency: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const createCreditCardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  billGenerationDate: z.number().int().min(1).max(31),
  paymentDate: z.number().int().min(1).max(31),
  cardLimit: z.number().positive("Card limit must be positive"),
  currency: z.string().default("AED"),
});

export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>;

// ---------------------------------------------------------------------------
// Bank Account
// ---------------------------------------------------------------------------

export interface BankAccount {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const createBankAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  initialBalance: z.number().min(0, "Initial balance cannot be negative"),
  currency: z.string().default("AED"),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;

// ---------------------------------------------------------------------------
// Transaction
// ---------------------------------------------------------------------------

export type TransactionType = "expense" | "income" | "transfer";

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: TransactionType;
  notes: string | null;
  installments: number;
  installmentNumber: number | null;
  parentTransactionId: string | null;
  creditCardId: string | null;
  bankAccountId: string | null;
  isRecurring: boolean;
  recurringFrequency: string | null;
  createdAt: string;
  updatedAt: string;
  creditCard?: { name: string } | null;
  bankAccount?: { name: string } | null;
}

export const createTransactionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().refine((n) => n !== 0, "Amount cannot be zero"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["expense", "income", "transfer"]).default("expense"),
  notes: z.string().optional(),
  installments: z.number().int().min(1).default(1),
  creditCardId: z.string().optional(),
  bankAccountId: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------

export interface Invoice {
  id: string;
  creditCardId: string;
  billStartDate: string;
  billEndDate: string;
  paymentDueDate: string;
  totalAmount: number;
  paidAmount: number;
  creditFromPreviousMonth: number;
  isPaid: boolean;
  paidAt: string | null;
  paidFromBankAccountId: string | null;
  createdAt: string;
  updatedAt: string;
  creditCard?: { name: string; currency: string } | null;
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: "expense" | "income" | "both";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// ---------------------------------------------------------------------------
// API Response wrapper
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  status: number;
}
