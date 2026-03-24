import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/v1/categories?type=expense|income|both
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const categories = await db.category.findMany({
    where: type
      ? { userId: user.id, OR: [{ type }, { type: "both" }] }
      : { userId: user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return api.ok(categories);
}

// POST /api/v1/categories
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { name, color, icon, type } = body as Record<string, unknown>;
  if (!name || !color || !icon || !type)
    return api.badRequest("name, color, icon, and type are required");

  const validTypes = ["expense", "income", "both"];
  if (!validTypes.includes(String(type)))
    return api.badRequest("type must be one of: expense, income, both");

  const category = await db.category.create({
    data: {
      name: String(name),
      color: String(color),
      icon: String(icon),
      type: String(type),
      userId: user.id,
    },
  });

  return api.created(category);
}
