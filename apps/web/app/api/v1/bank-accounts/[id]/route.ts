import { getApiUser, api } from "@/lib/api-auth";
import { sanitizeString } from "@/lib/sanitize";
import { db } from "@/lib/db";

// GET /api/v1/bank-accounts/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const account = await db.bank_account.findFirst({
    where: { id, userId: user.id },
    include: {
      transactions: {
        where: { OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }] },
        orderBy: { date: "desc" },
        take: 50,
      },
    },
  });

  if (!account) return api.notFound("Bank account not found");

  return api.ok(account);
}

// PUT /api/v1/bank-accounts/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const account = await db.bank_account.findFirst({ where: { id, userId: user.id } });
  if (!account) return api.notFound("Bank account not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { name, initialBalance } = body as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = sanitizeString(String(name));
  if (initialBalance !== undefined) {
    const bal = Number(initialBalance);
    if (isNaN(bal) || bal < 0) return api.badRequest("initialBalance must be >= 0");
    const delta = bal - account.initialBalance;
    updates.initialBalance = bal;
    updates.currentBalance = account.currentBalance + delta;
  }

  const updated = await db.bank_account.update({ where: { id }, data: updates });
  return api.ok(updated);
}

// DELETE /api/v1/bank-accounts/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const account = await db.bank_account.findFirst({ where: { id, userId: user.id } });
  if (!account) return api.notFound("Bank account not found");

  await db.bank_account.delete({ where: { id } });
  return api.noContent();
}
