import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/transactions/suggestions?q=<query>
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < 2) return api.ok([]);

  const rows = await db.transaction.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
      NOT: { category: "Transfer" },
      OR: [
        { creditCard: { userId: user.id } },
        { bankAccount: { userId: user.id } },
      ],
    },
    distinct: ["name", "category", "creditCardId", "bankAccountId"],
    select: {
      name: true,
      category: true,
      creditCardId: true,
      bankAccountId: true,
      creditCard: { select: { name: true } },
      bankAccount: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: 10,
  });

  return api.ok(
    rows.map((r) => ({
      name: r.name,
      category: r.category ?? null,
      creditCardId: r.creditCardId ?? null,
      creditCardName: r.creditCard?.name ?? null,
      bankAccountId: r.bankAccountId ?? null,
      bankAccountName: r.bankAccount?.name ?? null,
    })),
  );
}
