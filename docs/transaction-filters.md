# Transaction Filters

The transactions page (`/transactions`) supports client-side filtering. All transactions are fetched once from the server, then filtered in the browser based on the active filters.

## Available Filters

### Search (inline)

A text input in the toolbar. Matches any part of the transaction name (case-insensitive). Results update as you type.

### Category

A combobox in the filter dialog. Lists all unique categories found across the user's transactions. Exact match on the transaction's category field.

Supports URL query param seeding: `/transactions?category=Food` pre-fills the category filter on page load.

### Account Type + Account

A two-step filter in the dialog:

1. **Account Type** — a segmented control with three options:
   - **All** (default) — no account filtering
   - **Credit Card** — only transactions linked to a credit card
   - **Bank Account** — only transactions linked to a bank account

2. **Account** — when a type is selected, a searchable combobox appears listing accounts of that type. Selecting one narrows to that specific account. Leaving it on "All credit cards" / "All bank accounts" filters by type only.

## How Filtering Works

Filters are applied sequentially in `filteredTransactions`:

1. **Month filter** — transactions must match the currently selected month/year (via month navigation)
2. **Category filter** — if set, `transaction.category` must match exactly
3. **Name filter** — if set, `transaction.name` must contain the search string (case-insensitive)
4. **Account filter** — depends on `filterAccountType`:
   - `"credit_card"`: transaction must have a `creditCardId`. If a specific account is selected, it must match.
   - `"bank_account"`: transaction must have a `bankAccountId`. If a specific account is selected, it must match.
   - `"all"` with a specific `filterAccountId`: matches either `creditCardId` or `bankAccountId` (this case only applies programmatically).

Results are sorted by `createdAt` descending.

## UI Indicators

- **Filter badge** on the Filters button shows a count of active filters (category and account each count as 1; name search does not count since it's visible inline)
- **Filter chips** appear in the toolbar for each active filter with an "x" to dismiss
- **Filter summary bar** shows when any filter is active: "{n} transactions found" with a total amount
