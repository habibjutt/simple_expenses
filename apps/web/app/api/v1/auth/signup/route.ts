import { auth } from "@/lib/auth";
import { api } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { sanitizeString } from "@/lib/sanitize";

// POST /api/v1/auth/signup
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { email, password, name } = body as Record<string, unknown>;
  if (!email || !password || !name)
    return api.badRequest("email, password, and name are required");

  try {
    // 1. Create the account
    const signupResponse = await auth.api.signUpEmail({
      body: {
        email: String(email),
        password: String(password),
        name: sanitizeString(String(name)),
      },
      asResponse: true,
    });

    if (!signupResponse.ok) return signupResponse;

    // 2. Sign in immediately to obtain a bearer token
    //    (Better Auth only issues tokens on sign-in, not sign-up)
    const signInResponse = await auth.api.signInEmail({
      body: { email: String(email), password: String(password) },
      asResponse: true,
    });

    if (signInResponse.ok) {
      const data = await signInResponse.json();
      if (data?.user?.id) {
        const fullUser = await db.user.findUnique({
          where: { id: data.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            role: true,
            preferredCurrency: true,
            onboardingCompleted: true,
            subscriptionStatus: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        if (fullUser) {
          data.user = fullUser;
        }
      }
      return Response.json(data, {
        status: signInResponse.status,
        headers: signInResponse.headers,
      });
    }

    return signInResponse;
  } catch {
    return api.badRequest("Sign-up failed. Email may already be in use.");
  }
}
