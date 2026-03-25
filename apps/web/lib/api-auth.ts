import { auth } from "@/lib/auth";

export async function getApiUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

const MAX_FUTURE_YEARS = 1;

/**
 * Parse and validate a date string.
 * Returns the Date on success, or a string error message on failure.
 */
export function parseTransactionDate(raw: unknown): Date | string {
  const parsed = new Date(String(raw));
  if (isNaN(parsed.getTime())) {
    return "Invalid date format";
  }

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + MAX_FUTURE_YEARS);
  if (parsed > maxDate) {
    return `Date cannot be more than ${MAX_FUTURE_YEARS} year in the future`;
  }

  return parsed;
}

export const api = {
  unauthorized: () => Response.json({ error: "Unauthorized" }, { status: 401 }),
  notFound: (message = "Not found") =>
    Response.json({ error: message }, { status: 404 }),
  badRequest: (message: string) =>
    Response.json({ error: message }, { status: 400 }),
  ok: (data: unknown) => Response.json(data),
  created: (data: unknown) => Response.json(data, { status: 201 }),
  noContent: () => new Response(null, { status: 204 }),
  internalError: (message = "Internal server error") =>
    Response.json({ error: message }, { status: 500 }),
};
