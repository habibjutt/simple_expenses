import { getApiUser, api } from "@/lib/api-auth";
import { sanitizeString } from "@/lib/sanitize";
import { db } from "@/lib/db";

// GET /api/v1/goals
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const goals = await db.savings_goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return api.ok(goals);
}

// POST /api/v1/goals
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { name, targetAmount, color, deadline } = body as Record<string, unknown>;
  if (!name || targetAmount == null || !color)
    return api.badRequest("name, targetAmount, and color are required");

  const goal = await db.savings_goal.create({
    data: {
      userId: user.id,
      name: sanitizeString(String(name)),
      targetAmount: Number(targetAmount),
      color: String(color),
      deadline: deadline ? new Date(String(deadline)) : null,
    },
  });

  return api.created(goal);
}
