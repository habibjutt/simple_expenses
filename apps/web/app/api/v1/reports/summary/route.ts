import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/reports/summary?month=3&year=2026
// Returns expense/income totals by category for the given month
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

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
    select: { amount: true, category: true },
  });

  const byCategory = new Map<string, { expense: number; income: number }>();

  for (const tx of transactions) {
    const entry = byCategory.get(tx.category) ?? { expense: 0, income: 0 };
    if (tx.amount > 0) {
      entry.expense += tx.amount;
    } else {
      entry.income += Math.abs(tx.amount);
    }
    byCategory.set(tx.category, entry);
  }

  const summary = Array.from(byCategory.entries()).map(([category, totals]) => ({
    category,
    ...totals,
    net: totals.expense - totals.income,
  }));

  const totals = {
    totalExpense: summary.reduce((s, c) => s + c.expense, 0),
    totalIncome: summary.reduce((s, c) => s + c.income, 0),
  };

  return api.ok({ month, year, summary, ...totals });
}
