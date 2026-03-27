import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/auth/me
export async function GET(request: Request) {
  const sessionUser = await getApiUser(request);
  if (!sessionUser) return api.unauthorized();

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
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

  if (!user) return api.unauthorized();
  return api.ok(user);
}
