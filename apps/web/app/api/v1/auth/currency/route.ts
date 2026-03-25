import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { SUPPORTED_CURRENCIES } from "@simple-expenses/types";

// PUT /api/v1/auth/currency — update preferred currency
export async function PUT(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { currency } = body as Record<string, unknown>;
  if (!currency || typeof currency !== "string")
    return api.badRequest("currency is required");

  const isValid = SUPPORTED_CURRENCIES.some((c) => c.code === currency);
  if (!isValid) return api.badRequest("Invalid currency code");

  await db.user.update({
    where: { id: user.id },
    data: { preferredCurrency: currency },
  });

  return api.ok({ preferredCurrency: currency });
}
