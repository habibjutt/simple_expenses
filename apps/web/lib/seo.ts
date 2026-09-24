/**
 * SEO constants and helpers.
 * NEXT_PUBLIC_BETTER_AUTH_URL doubles as the canonical site origin —
 * set it to your production URL (e.g. https://fixpenses.com) in .env.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "https://fixpenses.com";

export const SITE_NAME = "Fixpenses";

export const SITE_DESCRIPTION =
  "Track credit cards, manage bank accounts, monitor invoices, and stay on top of every dirham you spend. Built for UAE residents.";

/** Shared base keywords that apply to every page. */
export const BASE_KEYWORDS = [
  "expense tracker",
  "UAE finance app",
  "personal finance UAE",
  "AED expense tracking",
  "Fixpenses",
];

/**
 * Default social share image. Pages that set their own `openGraph`/`twitter`
 * metadata replace the parent's, so each must list it explicitly.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/og-default.png",
  width: 1200,
  height: 630,
  alt: "Fixpenses: expense tracker for UAE residents",
};

/** Who runs Fixpenses; shown on /about and the footer, and used in schema. */
export const FOUNDER = {
  name: "Habib Abdul Qadoos",
  role: "Founder",
  linkedin: "https://www.linkedin.com/in/habibq/",
};
export const OPERATOR_NAME = "Devtrone FZE LLC";
export const COMPANY_LINKEDIN = "https://www.linkedin.com/company/fixpenses";
