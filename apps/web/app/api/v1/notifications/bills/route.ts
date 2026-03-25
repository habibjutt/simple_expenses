import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/notifications/bills
// Returns unpaid invoices due in the next 7 days
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const today = new Date();
  const in7Days = new Date();
  in7Days.setDate(today.getDate() + 7);

  const upcomingInvoices = await db.invoice.findMany({
    where: {
      creditCard: { userId: user.id },
      isPaid: false,
      paymentDueDate: { gte: today, lte: in7Days },
    },
    include: {
      creditCard: { select: { id: true, name: true } },
    },
    orderBy: { paymentDueDate: "asc" },
  });

  return api.ok({
    count: upcomingInvoices.length,
    bills: upcomingInvoices.map((inv) => ({
      invoiceId: inv.id,
      creditCardId: inv.creditCardId,
      creditCardName: inv.creditCard.name,
      totalAmount: inv.totalAmount,
      paymentDueDate: inv.paymentDueDate,
      daysUntilDue: Math.ceil(
        (inv.paymentDueDate.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    })),
  });
}
