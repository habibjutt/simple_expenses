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
  if (!_config) throw new Error("API client not configured. Call configureApiClient() first.");
  return _config;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<T> {
  const config = getConfig();
  const token = skipAuth ? null : await config.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    config.onUnauthorized?.();
    throw new ApiError("Unauthorized", 401);
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = await response.json();
      message = body?.error ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(message, response.status);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

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
    return request<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }, true);
  },

  async signup(input: SignupInput): Promise<SignupResponse> {
    return request<SignupResponse>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
    }, true);
  },

  async forgotPassword(email: string): Promise<void> {
    return request<void>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }, true);
  },

  async me(): Promise<User> {
    return request<User>("/api/v1/auth/me");
  },

  async updateProfile(data: { name: string }): Promise<{ name: string }> {
    return request<{ name: string }>("/api/v1/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean }> {
    return request<{ success: boolean }>("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCurrency(currency: string): Promise<{ preferredCurrency: string }> {
    return request<{ preferredCurrency: string }>("/api/v1/auth/currency", {
      method: "PUT",
      body: JSON.stringify({ currency }),
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
    return request<CreditCard[]>("/api/v1/credit-cards");
  },

  async get(id: string): Promise<CreditCard> {
    return request<CreditCard>(`/api/v1/credit-cards/${id}`);
  },

  async create(input: CreateCreditCardInput): Promise<CreditCard> {
    return request<CreditCard>("/api/v1/credit-cards", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, input: UpdateCreditCardInput): Promise<CreditCard> {
    return request<CreditCard>(`/api/v1/credit-cards/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
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
    return request<BankAccount[]>("/api/v1/bank-accounts");
  },

  async get(id: string): Promise<BankAccount> {
    return request<BankAccount>(`/api/v1/bank-accounts/${id}`);
  },

  async create(input: CreateBankAccountInput): Promise<BankAccount> {
    return request<BankAccount>("/api/v1/bank-accounts", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, input: UpdateBankAccountInput): Promise<BankAccount> {
    return request<BankAccount>(`/api/v1/bank-accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
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

export const transactions = {
  async list(filters?: TransactionFilters): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.creditCardId) params.set("creditCardId", filters.creditCardId);
    if (filters?.bankAccountId) params.set("bankAccountId", filters.bankAccountId);
    if (filters?.month) params.set("month", String(filters.month));
    if (filters?.year) params.set("year", String(filters.year));
    const qs = params.toString();
    return request<Transaction[]>(`/api/v1/transactions${qs ? `?${qs}` : ""}`);
  },

  async create(input: CreateTransactionInput): Promise<Transaction> {
    return request<Transaction>("/api/v1/transactions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    return request<Transaction>(`/api/v1/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async transfer(input: TransferInput): Promise<{ success: boolean; amount: number }> {
    return request<{ success: boolean; amount: number }>("/api/v1/transactions/transfer", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async delete(id: string): Promise<void> {
    return request<void>(`/api/v1/transactions/${id}`, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export const invoices = {
  async list(creditCardId?: string): Promise<Invoice[]> {
    const qs = creditCardId ? `?creditCardId=${creditCardId}` : "";
    return request<Invoice[]>(`/api/v1/invoices${qs}`);
  },

  async pay(invoiceId: string, bankAccountId: string): Promise<Invoice> {
    return request<Invoice>(`/api/v1/invoices/${invoiceId}/pay`, {
      method: "POST",
      body: JSON.stringify({ bankAccountId }),
    });
  },

  async unpay(invoiceId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/v1/invoices/${invoiceId}/unpay`, {
      method: "POST",
    });
  },
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories = {
  async list(type?: string): Promise<Category[]> {
    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    return request<Category[]>(`/api/v1/categories${qs}`);
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    return request<Category>("/api/v1/categories", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    return request<Category>(`/api/v1/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
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
    return request<SpendingLimit[]>(`/api/v1/spending-limits${qs ? `?${qs}` : ""}`);
  },

  async create(input: CreateSpendingLimitInput): Promise<SpendingLimit> {
    return request<SpendingLimit>("/api/v1/spending-limits", {
      method: "POST",
      body: JSON.stringify(input),
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
    return request<SavingsGoal[]>("/api/v1/goals");
  },

  async get(id: string): Promise<SavingsGoal> {
    return request<SavingsGoal>(`/api/v1/goals/${id}`);
  },

  async create(input: CreateSavingsGoalInput): Promise<SavingsGoal> {
    return request<SavingsGoal>("/api/v1/goals", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, input: UpdateSavingsGoalInput): Promise<SavingsGoal> {
    return request<SavingsGoal>(`/api/v1/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async delete(id: string): Promise<void> {
    return request<void>(`/api/v1/goals/${id}`, { method: "DELETE" });
  },

  async contribute(id: string, amount: number): Promise<SavingsGoal> {
    return request<SavingsGoal>(`/api/v1/goals/${id}/contribute`, {
      method: "POST",
      body: JSON.stringify({ amount }),
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
    return request<ReportSummary>(`/api/v1/reports/summary${qs ? `?${qs}` : ""}`);
  },

  async trend(year?: number): Promise<ReportTrend> {
    const qs = year ? `?year=${year}` : "";
    return request<ReportTrend>(`/api/v1/reports/trend${qs}`);
  },

  async budget(month?: number, year?: number): Promise<ReportBudget> {
    const params = new URLSearchParams();
    if (month) params.set("month", String(month));
    if (year) params.set("year", String(year));
    const qs = params.toString();
    return request<ReportBudget>(`/api/v1/reports/budget${qs ? `?${qs}` : ""}`);
  },
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notifications = {
  async bills(): Promise<BillNotifications> {
    return request<BillNotifications>("/api/v1/notifications/bills");
  },
};

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export const billing = {
  async subscription(): Promise<Subscription> {
    return request<Subscription>("/api/v1/billing/subscription");
  },

  async checkout(priceId: string): Promise<{ url: string }> {
    return request<{ url: string }>("/api/v1/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ priceId }),
    });
  },

  async portal(): Promise<{ url: string }> {
    return request<{ url: string }>("/api/v1/billing/portal", {
      method: "POST",
    });
  },
};
