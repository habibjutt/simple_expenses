/**
 * SEO constants and helpers.
 * NEXT_PUBLIC_BETTER_AUTH_URL doubles as the canonical site origin —
 * set it to your production URL (e.g. https://simple-expenses.com) in .env.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "https://simple-expenses.com";

export const SITE_NAME = "Simple Expenses";

export const SITE_DESCRIPTION =
  "Track credit cards, manage bank accounts, monitor invoices, and stay on top of every dirham you spend. Built for UAE residents.";

/** Shared base keywords that apply to every page. */
export const BASE_KEYWORDS = [
  "expense tracker",
  "UAE finance app",
  "personal finance UAE",
  "AED expense tracking",
  "Simple Expenses",
];
