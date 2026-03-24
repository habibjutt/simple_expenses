import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/transactions?creditCardId=&bankAccountId=
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
      creditCard: { select: { name: true } },
      bankAccount: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  return api.ok(transactions);
}

// POST /api/v1/transactions
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { name, amount, date, category, notes, creditCardId, bankAccountId, installments } =
    body as Record<string, unknown>;

  if (!name || amount == null || !date || !category)
    return api.badRequest("name, amount, date, and category are required");
  if (!creditCardId && !bankAccountId)
    return api.badRequest("Either creditCardId or bankAccountId is required");
  if (creditCardId && bankAccountId)
    return api.badRequest("Cannot use both creditCardId and bankAccountId");

  const amt = Number(amount);
  if (isNaN(amt) || amt === 0) return api.badRequest("amount cannot be zero");

  const numInstallments = installments ? Number(installments) : 1;
  if (numInstallments < 1 || isNaN(numInstallments))
    return api.badRequest("installments must be >= 1");

  if (creditCardId) {
    const creditCard = await db.credit_card.findFirst({
      where: { id: String(creditCardId), userId: user.id },
    });
    if (!creditCard) return api.notFound("Credit card not found");

    const newAvailableBalance = creditCard.availableBalance - amt;
    if (amt > 0 && newAvailableBalance < 0)
      return api.badRequest(
        `Insufficient credit. Available: ${creditCard.availableBalance}, Requested: ${amt}`
      );

    if (numInstallments > 1) {
      const installmentAmount = amt / numInstallments;
      const transactionDate = new Date(String(date));
      const currentDay = transactionDate.getDate();
      const firstBillingMonth = new Date(transactionDate);
      if (currentDay >= creditCard.billGenerationDate) {
        firstBillingMonth.setMonth(firstBillingMonth.getMonth() + 1);
      }
      firstBillingMonth.setDate(creditCard.billGenerationDate);

      const parentTransaction = await db.transaction.create({
        data: {
          name: `${name} (${numInstallments} installments)`,
          amount: amt,
          date: transactionDate,
          category: String(category),
          notes: notes ? String(notes) : null,
          installments: numInstallments,
          creditCardId: String(creditCardId),
          installmentNumber: 0,
        },
      });

      await db.$transaction(async (prisma) => {
        for (let i = 1; i <= numInstallments; i++) {
          const installmentDate = new Date(firstBillingMonth);
          installmentDate.setMonth(installmentDate.getMonth() + (i - 1));
          await prisma.transaction.create({
            data: {
              name: `${name} (${i}/${numInstallments})`,
              amount: installmentAmount,
              date: installmentDate,
              category: String(category),
              notes: notes ? String(notes) : null,
              installments: numInstallments,
              parentTransactionId: parentTransaction.id,
              installmentNumber: i,
              creditCardId: String(creditCardId),
            },
          });
        }
        await prisma.credit_card.update({
          where: { id: String(creditCardId) },
          data: { availableBalance: newAvailableBalance },
        });
      });
      return api.created({ id: parentTransaction.id, message: "Installment plan created" });
    } else {
      const [newTx] = await db.$transaction([
        db.transaction.create({
          data: {
            name: String(name),
            amount: amt,
            date: new Date(String(date)),
            category: String(category),
            notes: notes ? String(notes) : null,
            installments: numInstallments,
            creditCardId: String(creditCardId),
          },
        }),
        db.credit_card.update({
          where: { id: String(creditCardId) },
          data: { availableBalance: newAvailableBalance },
        }),
      ]);
      return api.created(newTx);
    }
  } else {
    const bankAccount = await db.bank_account.findFirst({
      where: { id: String(bankAccountId), userId: user.id },
    });
    if (!bankAccount) return api.notFound("Bank account not found");

    const newBalance = bankAccount.currentBalance - amt;
    if (amt > 0 && newBalance < 0)
      return api.badRequest(
        `Insufficient funds. Available: ${bankAccount.currentBalance}, Requested: ${amt}`
      );

    const [newTx] = await db.$transaction([
      db.transaction.create({
        data: {
          name: String(name),
          amount: amt,
          date: new Date(String(date)),
          category: String(category),
          notes: notes ? String(notes) : null,
          installments: numInstallments,
          bankAccountId: String(bankAccountId),
        },
      }),
      db.bank_account.update({
        where: { id: String(bankAccountId) },
        data: { currentBalance: newBalance },
      }),
    ]);
    return api.created(newTx);
  }
}
