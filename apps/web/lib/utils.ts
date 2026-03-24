// Re-export shared utilities — keep this file for backward compatibility
// within apps/web. All new code should import from @simple-expenses/utils.
export {
  cn,
  formatCurrency,
  formatDate,
  formatMonthYear,
  formatShortDate,
  toLocalISODate,
  clamp,
  formatPercent,
  CURRENCY_LOCALE_MAP,
} from "@simple-expenses/utils";

export { SUPPORTED_CURRENCIES } from "@simple-expenses/types";
export type { CurrencyCode } from "@simple-expenses/types";

