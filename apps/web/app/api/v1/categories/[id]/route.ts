import { getApiUser, api } from "@/lib/api-auth";
import { sanitizeString } from "@/lib/sanitize";
import { db } from "@/lib/db";

// PUT /api/v1/categories/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const category = await db.category.findFirst({ where: { id, userId: user.id } });
  if (!category) return api.notFound("Category not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { name, color, icon, type } = body as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = sanitizeString(String(name));
  if (color !== undefined) updates.color = String(color);
  if (icon !== undefined) updates.icon = sanitizeString(String(icon));
  if (type !== undefined) {
    const validTypes = ["expense", "income", "both"];
    if (!validTypes.includes(String(type)))
      return api.badRequest("type must be one of: expense, income, both");
    updates.type = String(type);
  }

  const updated = await db.category.update({ where: { id }, data: updates });
  return api.ok(updated);
}

// DELETE /api/v1/categories/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const category = await db.category.findFirst({ where: { id, userId: user.id } });
  if (!category) return api.notFound("Category not found");

  await db.category.delete({ where: { id } });
  return api.noContent();
}
