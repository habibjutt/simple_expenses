import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/goals/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const goal = await db.savings_goal.findFirst({ where: { id, userId: user.id } });
  if (!goal) return api.notFound("Savings goal not found");

  return api.ok(goal);
}

// PUT /api/v1/goals/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const goal = await db.savings_goal.findFirst({ where: { id, userId: user.id } });
  if (!goal) return api.notFound("Savings goal not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { name, targetAmount, color, deadline, isCompleted } = body as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = String(name);
  if (targetAmount !== undefined) updates.targetAmount = Number(targetAmount);
  if (color !== undefined) updates.color = String(color);
  if (deadline !== undefined) updates.deadline = deadline ? new Date(String(deadline)) : null;
  if (isCompleted !== undefined) updates.isCompleted = Boolean(isCompleted);

  const updated = await db.savings_goal.update({ where: { id }, data: updates });
  return api.ok(updated);
}

// DELETE /api/v1/goals/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const goal = await db.savings_goal.findFirst({ where: { id, userId: user.id } });
  if (!goal) return api.notFound("Savings goal not found");

  await db.savings_goal.delete({ where: { id } });
  return api.noContent();
}
