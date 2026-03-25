import { auth } from "@/lib/auth";
import { api } from "@/lib/api-auth";
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
    const response = await auth.api.signUpEmail({
      body: {
        email: String(email),
        password: String(password),
        name: sanitizeString(String(name)),
      },
      asResponse: true,
    });
    return response;
  } catch {
    return api.badRequest("Sign-up failed. Email may already be in use.");
  }
}
