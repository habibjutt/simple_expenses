import { getApiUser, api } from "@/lib/api-auth";
import { sanitizeString } from "@/lib/sanitize";
import { auth } from "@/lib/auth";

// PUT /api/v1/auth/profile — update user name
export async function PUT(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { name } = body as Record<string, unknown>;
  if (!name || typeof name !== "string" || name.trim().length === 0)
    return api.badRequest("name is required");

  const sanitizedName = sanitizeString(String(name));
  if (sanitizedName.length > 100)
    return api.badRequest("name must be 100 characters or less");

  // Use Better Auth's updateUser API
  await auth.api.updateUser({
    body: { name: sanitizedName },
    headers: request.headers,
  });

  return api.ok({ name: sanitizedName });
}
