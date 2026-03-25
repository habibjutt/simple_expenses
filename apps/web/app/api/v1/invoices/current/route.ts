import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/invoices/current
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const invoices = await db.invoice.findMany({
    where: {
      creditCard: { userId: user.id },
      billStartDate: { lte: endOfMonth },
      billEndDate: { gte: startOfMonth },
    },
    include: {
      creditCard: {
        select: {
          id: true,
          name: true,
          paymentDate: true,
          billGenerationDate: true,
        },
      },
    },
    orderBy: { paymentDueDate: "asc" },
  });

  return api.ok(invoices);
}
