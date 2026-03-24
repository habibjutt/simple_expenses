import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/credit-cards/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const card = await db.credit_card.findFirst({
    where: { id, userId: user.id },
    include: {
      transactions: {
        where: { OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }] },
        orderBy: { date: "desc" },
        take: 50,
      },
    },
  });

  if (!card) return api.notFound("Credit card not found");

  return api.ok(card);
}

// PUT /api/v1/credit-cards/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const card = await db.credit_card.findFirst({ where: { id, userId: user.id } });
  if (!card) return api.notFound("Credit card not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { name, billGenerationDate, paymentDate, cardLimit } = body as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = String(name);
  if (billGenerationDate !== undefined) {
    const bgd = Number(billGenerationDate);
    if (isNaN(bgd) || bgd < 1 || bgd > 31)
      return api.badRequest("billGenerationDate must be between 1 and 31");
    updates.billGenerationDate = bgd;
  }
  if (paymentDate !== undefined) {
    const pd = Number(paymentDate);
    if (isNaN(pd) || pd < 1 || pd > 31)
      return api.badRequest("paymentDate must be between 1 and 31");
    updates.paymentDate = pd;
  }
  if (cardLimit !== undefined) {
    const cl = Number(cardLimit);
    if (isNaN(cl) || cl <= 0) return api.badRequest("cardLimit must be greater than 0");
    const balanceDelta = cl - card.cardLimit;
    updates.cardLimit = cl;
    updates.availableBalance = card.availableBalance + balanceDelta;
  }

  const updated = await db.credit_card.update({ where: { id }, data: updates });
  return api.ok(updated);
}

// DELETE /api/v1/credit-cards/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const card = await db.credit_card.findFirst({ where: { id, userId: user.id } });
  if (!card) return api.notFound("Credit card not found");

  await db.credit_card.delete({ where: { id } });
  return api.noContent();
}
