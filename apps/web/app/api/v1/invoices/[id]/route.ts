import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/invoices/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const invoice = await db.invoice.findFirst({
    where: { id, creditCard: { userId: user.id } },
    include: {
      creditCard: { select: { id: true, name: true } },
    },
  });

  if (!invoice) return api.notFound("Invoice not found");

  return api.ok(invoice);
}

// PUT /api/v1/invoices/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const invoice = await db.invoice.findFirst({
    where: { id, creditCard: { userId: user.id } },
  });
  if (!invoice) return api.notFound("Invoice not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { billStartDate, billEndDate, paymentDueDate, totalAmount } =
    body as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  if (billStartDate !== undefined)
    updates.billStartDate = new Date(String(billStartDate));
  if (billEndDate !== undefined)
    updates.billEndDate = new Date(String(billEndDate));
  if (paymentDueDate !== undefined)
    updates.paymentDueDate = new Date(String(paymentDueDate));
  if (totalAmount !== undefined) updates.totalAmount = Number(totalAmount);

  const updated = await db.invoice.update({ where: { id }, data: updates });
  return api.ok(updated);
}

// DELETE /api/v1/invoices/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const invoice = await db.invoice.findFirst({
    where: { id, creditCard: { userId: user.id } },
    include: { creditCard: true },
  });
  if (!invoice) return api.notFound("Invoice not found");

  // Reverse the payment: restore bank balance and reduce card balance back
  if (invoice.isPaid && invoice.paidAmount && invoice.paidFromBankAccountId) {
    const overpayment = invoice.paidAmount - invoice.totalAmount;

    await db.$transaction(async (prisma) => {
      await prisma.bank_account.update({
        where: { id: invoice.paidFromBankAccountId! },
        data: { currentBalance: { increment: invoice.paidAmount } },
      });
      await prisma.credit_card.update({
        where: { id: invoice.creditCardId },
        data: { availableBalance: { decrement: invoice.totalAmount } },
      });

      if (overpayment > 0) {
        const nextBillStart = new Date(invoice.billStartDate);
        nextBillStart.setMonth(nextBillStart.getMonth() + 1);
        const nextBillEnd = new Date(invoice.billEndDate);
        nextBillEnd.setMonth(nextBillEnd.getMonth() + 1);

        const nextInvoice = await prisma.invoice.findFirst({
          where: {
            creditCardId: invoice.creditCardId,
            billStartDate: nextBillStart,
            billEndDate: nextBillEnd,
          },
        });
        if (nextInvoice) {
          await prisma.invoice.update({
            where: { id: nextInvoice.id },
            data: { creditFromPreviousMonth: { decrement: overpayment } },
          });
        }
      }

      await prisma.invoice.delete({ where: { id } });
    });
  } else {
    await db.invoice.delete({ where: { id } });
  }
  return api.noContent();
}
