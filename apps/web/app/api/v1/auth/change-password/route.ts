import { getApiUser, api } from "@/lib/api-auth";
import { auth } from "@/lib/auth";

// POST /api/v1/auth/change-password
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { currentPassword, newPassword } = body as Record<string, unknown>;
  if (!currentPassword || !newPassword)
    return api.badRequest("currentPassword and newPassword are required");

  if (typeof newPassword !== "string" || newPassword.length < 8)
    return api.badRequest("New password must be at least 8 characters");

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: String(currentPassword),
        newPassword: String(newPassword),
        revokeOtherSessions: false,
      },
      headers: request.headers,
    });
    return api.ok({ success: true });
  } catch {
    return api.badRequest("Current password is incorrect");
  }
}
