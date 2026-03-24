import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { toCsvRow } from "@/lib/csv";

function buildFilename(month: string | null, year: string | null): string {
  if (month && year) {
    const m = month.padStart(2, "0");
    return `transactions-${year}-${m}.csv`;
  }
  return "transactions-export.csv";
}

// GET /api/v1/transactions/export?month=&year=&cardId=&accountId=  (also creditCardId, bankAccountId)
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { searchParams } = new URL(request.url);
  const creditCardId =
    searchParams.get("creditCardId") ?? searchParams.get("cardId") ?? undefined;
  const bankAccountId =
    searchParams.get("bankAccountId") ?? searchParams.get("accountId") ?? undefined;
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const dateFilter =
    month && year
      ? {
          date: {
            gte: new Date(Number(year), Number(month) - 1, 1),
            lt: new Date(Number(year), Number(month), 1),
          },
        }
      : {};

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { preferredCurrency: true },
  });
  const fallbackCurrency = dbUser?.preferredCurrency ?? "AED";

  const transactions = await db.transaction.findMany({
    where: creditCardId
      ? {
          creditCardId,
          creditCard: { userId: user.id },
          OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
          ...dateFilter,
        }
      : bankAccountId
        ? {
            bankAccountId,
            bankAccount: { userId: user.id },
            OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
            ...dateFilter,
          }
        : {
            AND: [
              {
                OR: [
                  { creditCard: { userId: user.id } },
                  { bankAccount: { userId: user.id } },
                ],
              },
              { OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }] },
            ],
            ...dateFilter,
          },
    include: {
      creditCard: { select: { name: true, currency: true } },
      bankAccount: { select: { name: true, currency: true } },
    },
    orderBy: { date: "desc" },
  });

  const headers = [
    "Date",
    "Description",
    "Category",
    "Amount",
    "Currency",
    "Account/Card",
    "Type",
  ];

  const rows = transactions.map((t) => {
    const accountLabel = t.creditCard?.name ?? t.bankAccount?.name ?? "";
    const rowCurrency =
      t.creditCard?.currency ?? t.bankAccount?.currency ?? fallbackCurrency;
    const description =
      t.notes && t.notes.trim() !== "" ? `${t.name} — ${t.notes}` : t.name;
    const d = new Date(t.date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const typeLabel =
      t.type === "income" ? "income" : t.type === "transfer" ? "transfer" : "expense";

    return toCsvRow([
      dateStr,
      description,
      t.category,
      t.amount,
      rowCurrency,
      accountLabel,
      typeLabel,
    ]);
  });

  const csvBody = [toCsvRow(headers), ...rows].join("\r\n");
  const csv = `\uFEFF${csvBody}`;

  const filename = buildFilename(month, year);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
