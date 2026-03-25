import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Simple Expenses API",
    description:
      "REST API for the Simple Expenses app. Authenticate via `POST /api/auth/sign-in/email` and use the returned `token` as a Bearer token in the `Authorization` header.",
    version: "1.0.0",
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "Session token from Better Auth sign-in response",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
      CreditCard: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          billGenerationDate: { type: "integer" },
          paymentDate: { type: "integer" },
          cardLimit: { type: "number" },
          availableBalance: { type: "number" },
          userId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      BankAccount: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          initialBalance: { type: "number" },
          currentBalance: { type: "number" },
          userId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          amount: { type: "number", description: "Positive = expense, negative = income/cashback" },
          date: { type: "string", format: "date-time" },
          category: { type: "string" },
          notes: { type: "string", nullable: true },
          installments: { type: "integer" },
          installmentNumber: { type: "integer", nullable: true },
          creditCardId: { type: "string", nullable: true },
          bankAccountId: { type: "string", nullable: true },
        },
      },
      Invoice: {
        type: "object",
        properties: {
          id: { type: "string" },
          creditCardId: { type: "string" },
          billStartDate: { type: "string", format: "date-time" },
          billEndDate: { type: "string", format: "date-time" },
          paymentDueDate: { type: "string", format: "date-time" },
          totalAmount: { type: "number" },
          isPaid: { type: "boolean" },
          paidAt: { type: "string", format: "date-time", nullable: true },
          paidAmount: { type: "number", nullable: true },
          bankAccountId: { type: "string", nullable: true },
          creditFromPreviousMonth: { type: "number" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          color: { type: "string" },
          icon: { type: "string" },
          type: { type: "string", enum: ["expense", "income", "both"] },
        },
      },
      SpendingLimit: {
        type: "object",
        properties: {
          id: { type: "string" },
          categoryName: { type: "string" },
          amount: { type: "number" },
          month: { type: "integer" },
          year: { type: "integer" },
        },
      },
      SavingsGoal: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          targetAmount: { type: "number" },
          currentAmount: { type: "number" },
          color: { type: "string" },
          deadline: { type: "string", format: "date-time", nullable: true },
          isCompleted: { type: "boolean" },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Sign in with email and password",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Signed in. The `token` field is your Bearer token for subsequent requests.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string", description: "Bearer token — include as `Authorization: Bearer <token>`" },
                    user: { type: "object", properties: { id: { type: "string" }, email: { type: "string" }, name: { type: "string" } } },
                  },
                },
              },
            },
          },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create a new account",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Account created. Returns user and token same as login." },
          "400": { description: "Validation error or email already in use" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Sign out (invalidates the current session)",
        responses: {
          "200": { description: "Signed out" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        responses: {
          "200": {
            description: "Current user",
            content: {
              "application/json": {
                schema: { type: "object", properties: { id: { type: "string" }, email: { type: "string" }, name: { type: "string" } } },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/credit-cards": {
      get: {
        tags: ["Credit Cards"],
        summary: "List credit cards",
        responses: {
          "200": {
            description: "List of credit cards",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/CreditCard" } } } },
          },
        },
      },
      post: {
        tags: ["Credit Cards"],
        summary: "Create a credit card",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "billGenerationDate", "paymentDate", "cardLimit"],
                properties: {
                  name: { type: "string" },
                  billGenerationDate: { type: "integer", minimum: 1, maximum: 31 },
                  paymentDate: { type: "integer", minimum: 1, maximum: 31 },
                  cardLimit: { type: "number" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created credit card", content: { "application/json": { schema: { $ref: "#/components/schemas/CreditCard" } } } } },
      },
    },
    "/credit-cards/{id}": {
      get: { tags: ["Credit Cards"], summary: "Get credit card with recent transactions", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Credit card detail" } } },
      put: { tags: ["Credit Cards"], summary: "Update credit card", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, billGenerationDate: { type: "integer" }, paymentDate: { type: "integer" }, cardLimit: { type: "number" } } } } } }, responses: { "200": { description: "Updated" } } },
      delete: { tags: ["Credit Cards"], summary: "Delete credit card", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "204": { description: "Deleted" } } },
    },
    "/credit-cards/{id}/invoice": {
      get: { tags: ["Credit Cards"], summary: "Get upcoming invoice for a card", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Invoice data with transactions" } } },
    },
    "/credit-cards/{id}/pay-invoice": {
      post: {
        tags: ["Credit Cards"],
        summary: "Pay an invoice",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["bankAccountId", "billStartDate", "billEndDate", "paymentDueDate", "totalAmount"],
                properties: {
                  bankAccountId: { type: "string" },
                  billStartDate: { type: "string", format: "date" },
                  billEndDate: { type: "string", format: "date" },
                  paymentDueDate: { type: "string", format: "date" },
                  totalAmount: { type: "number" },
                  paidAmount: { type: "number", description: "Defaults to totalAmount if omitted" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Payment recorded" } },
      },
    },
    "/bank-accounts": {
      get: { tags: ["Bank Accounts"], summary: "List bank accounts", responses: { "200": { description: "List", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/BankAccount" } } } } } } },
      post: { tags: ["Bank Accounts"], summary: "Create bank account", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "initialBalance"], properties: { name: { type: "string" }, initialBalance: { type: "number" } } } } } }, responses: { "201": { description: "Created" } } },
    },
    "/bank-accounts/{id}": {
      get: { tags: ["Bank Accounts"], summary: "Get account with transactions", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Account detail" } } },
      put: { tags: ["Bank Accounts"], summary: "Update account", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, initialBalance: { type: "number" } } } } } }, responses: { "200": { description: "Updated" } } },
      delete: { tags: ["Bank Accounts"], summary: "Delete account", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "204": { description: "Deleted" } } },
    },
    "/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "List transactions",
        parameters: [
          { name: "creditCardId", in: "query", schema: { type: "string" } },
          { name: "bankAccountId", in: "query", schema: { type: "string" } },
          { name: "cardId", in: "query", description: "Alias for creditCardId", schema: { type: "string" } },
          { name: "accountId", in: "query", description: "Alias for bankAccountId", schema: { type: "string" } },
          { name: "month", in: "query", schema: { type: "integer" } },
          { name: "year", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "List", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Transaction" } } } } } },
      },
      post: {
        tags: ["Transactions"],
        summary: "Create transaction",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "amount", "date", "category"],
                properties: {
                  name: { type: "string" },
                  amount: { type: "number", description: "Positive = expense, negative = income/cashback" },
                  date: { type: "string", format: "date" },
                  category: { type: "string" },
                  notes: { type: "string" },
                  creditCardId: { type: "string" },
                  bankAccountId: { type: "string" },
                  installments: { type: "integer", minimum: 1, default: 1 },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/transactions/export": {
      get: {
        tags: ["Transactions"],
        summary: "Export transactions as CSV",
        parameters: [
          { name: "month", in: "query", schema: { type: "integer" } },
          { name: "year", in: "query", schema: { type: "integer" } },
          { name: "creditCardId", in: "query", schema: { type: "string" } },
          { name: "bankAccountId", in: "query", schema: { type: "string" } },
          { name: "cardId", in: "query", description: "Alias for creditCardId", schema: { type: "string" } },
          { name: "accountId", in: "query", description: "Alias for bankAccountId", schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "CSV file", content: { "text/csv": { schema: { type: "string", format: "binary" } } } },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/transactions/transfer": {
      post: {
        tags: ["Transactions"],
        summary: "Transfer between bank accounts",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fromBankAccountId", "toBankAccountId", "amount", "date"],
                properties: {
                  fromBankAccountId: { type: "string" },
                  toBankAccountId: { type: "string" },
                  amount: { type: "number" },
                  date: { type: "string", format: "date" },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Transfer complete" } },
      },
    },
    "/transactions/{id}": {
      put: { tags: ["Transactions"], summary: "Update transaction", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, amount: { type: "number" }, date: { type: "string" }, category: { type: "string" }, notes: { type: "string" } } } } } }, responses: { "200": { description: "Updated" } } },
      delete: { tags: ["Transactions"], summary: "Delete transaction", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "204": { description: "Deleted" } } },
    },
    "/invoices/current": {
      get: { tags: ["Invoices"], summary: "Get current month invoices", responses: { "200": { description: "List of invoices" } } },
    },
    "/invoices/{id}": {
      get: { tags: ["Invoices"], summary: "Get invoice detail", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Invoice" } } },
      put: { tags: ["Invoices"], summary: "Update invoice", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { billStartDate: { type: "string" }, billEndDate: { type: "string" }, paymentDueDate: { type: "string" }, totalAmount: { type: "number" } } } } } }, responses: { "200": { description: "Updated" } } },
      delete: { tags: ["Invoices"], summary: "Delete invoice (reverses payment)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "204": { description: "Deleted" } } },
    },
    "/invoices/{id}/unpay": {
      post: { tags: ["Invoices"], summary: "Mark invoice as unpaid (reverses payment)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Unpaid" } } },
    },
    "/categories": {
      get: { tags: ["Categories"], summary: "List categories", parameters: [{ name: "type", in: "query", schema: { type: "string", enum: ["expense", "income", "both"] } }], responses: { "200": { description: "List" } } },
      post: { tags: ["Categories"], summary: "Create category", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "color", "icon", "type"], properties: { name: { type: "string" }, color: { type: "string" }, icon: { type: "string" }, type: { type: "string", enum: ["expense", "income", "both"] } } } } } }, responses: { "201": { description: "Created" } } },
    },
    "/categories/seed": {
      post: { tags: ["Categories"], summary: "Seed default categories (only works if no categories exist)", responses: { "201": { description: "Seeded" } } },
    },
    "/categories/{id}": {
      put: { tags: ["Categories"], summary: "Update category", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, color: { type: "string" }, icon: { type: "string" }, type: { type: "string" } } } } } }, responses: { "200": { description: "Updated" } } },
      delete: { tags: ["Categories"], summary: "Delete category", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "204": { description: "Deleted" } } },
    },
    "/spending-limits": {
      get: { tags: ["Spending Limits"], summary: "List spending limits", parameters: [{ name: "month", in: "query", required: true, schema: { type: "integer" } }, { name: "year", in: "query", required: true, schema: { type: "integer" } }], responses: { "200": { description: "List" } } },
      post: { tags: ["Spending Limits"], summary: "Create or update spending limit", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["categoryName", "amount", "month", "year"], properties: { categoryName: { type: "string" }, amount: { type: "number" }, month: { type: "integer" }, year: { type: "integer" } } } } } }, responses: { "200": { description: "Upserted" } } },
    },
    "/spending-limits/{id}": {
      delete: { tags: ["Spending Limits"], summary: "Delete spending limit", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "204": { description: "Deleted" } } },
    },
    "/goals": {
      get: { tags: ["Savings Goals"], summary: "List savings goals", responses: { "200": { description: "List" } } },
      post: { tags: ["Savings Goals"], summary: "Create savings goal", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "targetAmount", "color"], properties: { name: { type: "string" }, targetAmount: { type: "number" }, color: { type: "string" }, deadline: { type: "string", format: "date" } } } } } }, responses: { "201": { description: "Created" } } },
    },
    "/goals/{id}": {
      get: { tags: ["Savings Goals"], summary: "Get savings goal", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Goal" } } },
      put: { tags: ["Savings Goals"], summary: "Update savings goal", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, targetAmount: { type: "number" }, color: { type: "string" }, deadline: { type: "string" }, isCompleted: { type: "boolean" } } } } } }, responses: { "200": { description: "Updated" } } },
      delete: { tags: ["Savings Goals"], summary: "Delete savings goal", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "204": { description: "Deleted" } } },
    },
    "/goals/{id}/contribute": {
      post: { tags: ["Savings Goals"], summary: "Add contribution to goal", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["amount"], properties: { amount: { type: "number" } } } } } }, responses: { "200": { description: "Updated goal" } } },
    },
    "/reports/summary": {
      get: { tags: ["Reports"], summary: "Expense/income summary by category", parameters: [{ name: "month", in: "query", schema: { type: "integer" } }, { name: "year", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "Summary data" } } },
    },
    "/reports/trend": {
      get: { tags: ["Reports"], summary: "Monthly income/expense trend", parameters: [{ name: "year", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "Monthly trend data" } } },
    },
    "/reports/budget": {
      get: { tags: ["Reports"], summary: "Budget vs actual spending", parameters: [{ name: "month", in: "query", schema: { type: "integer" } }, { name: "year", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "Budget data" } } },
    },
    "/reports/export": {
      get: {
        tags: ["Reports"],
        summary: "Export report data as CSV",
        parameters: [
          { name: "tab", in: "query", required: true, schema: { type: "string", enum: ["categories", "trend", "budget"] } },
          { name: "month", in: "query", schema: { type: "integer", description: "Required for categories and budget" } },
          { name: "year", in: "query", schema: { type: "integer", description: "Required for all tabs" } },
        ],
        responses: {
          "200": { description: "CSV file", content: { "text/csv": { schema: { type: "string", format: "binary" } } } },
          "400": { description: "Bad request" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/notifications/bills": {
      get: { tags: ["Notifications"], summary: "Upcoming bills (due within 7 days)", responses: { "200": { description: "Upcoming invoices" } } },
    },
    "/billing/subscription": {
      get: { tags: ["Billing"], summary: "Get current subscription status", responses: { "200": { description: "Subscription info" } } },
    },
    "/billing/checkout": {
      post: { tags: ["Billing"], summary: "Create Stripe checkout session", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["priceId"], properties: { priceId: { type: "string", description: "Stripe price ID (monthly or yearly)" } } } } } }, responses: { "200": { description: "Checkout URL", content: { "application/json": { schema: { type: "object", properties: { url: { type: "string" } } } } } } } },
    },
    "/billing/portal": {
      post: { tags: ["Billing"], summary: "Create Stripe billing portal session", responses: { "200": { description: "Portal URL", content: { "application/json": { schema: { type: "object", properties: { url: { type: "string" } } } } } } } },
    },
  },
};

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(spec, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
