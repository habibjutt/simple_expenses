import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const ALLOWED_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization";

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

/** Logged-in users are redirected away from these (sign-in / recovery entry points). */
const guestOnlyRoutes = ["/login", "/signup", "/forgot-password"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS handling for API v1 routes
  if (pathname.startsWith("/api/v1")) {
    const origin = request.headers.get("origin") ?? "*";

    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": ALLOWED_METHODS,
          "Access-Control-Allow-Headers": ALLOWED_HEADERS,
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
    response.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
    return response;
  }

  // Auth route protection
  const sessionCookie = getSessionCookie(request);
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isGuestOnlyRoute = guestOnlyRoutes.includes(pathname);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie) {
    if (isGuestOnlyRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Reset page: allow when following email link with token; otherwise send to app
    if (pathname === "/reset-password" && !request.nextUrl.searchParams.get("token")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
