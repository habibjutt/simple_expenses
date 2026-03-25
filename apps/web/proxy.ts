import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import {
  rateLimit,
  READ_LIMIT,
  WRITE_LIMIT,
  EXPENSIVE_LIMIT,
} from "@/lib/rate-limit";

const ALLOWED_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization";

// Build the whitelist once at startup from env vars.
// Mobile apps send requests without an Origin header (native fetch),
// so they are implicitly allowed. Only browser-based origins need checking.
const ALLOWED_ORIGINS = new Set(
  [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    process.env.CORS_ALLOWED_ORIGINS?.split(",").map((o) => o.trim()),
  ]
    .flat()
    .filter(Boolean) as string[],
);

function getAllowedOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null; // same-origin or non-browser (mobile) — no CORS header needed
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  return null; // origin not whitelisted
}

/** Must stay in sync with `app/(protected)/` routes (cookie gate before layout runs). */
const protectedRoutes = [
  "/dashboard",
  "/transactions",
  "/manage-cards",
  "/manage-accounts",
  "/credit-card",
  "/bank-account",
  "/invoice",
  "/onboarding",
  "/billing",
  "/settings",
  "/categories",
  "/goals",
  "/spending-limits",
  "/reports",
  "/admin",
];

/** Paths that trigger the stricter "expensive" rate limit. */
const expensivePaths = [
  "/api/v1/transactions/export",
  "/api/v1/reports/export",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS + rate-limiting for API v1 routes
  if (pathname.startsWith("/api/v1")) {
    const allowedOrigin = getAllowedOrigin(request);

    if (request.method === "OPTIONS") {
      // Reject preflight from unknown origins
      if (!allowedOrigin) {
        return new NextResponse(null, { status: 403 });
      }
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": ALLOWED_METHODS,
          "Access-Control-Allow-Headers": ALLOWED_HEADERS,
          "Access-Control-Max-Age": "3600",
        },
      });
    }

    // ── Rate limiting ──────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const isExpensive = expensivePaths.some((p) => pathname.startsWith(p));
    const isWrite = ["POST", "PUT", "DELETE"].includes(request.method);

    const tier = isExpensive
      ? EXPENSIVE_LIMIT
      : isWrite
        ? WRITE_LIMIT
        : READ_LIMIT;

    const key = `${ip}:${isExpensive ? "expensive" : isWrite ? "write" : "read"}`;
    const result = rateLimit(key, tier);

    if (!result.allowed) {
      const rlHeaders: Record<string, string> = {
        "Retry-After": String(result.retryAfterSeconds),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
      };
      if (allowedOrigin)
        rlHeaders["Access-Control-Allow-Origin"] = allowedOrigin;

      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: rlHeaders },
      );
    }

    const response = NextResponse.next();
    if (allowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
      response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
      response.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
    }
    response.headers.set("X-RateLimit-Limit", String(result.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    return response;
  }

  // Fast cookie-based gate: redirect unauthenticated users away from protected
  // routes before the layout even runs. We intentionally do NOT redirect
  // cookie-holders away from /login or /signup because the cookie may be
  // stale/expired — the server layout validates the real session and handles
  // that case. Redirecting based on a possibly-expired cookie was the root
  // cause of ERR_TOO_MANY_REDIRECTS loops.
  const sessionCookie = getSessionCookie(request);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
