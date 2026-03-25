import type {
  User,
  CreditCard,
  BankAccount,
  Transaction,
  Invoice,
  Category,
  CreateCreditCardInput,
  CreateBankAccountInput,
  CreateTransactionInput,
  LoginInput,
  SignupInput,
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
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories = {
  async list(type?: string): Promise<Category[]> {
    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    return request<Category[]>(`/api/v1/categories${qs}`);
  },
};
