import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// PUT /api/v1/transactions/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const tx = await db.transaction.findFirst({
    where: {
      id,
      OR: [
        { creditCard: { userId: user.id } },
        { bankAccount: { userId: user.id } },
      ],
    },
  });
  if (!tx) return api.notFound("Transaction not found");

  if (tx.installmentNumber === 0)
    return api.badRequest("Cannot directly edit an installment parent transaction");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { name, amount, date, category, notes } = body as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = String(name);
  if (date !== undefined) updates.date = new Date(String(date));
  if (category !== undefined) updates.category = String(category);
  if (notes !== undefined) updates.notes = notes ? String(notes) : null;

  let amtDelta: number | undefined;
  if (amount !== undefined) {
    const newAmt = Number(amount);
    if (isNaN(newAmt) || newAmt === 0) return api.badRequest("amount cannot be zero");
    amtDelta = newAmt - tx.amount;
    updates.amount = newAmt;
  }

  const updated = await db.$transaction(async (prisma) => {
    const result = await prisma.transaction.update({ where: { id }, data: updates });
    if (amtDelta !== undefined && amtDelta !== 0) {
      if (tx.creditCardId) {
        await prisma.credit_card.update({
          where: { id: tx.creditCardId },
          data: { availableBalance: { decrement: amtDelta } },
        });
      } else if (tx.bankAccountId) {
        await prisma.bank_account.update({
          where: { id: tx.bankAccountId },
          data: { currentBalance: { decrement: amtDelta } },
        });
      }
    }
    return result;
  });
  return api.ok(updated);
}

// DELETE /api/v1/transactions/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const tx = await db.transaction.findFirst({
    where: {
      id,
      OR: [
        { creditCard: { userId: user.id } },
        { bankAccount: { userId: user.id } },
      ],
    },
  });
  if (!tx) return api.notFound("Transaction not found");

  if (tx.installmentNumber !== null && tx.installmentNumber > 0) {
    return api.badRequest(
      "Cannot delete an individual installment. Delete the parent transaction to remove the entire plan."
    );
  }

  await db.$transaction(async (prisma) => {
    if (tx.installmentNumber === 0) {
      // Installment parent — delete all children then the parent; refund full amount
      await prisma.transaction.deleteMany({ where: { parentTransactionId: id } });
      await prisma.transaction.delete({ where: { id } });
      if (tx.creditCardId) {
        await prisma.credit_card.update({
          where: { id: tx.creditCardId },
          data: { availableBalance: { increment: tx.amount } },
        });
      }
    } else {
      await prisma.transaction.delete({ where: { id } });
      if (tx.creditCardId) {
        await prisma.credit_card.update({
          where: { id: tx.creditCardId },
          data: { availableBalance: { increment: tx.amount } },
        });
      } else if (tx.bankAccountId) {
        await prisma.bank_account.update({
          where: { id: tx.bankAccountId },
          data: { currentBalance: { increment: tx.amount } },
        });
      }
    }
  });
  return api.noContent();
}
