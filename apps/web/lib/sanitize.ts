/**
 * Input sanitization utilities to prevent stored XSS.
 *
 * React auto-escapes on render, but raw data can leak through
 * CSV/PDF exports, email templates, or third-party integrations.
 * Defense-in-depth: strip HTML tags before storage.
 */

import { sanitize } from "isomorphic-dompurify";

const HTML_TAG_RE = /<[^>]*>/g;

/** Strip HTML tags and trim whitespace from a string. */
export function sanitizeString(input: string): string {
  return input.replace(HTML_TAG_RE, "").trim();
}

/**
 * Sanitize a value if it's a non-empty string, otherwise pass through.
 * Useful for optional/nullable fields: `sanitizeOptional(notes)`.
 */
export function sanitizeOptional(input: unknown): string | null {
  if (input == null) return null;
  const str = String(input);
  return str ? sanitizeString(str) : null;
}

const BLOG_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "u",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "a",
  "img",
];
const BLOG_ALLOWED_ATTR = ["href", "src", "alt", "target", "rel"];

/**
 * Sanitize Tiptap-generated HTML before it's stored. Rendering blog content
 * later with dangerouslySetInnerHTML is only safe because this strips
 * scripts/event handlers and restricts tags/attrs to a known allowlist.
 */
export function sanitizeBlogHtml(html: string): string {
  return sanitize(html, {
    ALLOWED_TAGS: BLOG_ALLOWED_TAGS,
    ALLOWED_ATTR: BLOG_ALLOWED_ATTR,
  });
}
