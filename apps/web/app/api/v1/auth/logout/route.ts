import { auth } from "@/lib/auth";
import { getApiUser, api } from "@/lib/api-auth";

// POST /api/v1/auth/logout
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  await auth.api.signOut({ headers: request.headers });
  return api.ok({ success: true });
}
