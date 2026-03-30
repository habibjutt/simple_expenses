import type {
  User,
  CreditCard,
  BankAccount,
  Transaction,
  Invoice,
  Category,
  CreateCreditCardInput,
  UpdateCreditCardInput,
  CreateBankAccountInput,
  UpdateBankAccountInput,
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  LoginInput,
  SignupInput,
  SpendingLimit,
  CreateSpendingLimitInput,
  SavingsGoal,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  ReportSummary,
  ReportTrend,
  ReportBudget,
  BillNotifications,
  Subscription,
} from "@simple-expenses/types";

import {
  userSchema,
  creditCardSchema,
  bankAccountSchema,
  transactionSchema,
  invoiceSchema,
  categorySchema,
  spendingLimitSchema,
  savingsGoalSchema,
  reportSummarySchema,
  reportTrendSchema,
  reportBudgetSchema,
  billNotificationsSchema,
  subscriptionSchema,
} from "@simple-expenses/types";

import { z } from "zod";

// ---------------------------------------------------------------------------
// Client configuration
// ---------------------------------------------------------------------------

export interface ApiClientConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  onUnauthorized?: () => void;
}

let _config: ApiClientConfig | null = null;

export function configureApiClient(config: ApiClientConfig) {
  _config = config;
}

function getConfig(): ApiClientConfig {
  if (!_config)
    throw new Error(
      "API client not configured. Call configureApiClient() first.",
    );
  return _config;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

interface RequestOptions<T> extends RequestInit {
  schema?: z.ZodType<T>;
}

async function request<T>(
  path: string,
  options: RequestOptions<T> = {},
  skipAuth = false,
): Promise<T> {
  const { schema, ...fetchOptions } = options;
  const config = getConfig();
  const token = skipAuth ? null : await config.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    config.onUnauthorized?.();
    throw new ApiError("Unauthorized", 401);
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = (await response.json()) as Record<string, unknown>;
      message = (body?.error as string) ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(message, response.status);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  const data = await response.json();

  // Runtime validation when a Zod schema is provided
  if (schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      console.warn(
        `[API] Response validation failed for ${path}:`,
        result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", "),
      );
      // Return raw data as fallback — don't crash the app for validation mismatches
      return data as T;
    }
    return result.data;
  }

  return data as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

const loginResponseSchema = z.object({ user: userSchema, token: z.string() });
const signupResponseSchema = z.object({ user: userSchema, token: z.string() });

export interface LoginResponse {
  user: User;
  token: string;
}

export interface SignupResponse {
  user: User;
  token: string;
}

export const auth = {
  async login(input: LoginInput): Promise<LoginResponse> {
    return request<LoginResponse>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify(input),
        schema: loginResponseSchema,
      },
      true,
    );
  },

  async signup(input: SignupInput): Promise<SignupResponse> {
    return request<SignupResponse>(
      "/api/v1/auth/signup",
      {
        method: "POST",
        body: JSON.stringify(input),
        schema: signupResponseSchema,
      },
      true,
    );
  },

  async forgotPassword(email: string): Promise<void> {
    return request<void>(
      "/api/v1/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      true,
    );
  },

  async me(): Promise<User> {
    return request<User>("/api/v1/auth/me", { schema: userSchema });
  },

  async updateProfile(data: { name: string }): Promise<{ name: string }> {
    return request<{ name: string }>("/api/v1/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
      schema: z.object({ name: z.string() }),
    });
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> {
    return request<{ success: boolean }>("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
      schema: z.object({ success: z.boolean() }),
    });
  },

  async updateCurrency(
    currency: string,
  ): Promise<{ preferredCurrency: string }> {
    return request<{ preferredCurrency: string }>("/api/v1/auth/currency", {
      method: "PUT",
      body: JSON.stringify({ currency }),
      schema: z.object({ preferredCurrency: z.string() }),
    });
  },

  async logout(): Promise<void> {
    return request<void>("/api/v1/auth/logout", { method: "POST" });
  },
};

// ---------------------------------------------------------------------------
// Credit Cards
// ---------------------------------------------------------------------------

export const creditCards = {
  async list(): Promise<CreditCard[]> {
    return request<CreditCard[]>("/api/v1/credit-cards", {
      schema: z.array(creditCardSchema),
    });
  },

  async get(id: string): Promise<CreditCard> {
    return request<CreditCard>(`/api/v1/credit-cards/${id}`, {
      schema: creditCardSchema,
    });
  },

  async create(input: CreateCreditCardInput): Promise<CreditCard> {
    return request<CreditCard>("/api/v1/credit-cards", {
      method: "POST",
      body: JSON.stringify(input),
      schema: creditCardSchema,
    });
  },

  async update(id: string, input: UpdateCreditCardInput): Promise<CreditCard> {
    return request<CreditCard>(`/api/v1/credit-cards/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
      schema: creditCardSchema,
    });
  },

  async delete(id: string): Promise<void> {
    return request<void>(`/api/v1/credit-cards/${id}`, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------------------
// Bank Accounts
// ---------------------------------------------------------------------------

export const bankAccounts = {
  async list(): Promise<BankAccount[]> {
    return request<BankAccount[]>("/api/v1/bank-accounts", {
      schema: z.array(bankAccountSchema),
    });
  },

  async get(id: string): Promise<BankAccount> {
    return request<BankAccount>(`/api/v1/bank-accounts/${id}`, {
      schema: bankAccountSchema,
    });
  },

  async create(input: CreateBankAccountInput): Promise<BankAccount> {
    return request<BankAccount>("/api/v1/bank-accounts", {
      method: "POST",
      body: JSON.stringify(input),
      schema: bankAccountSchema,
    });
  },

  async update(
    id: string,
    input: UpdateBankAccountInput,
  ): Promise<BankAccount> {
    return request<BankAccount>(`/api/v1/bank-accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
      schema: bankAccountSchema,
    });
  },

  async delete(id: string): Promise<void> {
    return request<void>(`/api/v1/bank-accounts/${id}`, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export interface TransactionFilters {
  creditCardId?: string;
  bankAccountId?: string;
  month?: number;
  year?: number;
}

export interface TransferInput {
  fromBankAccountId: string;
  toBankAccountId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface TransactionSuggestion {
  name: string;
  category: string | null;
  creditCardId: string | null;
  creditCardName: string | null;
  bankAccountId: string | null;
  bankAccountName: string | null;
}

const transactionSuggestionSchema = z.object({
  name: z.string(),
  category: z.string().nullable(),
  creditCardId: z.string().nullable(),
  creditCardName: z.string().nullable(),
  bankAccountId: z.string().nullable(),
  bankAccountName: z.string().nullable(),
});

export const transactions = {
  async list(filters?: TransactionFilters): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.creditCardId) params.set("creditCardId", filters.creditCardId);
    if (filters?.bankAccountId)
      params.set("bankAccountId", filters.bankAccountId);
    if (filters?.month) params.set("month", String(filters.month));
    if (filters?.year) params.set("year", String(filters.year));
    const qs = params.toString();
    return request<Transaction[]>(`/api/v1/transactions${qs ? `?${qs}` : ""}`, {
      schema: z.array(transactionSchema),
    });
  },

  async create(input: CreateTransactionInput): Promise<Transaction> {
    return request<Transaction>("/api/v1/transactions", {
      method: "POST",
      body: JSON.stringify(input),
      schema: transactionSchema,
    });
  },

  async update(
    id: string,
    input: UpdateTransactionInput,
  ): Promise<Transaction> {
    return request<Transaction>(`/api/v1/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
      schema: transactionSchema,
    });
  },

  async transfer(
    input: TransferInput,
  ): Promise<{ success: boolean; amount: number }> {
    return request<{ success: boolean; amount: number }>(
      "/api/v1/transactions/transfer",
      {
        method: "POST",
        body: JSON.stringify(input),
        schema: z.object({ success: z.boolean(), amount: z.number() }),
      },
    );
  },

  async delete(id: string): Promise<void> {
    return request<void>(`/api/v1/transactions/${id}`, { method: "DELETE" });
  },

  async getSuggestions(query: string): Promise<TransactionSuggestion[]> {
    const qs = new URLSearchParams({ q: query }).toString();
    return request<TransactionSuggestion[]>(
      `/api/v1/transactions/suggestions?${qs}`,
      { schema: z.array(transactionSuggestionSchema) },
    );
  },
};

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export const invoices = {
  async list(creditCardId?: string): Promise<Invoice[]> {
    const qs = creditCardId ? `?creditCardId=${creditCardId}` : "";
    return request<Invoice[]>(`/api/v1/invoices${qs}`, {
      schema: z.array(invoiceSchema),
    });
  },

  async pay(invoiceId: string, bankAccountId: string): Promise<Invoice> {
    return request<Invoice>(`/api/v1/invoices/${invoiceId}/pay`, {
      method: "POST",
      body: JSON.stringify({ bankAccountId }),
      schema: invoiceSchema,
    });
  },

  async unpay(invoiceId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(
      `/api/v1/invoices/${invoiceId}/unpay`,
      {
        method: "POST",
        schema: z.object({ success: z.boolean() }),
      },
    );
  },
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories = {
  async list(type?: string): Promise<Category[]> {
    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    return request<Category[]>(`/api/v1/categories${qs}`, {
      schema: z.array(categorySchema),
    });
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    return request<Category>("/api/v1/categories", {
      method: "POST",
      body: JSON.stringify(input),
      schema: categorySchema,
    });
  },

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    return request<Category>(`/api/v1/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
      schema: categorySchema,
    });
  },

  async delete(id: string): Promise<void> {
    return request<void>(`/api/v1/categories/${id}`, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------------------
// Spending Limits
// ---------------------------------------------------------------------------

export const spendingLimits = {
  async list(month?: number, year?: number): Promise<SpendingLimit[]> {
    const params = new URLSearchParams();
    if (month) params.set("month", String(month));
    if (year) params.set("year", String(year));
    const qs = params.toString();
    return request<SpendingLimit[]>(
      `/api/v1/spending-limits${qs ? `?${qs}` : ""}`,
      {
        schema: z.array(spendingLimitSchema),
      },
    );
  },

  async create(input: CreateSpendingLimitInput): Promise<SpendingLimit> {
    return request<SpendingLimit>("/api/v1/spending-limits", {
      method: "POST",
      body: JSON.stringify(input),
      schema: spendingLimitSchema,
    });
  },

  async delete(id: string): Promise<void> {
    return request<void>(`/api/v1/spending-limits/${id}`, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------------------
// Savings Goals
// ---------------------------------------------------------------------------

export const goals = {
  async list(): Promise<SavingsGoal[]> {
    return request<SavingsGoal[]>("/api/v1/goals", {
      schema: z.array(savingsGoalSchema),
    });
  },

  async get(id: string): Promise<SavingsGoal> {
    return request<SavingsGoal>(`/api/v1/goals/${id}`, {
      schema: savingsGoalSchema,
    });
  },

  async create(input: CreateSavingsGoalInput): Promise<SavingsGoal> {
    return request<SavingsGoal>("/api/v1/goals", {
      method: "POST",
      body: JSON.stringify(input),
      schema: savingsGoalSchema,
    });
  },

  async update(
    id: string,
    input: UpdateSavingsGoalInput,
  ): Promise<SavingsGoal> {
    return request<SavingsGoal>(`/api/v1/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
      schema: savingsGoalSchema,
    });
  },

  async delete(id: string): Promise<void> {
    return request<void>(`/api/v1/goals/${id}`, { method: "DELETE" });
  },

  async contribute(id: string, amount: number): Promise<SavingsGoal> {
    return request<SavingsGoal>(`/api/v1/goals/${id}/contribute`, {
      method: "POST",
      body: JSON.stringify({ amount }),
      schema: savingsGoalSchema,
    });
  },
};

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export const reports = {
  async summary(month?: number, year?: number): Promise<ReportSummary> {
    const params = new URLSearchParams();
    if (month) params.set("month", String(month));
    if (year) params.set("year", String(year));
    const qs = params.toString();
    return request<ReportSummary>(
      `/api/v1/reports/summary${qs ? `?${qs}` : ""}`,
      {
        schema: reportSummarySchema,
      },
    );
  },

  async trend(year?: number): Promise<ReportTrend> {
    const qs = year ? `?year=${year}` : "";
    return request<ReportTrend>(`/api/v1/reports/trend${qs}`, {
      schema: reportTrendSchema,
    });
  },

  async budget(month?: number, year?: number): Promise<ReportBudget> {
    const params = new URLSearchParams();
    if (month) params.set("month", String(month));
    if (year) params.set("year", String(year));
    const qs = params.toString();
    return request<ReportBudget>(
      `/api/v1/reports/budget${qs ? `?${qs}` : ""}`,
      {
        schema: reportBudgetSchema,
      },
    );
  },
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notifications = {
  async bills(): Promise<BillNotifications> {
    return request<BillNotifications>("/api/v1/notifications/bills", {
      schema: billNotificationsSchema,
    });
  },
};

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export const billing = {
  async subscription(): Promise<Subscription> {
    return request<Subscription>("/api/v1/billing/subscription", {
      schema: subscriptionSchema,
    });
  },

  async checkout(priceId: string): Promise<{ url: string }> {
    return request<{ url: string }>("/api/v1/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ priceId }),
      schema: z.object({ url: z.string() }),
    });
  },

  async portal(): Promise<{ url: string }> {
    return request<{ url: string }>("/api/v1/billing/portal", {
      method: "POST",
      schema: z.object({ url: z.string() }),
    });
  },
};
