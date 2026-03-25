"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export type CategoryStat = {
  category: string;
  amount: number;
  color: string;
  icon: string;
};

export type MonthlyData = {
  month: string;
  income: number;
  expenses: number;
};

export type BudgetVsActual = {
  category: string;
  budget: number;
  actual: number;
  color: string;
  icon: string;
};

export async function getReportData(month: number, year: number) {
  const session = await getSession();
  const userId = session.user.id;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ creditCard: { userId } }, { bankAccount: { userId } }],
      date: { gte: start, lte: end },
    },
    include: { creditCard: true, bankAccount: true },
  });

  // Group expenses by category
  const expenseMap = new Map<string, number>();
  const incomeMap = new Map<string, number>();
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    const amt = Number(t.amount);
    if (t.type === "income") {
      totalIncome += amt;
      incomeMap.set(
        t.category || "Others",
        (incomeMap.get(t.category || "Others") || 0) + amt,
      );
    } else {
      totalExpenses += amt;
      expenseMap.set(
        t.category || "Others",
        (expenseMap.get(t.category || "Others") || 0) + amt,
      );
    }
  }

  const categories = await prisma.category.findMany({ where: { userId } });
  const colorMap = new Map(categories.map((c) => [c.name, c.color]));
  const iconMap = new Map(categories.map((c) => [c.name, c.icon]));

  const COLORS = [
    "#f97316",
    "#ef4444",
    "#3b82f6",
    "#a855f7",
    "#22c55e",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#14b8a6",
    "#f59e0b",
    "#8b5cf6",
    "#64748b",
  ];
  let colorIdx = 0;

  const expenseStats: CategoryStat[] = Array.from(expenseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      color: colorMap.get(category) ?? COLORS[colorIdx++ % COLORS.length],
      icon: iconMap.get(category) ?? "tag",
    }));

  const incomeStats: CategoryStat[] = Array.from(incomeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      color: colorMap.get(category) ?? "#22c55e",
      icon: iconMap.get(category) ?? "tag",
    }));

  return { totalIncome, totalExpenses, expenseStats, incomeStats };
}

export async function getMonthlyTrend(year: number): Promise<MonthlyData[]> {
  const session = await getSession();
  const userId = session.user.id;
  const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const result: MonthlyData[] = [];

  for (let m = 1; m <= 12; m++) {
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59);

    const txns = await prisma.transaction.findMany({
      where: {
        OR: [{ creditCard: { userId } }, { bankAccount: { userId } }],
        date: { gte: start, lte: end },
      },
    });

    let income = 0;
    let expenses = 0;
    for (const t of txns) {
      if (t.type === "income") income += Number(t.amount);
      else expenses += Number(t.amount);
    }

    result.push({ month: MONTH_NAMES[m - 1], income, expenses });
  }

  return result;
}

export async function getBudgetVsActual(
  month: number,
  year: number,
): Promise<BudgetVsActual[]> {
  const session = await getSession();
  const userId = session.user.id;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  // Get spending limits for this month
  const limits = await prisma.spending_limit.findMany({
    where: { userId, month, year },
  });

  if (limits.length === 0) return [];

  // Get actual spending for this month (expenses only)
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ creditCard: { userId } }, { bankAccount: { userId } }],
      date: { gte: start, lte: end },
      NOT: { type: "income" },
    },
  });

  const actualMap = new Map<string, number>();
  for (const t of transactions) {
    const cat = t.category || "Others";
    actualMap.set(cat, (actualMap.get(cat) || 0) + Number(t.amount));
  }

  const categories = await prisma.category.findMany({ where: { userId } });
  const colorMap = new Map(categories.map((c) => [c.name, c.color]));
  const iconMap = new Map(categories.map((c) => [c.name, c.icon]));
  const COLORS = [
    "#f97316",
    "#ef4444",
    "#3b82f6",
    "#a855f7",
    "#22c55e",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#14b8a6",
    "#f59e0b",
    "#8b5cf6",
    "#64748b",
  ];
  let colorIdx = 0;

  return limits
    .map((limit) => ({
      category: limit.categoryName,
      budget: limit.amount,
      actual: actualMap.get(limit.categoryName) || 0,
      color:
        colorMap.get(limit.categoryName) ?? COLORS[colorIdx++ % COLORS.length],
      icon: iconMap.get(limit.categoryName) ?? "tag",
    }))
    .sort((a, b) => b.budget - a.budget);
}
