/**
 * Input sanitization utilities to prevent stored XSS.
 *
 * React auto-escapes on render, but raw data can leak through
 * CSV/PDF exports, email templates, or third-party integrations.
 * Defense-in-depth: strip HTML tags before storage.
 */

const HTML_TAG_RE = /<[^>]*>/g;

/** Strip HTML tags and trim whitespace from a string. */
export function sanitizeString(input: string): string {
  return input.replace(HTML_TAG_RE, "").trim();
}

/**
 * Sanitize a value if it's a non-empty string, otherwise pass through.
 * Useful for optional/nullable fields: `sanitizeOptional(notes)`.
 */
export function sanitizeOptional(
  input: unknown
): string | null {
  if (input == null) return null;
  const str = String(input);
  return str ? sanitizeString(str) : null;
}
