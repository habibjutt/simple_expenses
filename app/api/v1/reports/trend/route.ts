import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/reports/trend?year=2026
// Returns monthly income and expense totals for each month in the year
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const transactions = await db.transaction.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
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
    select: { amount: true, date: true },
  });

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    year,
    expense: 0,
    income: 0,
  }));

  for (const tx of transactions) {
    const monthIndex = tx.date.getMonth();
    if (tx.amount > 0) {
      monthlyData[monthIndex].expense += tx.amount;
    } else {
      monthlyData[monthIndex].income += Math.abs(tx.amount);
    }
  }

  return api.ok({ year, trend: monthlyData });
}
