import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/credit-cards/:id/invoice
// Returns the upcoming/current invoice for the given card
export async function GET(
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

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let billStartDate: Date;
  let billEndDate: Date;
  let paymentDueDate: Date;

  if (currentDay >= card.billGenerationDate) {
    // Bill has already been generated for this month — current period is next cycle
    billStartDate = new Date(
      currentYear,
      currentMonth,
      card.billGenerationDate,
    );
    billEndDate = new Date(
      currentYear,
      currentMonth + 1,
      card.billGenerationDate - 1,
    );
    paymentDueDate = new Date(currentYear, currentMonth + 1, card.paymentDate);
  } else {
    // Still in current billing period
    billStartDate = new Date(
      currentYear,
      currentMonth - 1,
      card.billGenerationDate,
    );
    billEndDate = new Date(
      currentYear,
      currentMonth,
      card.billGenerationDate - 1,
    );
    paymentDueDate = new Date(currentYear, currentMonth, card.paymentDate);
  }

  const existingInvoice = await db.invoice.findFirst({
    where: {
      creditCardId: id,
      billStartDate: {
        gte: new Date(
          billStartDate.getFullYear(),
          billStartDate.getMonth(),
          billStartDate.getDate(),
        ),
      },
      billEndDate: {
        lte: new Date(
          billEndDate.getFullYear(),
          billEndDate.getMonth(),
          billEndDate.getDate(),
          23,
          59,
          59,
        ),
      },
    },
  });

  const transactions = await db.transaction.findMany({
    where: {
      creditCardId: id,
      date: { gte: billStartDate, lte: billEndDate },
      OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
    },
    orderBy: { date: "desc" },
  });

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return api.ok({
    invoice: existingInvoice,
    billStartDate,
    billEndDate,
    paymentDueDate,
    transactions,
    totalAmount,
    creditFromPreviousMonth: existingInvoice?.creditFromPreviousMonth ?? 0,
  });
}
