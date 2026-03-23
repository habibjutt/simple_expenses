import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/test-utils/seed-user
 *
 * Creates a pre-verified test user and signs in via Better Auth's internal API
 * (bypasses the IP-based rate limiter — internal calls use a null/undefined IP
 * key, which is always a fresh bucket).
 *
 * The response forwards Better Auth's Set-Cookie headers so that Playwright's
 * page.request automatically propagates them into the browser's cookie jar —
 * no manual addCookies() needed in tests.
 *
 * Only available in non-production environments.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = `billing-${Date.now()}@test.local`;
  const password = "Test1234!";

  // Create user via Better Auth's admin API.
  const created = await auth.api.createUser({
    body: { email, password, name: "Billing Tester" },
  });

  // Force emailVerified=true so signInEmail passes the requireEmailVerification
  // check (createUser sets it to false by default).
  await db.user.update({
    where: { id: created.user.id },
    data: { emailVerified: true },
  });

  // Sign in programmatically — internal calls bypass IP-based rate limiting.
  // asResponse:true gives the full HTTP Response including Set-Cookie headers.
  const signInRes = await auth.api.signInEmail({
    body: { email, password },
    asResponse: true,
  });

  if (!signInRes.ok) {
    const body = await signInRes.text();
    return NextResponse.json(
      { error: `signInEmail failed: ${signInRes.status} – ${body}` },
      { status: 500 },
    );
  }

  // Forward the session cookie(s) to the caller.
  // Playwright's page.request.post() stores Set-Cookie responses in the
  // browser context's cookie jar automatically.
  const responseHeaders = new Headers({ "content-type": "application/json" });
  const cookies =
    typeof signInRes.headers.getSetCookie === "function"
      ? signInRes.headers.getSetCookie()
      : [signInRes.headers.get("set-cookie") ?? ""].filter(Boolean);
  for (const cookie of cookies) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new Response(JSON.stringify({ email, password }), {
    headers: responseHeaders,
  });
}
