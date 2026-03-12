import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// POST /api/v1/invoices/:id/unpay
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const invoice = await db.invoice.findFirst({
    where: { id, creditCard: { userId: user.id } },
  });
  if (!invoice) return api.notFound("Invoice not found");
  if (!invoice.isPaid) return api.badRequest("Invoice is not paid");
  if (!invoice.paidFromBankAccountId || invoice.paidAmount == null)
    return api.badRequest("Invoice payment data is incomplete");

  const overpayment = invoice.paidAmount - invoice.totalAmount;
  const nextBillStart = new Date(invoice.billStartDate);
  nextBillStart.setMonth(nextBillStart.getMonth() + 1);
  const nextBillEnd = new Date(invoice.billEndDate);
  nextBillEnd.setMonth(nextBillEnd.getMonth() + 1);

  await db.$transaction(async (prisma) => {
    await prisma.invoice.update({
      where: { id },
      data: {
        isPaid: false,
        paidAt: null,
        paidAmount: 0,
        paidFromBankAccountId: null,
      },
    });
    await prisma.bank_account.update({
      where: { id: invoice.paidFromBankAccountId! },
      data: { currentBalance: { increment: invoice.paidAmount } },
    });
    await prisma.credit_card.update({
      where: { id: invoice.creditCardId },
      data: { availableBalance: { decrement: invoice.totalAmount } },
    });

    if (overpayment > 0) {
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
  });
  return api.ok({ success: true });
}
