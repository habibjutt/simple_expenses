import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/test-utils/seed-user
 *
 * Creates a pre-verified test user, bypassing email verification.
 * Only available in non-production environments.
 *
 * Returns: { email, password }
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = `billing-${Date.now()}@test.local`;
  const password = "Test1234!";

  // auth.api.createUser is the admin plugin endpoint at /admin/create-user.
  // Called without `headers` or `request`, the session check is skipped:
  //   if (!session && (ctx.request || ctx.headers)) throw UNAUTHORIZED
  //   → false (no request/headers) → passes through
  // `data.emailVerified: true` is spread into the user record via `...ctx.body.data`
  // `accountId` is set to `user.id` by the admin plugin (confirmed from source).
  await auth.api.createUser({
    body: {
      email,
      password,
      name: "Billing Tester",
      data: { emailVerified: true },
    },
  });

  return NextResponse.json({ email, password });
}
