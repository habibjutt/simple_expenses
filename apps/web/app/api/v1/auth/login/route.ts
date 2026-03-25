import { auth } from "@/lib/auth";
import { api } from "@/lib/api-auth";

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
    return response;
  } catch {
    return api.unauthorized();
  }
}
