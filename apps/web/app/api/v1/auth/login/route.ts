import { auth } from "@/lib/auth";
import { api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// POST /api/v1/auth/login
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { email, password } = body as Record<string, unknown>;
  if (!email || !password)
    return api.badRequest("email and password are required");

  try {
    const response = await auth.api.signInEmail({
      body: { email: String(email), password: String(password) },
      asResponse: true,
    });

    // Enrich the response with full user fields from DB
    if (response.ok) {
      const data = await response.json();
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
        status: response.status,
        headers: response.headers,
      });
    }

    return response;
  } catch {
    return api.unauthorized();
  }
}
