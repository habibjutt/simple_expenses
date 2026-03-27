import { getApiUser, api } from "@/lib/api-auth";
import { sanitizeString } from "@/lib/sanitize";
import { db } from "@/lib/db";

// GET /api/v1/categories?type=expense|income|both
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const VALID_TYPES = ["expense", "income", "both"] as const;

  const categories = await db.category.findMany({
    where: type
      ? { userId: user.id, OR: [{ type }, { type: "both" }] }
      : { userId: user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  // Coerce any invalid type values to "expense" so the response matches the schema
  const sanitized = categories.map((c) => ({
    ...c,
    type: VALID_TYPES.includes(c.type as (typeof VALID_TYPES)[number])
      ? c.type
      : "expense",
  }));

  return api.ok(sanitized);
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
      name: sanitizeString(String(name)),
      color: String(color),
      icon: sanitizeString(String(icon)),
      type: String(type),
      userId: user.id,
    },
  });

  return api.created(category);
}
