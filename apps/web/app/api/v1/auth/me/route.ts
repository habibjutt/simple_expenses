import { getApiUser, api } from "@/lib/api-auth";

// GET /api/v1/auth/me
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();
  return api.ok(user);
}
