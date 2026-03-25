import { getApiUser, api } from "@/lib/api-auth";
import { sanitizeString } from "@/lib/sanitize";
import { db } from "@/lib/db";

// GET /api/v1/spending-limits?month=3&year=2026
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!month || !year)
    return api.badRequest("month and year query params are required");

  const limits = await db.spending_limit.findMany({
    where: { userId: user.id, month: Number(month), year: Number(year) },
    orderBy: { categoryName: "asc" },
  });

  return api.ok(limits);
}

// POST /api/v1/spending-limits  (upsert)
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { categoryName, amount, month, year } = body as Record<string, unknown>;
  if (!categoryName || amount == null || month == null || year == null)
    return api.badRequest("categoryName, amount, month, and year are required");

  const limit = await db.spending_limit.upsert({
    where: {
      userId_categoryName_month_year: {
        userId: user.id,
        categoryName: sanitizeString(String(categoryName)),
        month: Number(month),
        year: Number(year),
      },
    },
    update: { amount: Number(amount) },
    create: {
      userId: user.id,
      categoryName: sanitizeString(String(categoryName)),
      amount: Number(amount),
      month: Number(month),
      year: Number(year),
    },
  });

  return api.ok(limit);
}
