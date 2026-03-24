import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

export const CURRENCY_LOCALE_MAP: Record<string, string> = {
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

/**
 * Formats a number as currency using Intl.NumberFormat.
 * @param amount - The amount to format
 * @param currency - ISO 4217 currency code (default: "AED")
 */
export function formatCurrency(amount: number, currency: string = "AED"): string {
  const locale = CURRENCY_LOCALE_MAP[currency] ?? "en-AE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Returns "Jan 2025", "Feb 2025" etc. */
export function formatMonthYear(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Returns "15 Jan 2025" */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

/** Returns "Jan 15" */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Returns an ISO date string "YYYY-MM-DD" in local time */
export function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ---------------------------------------------------------------------------
// Number helpers
// ---------------------------------------------------------------------------

/** Clamps a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Returns a percentage string like "42%" */
export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}
