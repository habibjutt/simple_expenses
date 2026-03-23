import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

/**
 * Maps each auth sub-path to the matching rate-limit window (seconds).
 * Keep in sync with the customRules in lib/auth.ts.
 */
const RATE_LIMIT_WINDOWS: Record<string, number> = {
  "sign-in": 900, // 15 min
  "sign-up": 3600, // 1 hour
  "forget-password": 3600,
  "reset-password": 3600,
  "send-verification-email": 3600,
};

export const GET = handlers.GET;

/**
 * Wraps Better Auth's POST handler so that every 429 response includes
 * a Retry-After header, as required by RFC 6585.
 */
export async function POST(request: Request): Promise<Response> {
  const response = await handlers.POST(request);

  if (response.status !== 429) return response;

  const subpath = new URL(request.url).pathname.replace(/^\/api\/auth\//, "");
  const matchedKey = Object.keys(RATE_LIMIT_WINDOWS).find((key) =>
    subpath.startsWith(key)
  );
  const retryAfter = matchedKey ? RATE_LIMIT_WINDOWS[matchedKey] : 60;

  const headers = new Headers(response.headers);
  headers.set("Retry-After", String(retryAfter));

  return new Response(response.body, {
    status: 429,
    statusText: "Too Many Requests",
    headers,
  });
}
