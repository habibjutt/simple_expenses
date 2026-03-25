import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// POST /api/v1/goals/:id/contribute
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const goal = await db.savings_goal.findFirst({
    where: { id, userId: user.id },
  });
  if (!goal) return api.notFound("Savings goal not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { amount } = body as Record<string, unknown>;
  if (amount == null) return api.badRequest("amount is required");

  const amt = Number(amount);
  if (isNaN(amt) || amt <= 0)
    return api.badRequest("amount must be greater than 0");

  const newAmount = Number(goal.currentAmount) + amt;
  const isCompleted = newAmount >= Number(goal.targetAmount);

  const updated = await db.savings_goal.update({
    where: { id },
    data: {
      currentAmount: newAmount,
      isCompleted,
    },
  });

  return api.ok(updated);
}
