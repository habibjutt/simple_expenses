# Currency Configuration

## Overview
This application uses **AED (United Arab Emirates Dirham)** as the base currency for all financial transactions and displays.

## Currency Formatting

### Utility Function
All currency formatting in this application is handled by a centralized utility function located in `/lib/utils.ts`:

```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
  }).format(amount);
}
```

### Usage
To format currency values, import and use the `formatCurrency` function:

```typescript
import { formatCurrency } from "@/lib/utils";

// Example usage
const amount = 1234.56;
const formatted = formatCurrency(amount); // Returns "AED 1,234.56"
```

### Display Format
- **Currency Code**: AED
- **Locale**: en-AE (English - United Arab Emirates)
- **Format**: `AED 1,234.56`
  - Currency symbol/code is displayed before the amount
  - Thousands separator: comma (,)
  - Decimal separator: period (.)
  - Decimal places: 2

## Implementation Locations

The `formatCurrency` function is imported and used in the following files:

1. **Main Dashboard** - `/app/page.tsx`
   - Credit card balance displays
   - Bank account balance displays
   - Transaction amount displays

2. **Bank Account Details** - `/app/bank-account/[id]/page.tsx`
   - Current balance
   - Monthly spent amount
   - Individual transaction amounts
   - Total spent summary

3. **Credit Card Details** - `/app/credit-card/[id]/page.tsx`
   - Card limit
   - Available balance
   - Used amount
   - Invoice total
   - Transaction amounts
   - Payment modal displays

## Changing Currency

If you need to change the currency in the future:

1. Open `/lib/utils.ts`
2. Modify the `formatCurrency` function:
   - Change `currency` parameter to your desired currency code (e.g., "USD", "EUR", "GBP")
   - Update `locale` to match the currency region (e.g., "en-US", "en-GB", "fr-FR")

Example for USD:
```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
```

## Best Practices

1. **Always use the utility function** - Never create local formatting functions
2. **Import from utils** - Import `formatCurrency` from `@/lib/utils`
3. **Consistent formatting** - All currency displays should use this single function
4. **No hardcoded symbols** - Avoid hardcoding "$" or "AED" in templates; let the formatter handle it

## Database Considerations

- All monetary values in the database are stored as `Float` (decimal numbers)
- No currency information is stored in the database
- Currency formatting is applied only at the presentation layer
- This allows easy currency switching without database migrations

## Related Models

Currency values are used in the following database models:

- **credit_card**: `cardLimit`, `availableBalance`
- **bank_account**: `initialBalance`, `currentBalance`
- **transaction**: `amount`
- **invoice**: `totalAmount`

All these fields store raw numeric values and rely on the `formatCurrency` function for display.
