import { getApiUser, api } from "@/lib/api-auth";
import { sanitizeString } from "@/lib/sanitize";
import { db } from "@/lib/db";

// GET /api/v1/bank-accounts
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const accounts = await db.bank_account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return api.ok(accounts);
}

// POST /api/v1/bank-accounts
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { name, initialBalance } = body as Record<string, unknown>;

  if (!name || initialBalance == null)
    return api.badRequest("name and initialBalance are required");

  const bal = Number(initialBalance);
  if (isNaN(bal) || bal < 0) return api.badRequest("initialBalance must be >= 0");

  const account = await db.bank_account.create({
    data: {
      name: sanitizeString(String(name)),
      initialBalance: bal,
      currentBalance: bal,
      userId: user.id,
    },
  });

  return api.created(account);
}
