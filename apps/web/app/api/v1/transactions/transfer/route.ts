import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// POST /api/v1/transactions/transfer
// Transfer from a bank account to pay a credit card or to another bank account
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { fromBankAccountId, toBankAccountId, amount, date, notes } = body as Record<
    string,
    unknown
  >;

  if (!fromBankAccountId || !toBankAccountId || amount == null || !date)
    return api.badRequest("fromBankAccountId, toBankAccountId, amount, and date are required");

  const amt = Number(amount);
  if (isNaN(amt) || amt <= 0) return api.badRequest("amount must be greater than 0");

  const fromAccount = await db.bank_account.findFirst({
    where: { id: String(fromBankAccountId), userId: user.id },
  });
  if (!fromAccount) return api.notFound("Source bank account not found");

  const toAccount = await db.bank_account.findFirst({
    where: { id: String(toBankAccountId), userId: user.id },
  });
  if (!toAccount) return api.notFound("Destination bank account not found");

  if (fromAccount.currentBalance < amt)
    return api.badRequest(
      `Insufficient funds. Available: ${fromAccount.currentBalance}, Requested: ${amt}`
    );

  const txDate = new Date(String(date));

  await db.$transaction([
    db.transaction.create({
      data: {
        name: notes ? String(notes) : `Transfer to ${toAccount.name}`,
        amount: amt,
        date: txDate,
        category: "Transfer",
        bankAccountId: String(fromBankAccountId),
        notes: notes ? String(notes) : null,
      },
    }),
    db.transaction.create({
      data: {
        name: notes ? String(notes) : `Transfer from ${fromAccount.name}`,
        amount: -amt,
        date: txDate,
        category: "Transfer",
        bankAccountId: String(toBankAccountId),
        notes: notes ? String(notes) : null,
      },
    }),
    db.bank_account.update({
      where: { id: String(fromBankAccountId) },
      data: { currentBalance: { decrement: amt } },
    }),
    db.bank_account.update({
      where: { id: String(toBankAccountId) },
      data: { currentBalance: { increment: amt } },
    }),
  ]);

  return api.ok({ success: true, amount: amt });
}
