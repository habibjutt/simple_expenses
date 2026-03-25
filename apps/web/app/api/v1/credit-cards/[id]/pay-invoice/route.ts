import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// POST /api/v1/credit-cards/:id/pay-invoice
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const card = await db.credit_card.findFirst({
    where: { id, userId: user.id },
  });
  if (!card) return api.notFound("Credit card not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const {
    bankAccountId,
    billStartDate,
    billEndDate,
    paymentDueDate,
    totalAmount,
    paidAmount,
  } = body as Record<string, unknown>;

  if (
    !bankAccountId ||
    !billStartDate ||
    !billEndDate ||
    !paymentDueDate ||
    totalAmount == null
  )
    return api.badRequest(
      "bankAccountId, billStartDate, billEndDate, paymentDueDate, and totalAmount are required",
    );

  const bankAccount = await db.bank_account.findFirst({
    where: { id: String(bankAccountId), userId: user.id },
  });
  if (!bankAccount) return api.notFound("Bank account not found");

  const total = Number(totalAmount);
  const paid = paidAmount != null ? Number(paidAmount) : total;

  if (paid <= 0) return api.badRequest("paidAmount must be greater than 0");
  if (paid > bankAccount.currentBalance)
    return api.badRequest(
      `Insufficient funds. Available: ${bankAccount.currentBalance}, Requested: ${paid}`,
    );

  const start = new Date(String(billStartDate));
  const end = new Date(String(billEndDate));
  const due = new Date(String(paymentDueDate));

  const existingInvoice = await db.invoice.findFirst({
    where: { creditCardId: id, billStartDate: start, billEndDate: end },
  });

  const overpayment = Math.max(0, paid - total);
  const amountRestoredToCard = total;

  // Handle carry-forward for next invoice if there's credit
  const nextBillStart = new Date(start);
  nextBillStart.setMonth(nextBillStart.getMonth() + 1);
  const nextBillEnd = new Date(end);
  nextBillEnd.setMonth(nextBillEnd.getMonth() + 1);

  await db.$transaction(async (prisma) => {
    if (existingInvoice) {
      await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paidAmount: paid,
          paidFromBankAccountId: String(bankAccountId),
        },
      });
    } else {
      await prisma.invoice.create({
        data: {
          creditCardId: id,
          billStartDate: start,
          billEndDate: end,
          paymentDueDate: due,
          totalAmount: total,
          isPaid: true,
          paidAt: new Date(),
          paidAmount: paid,
          paidFromBankAccountId: String(bankAccountId),
        },
      });
    }

    await prisma.bank_account.update({
      where: { id: String(bankAccountId) },
      data: { currentBalance: { decrement: paid } },
    });
    await prisma.credit_card.update({
      where: { id },
      data: { availableBalance: { increment: amountRestoredToCard } },
    });

    if (overpayment > 0) {
      const nextInvoice = await prisma.invoice.findFirst({
        where: {
          creditCardId: id,
          billStartDate: nextBillStart,
          billEndDate: nextBillEnd,
        },
      });
      if (nextInvoice) {
        await prisma.invoice.update({
          where: { id: nextInvoice.id },
          data: { creditFromPreviousMonth: { increment: overpayment } },
        });
      } else {
        await prisma.invoice.create({
          data: {
            creditCardId: id,
            billStartDate: nextBillStart,
            billEndDate: nextBillEnd,
            paymentDueDate: new Date(
              due.getFullYear(),
              due.getMonth() + 1,
              due.getDate(),
            ),
            totalAmount: 0,
            creditFromPreviousMonth: overpayment,
          },
        });
      }
    }
  });

  return api.ok({ success: true, paid, overpayment });
}
