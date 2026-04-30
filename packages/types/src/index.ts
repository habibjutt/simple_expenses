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
  billReminderDays: number;
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
export type UpdateCreditCardInput = Partial<CreateCreditCardInput>;

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
export type UpdateBankAccountInput = Partial<CreateBankAccountInput>;

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
export type UpdateTransactionInput = Partial<Omit<CreateTransactionInput, "creditCardId" | "bankAccountId">>;

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

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  icon: z.string().min(1, "Icon is required"),
  type: z.enum(["expense", "income", "both"]),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

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
// Spending Limit
// ---------------------------------------------------------------------------

export interface SpendingLimit {
  id: string;
  categoryName: string;
  amount: number;
  month: number;
  year: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const createSpendingLimitSchema = z.object({
  categoryName: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export type CreateSpendingLimitInput = z.infer<typeof createSpendingLimitSchema>;

// ---------------------------------------------------------------------------
// Savings Goal
// ---------------------------------------------------------------------------

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  deadline: string | null;
  isCompleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const createSavingsGoalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.number().positive("Target amount must be positive"),
  color: z.string().default("#1a9e5c"),
  deadline: z.string().optional().nullable(),
});

export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;

export const updateSavingsGoalSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  color: z.string().optional(),
  deadline: z.string().optional().nullable(),
  isCompleted: z.boolean().optional(),
});

export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>;

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface ReportCategorySummary {
  category: string;
  expense: number;
  income: number;
  net: number;
}

export interface ReportSummary {
  month: number;
  year: number;
  summary: ReportCategorySummary[];
  totalExpense: number;
  totalIncome: number;
}

export interface ReportTrendItem {
  month: number;
  year: number;
  expense: number;
  income: number;
}

export interface ReportTrend {
  year: number;
  trend: ReportTrendItem[];
}

export interface ReportBudgetItem {
  category: string;
  limit: number;
  actual: number;
  remaining: number;
  percentage: number;
}

export interface ReportBudget {
  month: number;
  year: number;
  budget: ReportBudgetItem[];
}

// ---------------------------------------------------------------------------
// Bill Notifications
// ---------------------------------------------------------------------------

export interface BillNotification {
  invoiceId: string;
  creditCardId: string;
  creditCardName: string;
  totalAmount: number;
  paymentDueDate: string;
  daysUntilDue: number;
}

export interface BillNotifications {
  count: number;
  bills: BillNotification[];
}

// ---------------------------------------------------------------------------
// Billing / Subscription
// ---------------------------------------------------------------------------

export interface Subscription {
  planTier: string;
  status: string | null;
  trialDaysRemaining: number | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  provider: string | null;
}

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

// ---------------------------------------------------------------------------
// Response Schemas (Zod) — for runtime validation in the API client
// ---------------------------------------------------------------------------

export const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  role: z.string(),
  preferredCurrency: z.string(),
  onboardingCompleted: z.boolean(),
  billReminderDays: z.number().default(1),
  subscriptionStatus: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const creditCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  billGenerationDate: z.number(),
  paymentDate: z.number(),
  cardLimit: z.number(),
  availableBalance: z.number(),
  currency: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const bankAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  initialBalance: z.number(),
  currentBalance: z.number(),
  currency: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const transactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  date: z.string(),
  category: z.string(),
  type: z.enum(["expense", "income", "transfer"]),
  notes: z.string().nullable(),
  installments: z.number(),
  installmentNumber: z.number().nullable(),
  parentTransactionId: z.string().nullable(),
  creditCardId: z.string().nullable(),
  bankAccountId: z.string().nullable(),
  isRecurring: z.boolean(),
  recurringFrequency: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creditCard: z.object({ name: z.string() }).nullable().optional(),
  bankAccount: z.object({ name: z.string() }).nullable().optional(),
});

export const invoiceSchema = z.object({
  id: z.string(),
  creditCardId: z.string(),
  billStartDate: z.string(),
  billEndDate: z.string(),
  paymentDueDate: z.string(),
  totalAmount: z.number(),
  paidAmount: z.number(),
  creditFromPreviousMonth: z.number(),
  isPaid: z.boolean(),
  paidAt: z.string().nullable(),
  paidFromBankAccountId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creditCard: z.object({ name: z.string(), currency: z.string() }).nullable().optional(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
  type: z.enum(["expense", "income", "both"]),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const spendingLimitSchema = z.object({
  id: z.string(),
  categoryName: z.string(),
  amount: z.number(),
  month: z.number(),
  year: z.number(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const savingsGoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetAmount: z.number(),
  currentAmount: z.number(),
  color: z.string(),
  deadline: z.string().nullable(),
  isCompleted: z.boolean(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const reportSummarySchema = z.object({
  month: z.number(),
  year: z.number(),
  summary: z.array(z.object({
    category: z.string(),
    expense: z.number(),
    income: z.number(),
    net: z.number(),
  })),
  totalExpense: z.number(),
  totalIncome: z.number(),
});

export const reportTrendSchema = z.object({
  year: z.number(),
  trend: z.array(z.object({
    month: z.number(),
    year: z.number(),
    expense: z.number(),
    income: z.number(),
  })),
});

export const reportBudgetSchema = z.object({
  month: z.number(),
  year: z.number(),
  budget: z.array(z.object({
    category: z.string(),
    limit: z.number(),
    actual: z.number(),
    remaining: z.number(),
    percentage: z.number(),
  })),
});

export const billNotificationsSchema = z.object({
  count: z.number(),
  bills: z.array(z.object({
    invoiceId: z.string(),
    creditCardId: z.string(),
    creditCardName: z.string(),
    totalAmount: z.number(),
    paymentDueDate: z.string(),
    daysUntilDue: z.number(),
  })),
});

export const subscriptionSchema = z.object({
  planTier: z.string(),
  status: z.string().nullable(),
  trialDaysRemaining: z.number().nullable(),
  currentPeriodEnd: z.string().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  provider: z.string().nullable(),
});
