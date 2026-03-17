import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_LOCALE_MAP: Record<string, string> = {
  AED: "en-AE",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  SAR: "ar-SA",
  KWD: "ar-KW",
  BHD: "ar-BH",
  OMR: "ar-OM",
  QAR: "ar-QA",
  INR: "en-IN",
  PKR: "ur-PK",
  EGP: "ar-EG",
  CAD: "en-CA",
  AUD: "en-AU",
  JPY: "ja-JP",
  CHF: "de-CH",
  CNY: "zh-CN",
  SGD: "en-SG",
};

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

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - ISO 4217 currency code (default: "AED")
 * @returns Formatted currency string (e.g., "AED 1,234.56")
 */
export function formatCurrency(amount: number, currency: string = "AED"): string {
  const locale = CURRENCY_LOCALE_MAP[currency] ?? "en-AE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
