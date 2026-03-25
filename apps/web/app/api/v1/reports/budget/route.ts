import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/reports/budget?month=3&year=2026
// Returns spending limits vs actual spending per category
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());

  const [limits, transactions] = await Promise.all([
    db.spending_limit.findMany({
      where: { userId: user.id, month, year },
    }),
    db.transaction.findMany({
      where: {
        date: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59),
        },
        amount: { gt: 0 },
        OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
        AND: [
          {
            OR: [
              { creditCard: { userId: user.id } },
              { bankAccount: { userId: user.id } },
            ],
          },
        ],
      },
      select: { amount: true, category: true },
    }),
  ]);

  const actualByCategory = new Map<string, number>();
  for (const tx of transactions) {
    actualByCategory.set(
      tx.category,
      (actualByCategory.get(tx.category) ?? 0) + tx.amount,
    );
  }

  const budget = limits.map((limit) => ({
    category: limit.categoryName,
    limit: limit.amount,
    actual: actualByCategory.get(limit.categoryName) ?? 0,
    remaining: limit.amount - (actualByCategory.get(limit.categoryName) ?? 0),
    percentage: Math.round(
      ((actualByCategory.get(limit.categoryName) ?? 0) / limit.amount) * 100,
    ),
  }));

  return api.ok({ month, year, budget });
}
