import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

// DELETE /api/v1/spending-limits/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const { id } = await params;

  const limit = await db.spending_limit.findFirst({
    where: { id, userId: user.id },
  });
  if (!limit) return api.notFound("Spending limit not found");

  await db.spending_limit.delete({ where: { id } });
  return api.noContent();
}
