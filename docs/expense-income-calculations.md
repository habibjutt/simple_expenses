# Expense & Income Calculations

How the app calculates Expenses and Income totals across pages.

## Transaction Amount Convention

- **Positive amount** (`amount > 0`) = expense
- **Negative amount** (`amount < 0`) = income
- Income is displayed as the absolute value of negative amounts

## Transfer Exclusion

Transfer transactions (between the user's own accounts) are **excluded** from Expense and Income totals. This prevents double-counting — e.g. moving AED 33,000 between accounts is not real spending or earning.

Transfers are identified by `category === "Transfer"`. Every transfer leg is created with both `category: "Transfer"` and `type: "transfer"` (`transaction-action.ts`, `createTransfer`), but filtering throughout the codebase keys on the `category` field, not `type`.

## Per-Page Implementation

### Dashboard (`/dashboard`)

Delegates to `getReportData()` in `app/api/reports-action.ts`. The Prisma query excludes transfers at the database level:

```
NOT: { category: "Transfer" }
```

Then sums by sign: positive → expenses, negative (abs) → income.

### Transactions (`/transactions`)

Computes totals client-side from `filteredTransactions` (already filtered by month, category, name, and account). Before summing, it derives `nonTransferTransactions` by excluding `category === "Transfer"`, then:

- Expenses = sum of `nonTransferTransactions` where `amount > 0`
- Income = abs(sum where `amount < 0`)

The **Count** in the header uses `filteredTransactions.length` (includes transfers) since transfers still appear in the transaction list.

### Reports (`/reports`)

Uses `getReportData()` and `getMonthlyTrend()` from `reports-action.ts`. Both apply `NOT: { category: "Transfer" }` at the query level, same as dashboard.

## Where Transfers Still Appear

- The transaction list on `/transactions` — transfers display with their "Transfer" category badge
- Individual bank account and credit card detail pages — show all transactions for that account
- CSV export — includes all transactions
