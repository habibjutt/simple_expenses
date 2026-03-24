import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { toCsvRow } from "@/lib/csv";

type Tab = "categories" | "trend" | "budget";

// GET /api/v1/reports/export?tab=categories|trend|budget&month=&year=
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { searchParams } = new URL(request.url);
  const tab = (searchParams.get("tab") ?? "") as Tab;
  const monthStr = searchParams.get("month");
  const yearStr = searchParams.get("year");
  const month = monthStr != null ? Number(monthStr) : NaN;
  const year = yearStr != null ? Number(yearStr) : NaN;

  if (tab !== "categories" && tab !== "trend" && tab !== "budget")
    return api.badRequest('tab must be "categories", "trend", or "budget"');

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { preferredCurrency: true },
  });
  const currency = dbUser?.preferredCurrency ?? "AED";

  if (tab === "trend") {
    if (!yearStr || Number.isNaN(year) || year < 1900 || year > 2100)
      return api.badRequest("year is required for trend export");

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const lines: string[] = [];
    lines.push(toCsvRow(["Month", "Income", "Expenses", "Net", "Year", "Currency"]));

    for (let m = 1; m <= 12; m++) {
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59);
      const txns = await db.transaction.findMany({
        where: {
          OR: [{ creditCard: { userId: user.id } }, { bankAccount: { userId: user.id } }],
          date: { gte: start, lte: end },
        },
      });
      let income = 0;
      let expenses = 0;
      for (const t of txns) {
        if (t.type === "income") income += Number(t.amount);
        else expenses += Number(t.amount);
      }
      const net = income - expenses;
      lines.push(
        toCsvRow([MONTH_NAMES[m - 1], income, expenses, net, year, currency])
      );
    }

    const csv = `\uFEFF${lines.join("\r\n")}`;
    const filename = `report-trend-${year}.csv`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  if (!monthStr || !yearStr || Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12)
    return api.badRequest("month and year are required (1–12 and valid year)");

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const mPad = String(month).padStart(2, "0");

  if (tab === "categories") {
    const transactions = await db.transaction.findMany({
      where: {
        OR: [{ creditCard: { userId: user.id } }, { bankAccount: { userId: user.id } }],
        date: { gte: start, lte: end },
      },
    });

    const expenseMap = new Map<string, number>();
    const incomeMap = new Map<string, number>();
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of transactions) {
      const amt = Number(t.amount);
      if (t.type === "income") {
        totalIncome += amt;
        incomeMap.set(t.category || "Others", (incomeMap.get(t.category || "Others") || 0) + amt);
      } else {
        totalExpenses += amt;
        expenseMap.set(t.category || "Others", (expenseMap.get(t.category || "Others") || 0) + amt);
      }
    }

    const lines: string[] = [];
    lines.push(
      toCsvRow(["RowType", "Category", "Amount", "Percent", "Currency"])
    );
    lines.push(toCsvRow(["SUMMARY", "Total Income", totalIncome, "", currency]));
    lines.push(toCsvRow(["SUMMARY", "Total Expenses", totalExpenses, "", currency]));
    lines.push(toCsvRow(["SUMMARY", "Net", totalIncome - totalExpenses, "", currency]));

    for (const [cat, amt] of Array.from(expenseMap.entries()).sort((a, b) => b[1] - a[1])) {
      const pct =
        totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(2) : "";
      lines.push(toCsvRow(["EXPENSE", cat, amt, pct, currency]));
    }
    for (const [cat, amt] of Array.from(incomeMap.entries()).sort((a, b) => b[1] - a[1])) {
      const pct = totalIncome > 0 ? ((amt / totalIncome) * 100).toFixed(2) : "";
      lines.push(toCsvRow(["INCOME", cat, amt, pct, currency]));
    }

    const csv = `\uFEFF${lines.join("\r\n")}`;
    const filename = `report-categories-${year}-${mPad}.csv`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  /* budget */
  const limits = await db.spending_limit.findMany({
    where: { userId: user.id, month, year },
  });

  if (limits.length === 0) {
    const csv = `\uFEFF${toCsvRow(["Category", "Budget", "Actual", "Variance", "PercentUsed", "Currency"])}`;
    const filename = `report-budget-${year}-${mPad}.csv`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const expenseTx = await db.transaction.findMany({
    where: {
      OR: [{ creditCard: { userId: user.id } }, { bankAccount: { userId: user.id } }],
      date: { gte: start, lte: end },
      NOT: { type: "income" },
    },
  });

  const actualMap = new Map<string, number>();
  for (const t of expenseTx) {
    const cat = t.category || "Others";
    actualMap.set(cat, (actualMap.get(cat) || 0) + Number(t.amount));
  }

  const lines: string[] = [];
  lines.push(
    toCsvRow(["Category", "Budget", "Actual", "Variance", "PercentUsed", "Currency"])
  );

  for (const limit of limits.sort((a, b) => b.amount - a.amount)) {
    const actual = actualMap.get(limit.categoryName) || 0;
    const variance = actual - limit.amount;
    const pctUsed = limit.amount > 0 ? ((actual / limit.amount) * 100).toFixed(2) : "";
    lines.push(
      toCsvRow([
        limit.categoryName,
        limit.amount,
        actual,
        variance,
        pctUsed,
        currency,
      ])
    );
  }

  const csv = `\uFEFF${lines.join("\r\n")}`;
  const filename = `report-budget-${year}-${mPad}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
