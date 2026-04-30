import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

const VALID_REMINDER_DAYS = [0, 1, 2, 3, 5, 7, 14];

// PATCH /api/v1/user/preferences — update user preferences (e.g. billReminderDays)
export async function PATCH(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { billReminderDays } = body as Record<string, unknown>;

  if (billReminderDays !== undefined) {
    if (
      typeof billReminderDays !== "number" ||
      !VALID_REMINDER_DAYS.includes(billReminderDays)
    ) {
      return api.badRequest(
        `billReminderDays must be one of: ${VALID_REMINDER_DAYS.join(", ")}`,
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: { billReminderDays },
    });

    return api.ok({ billReminderDays });
  }

  return api.badRequest("No valid fields provided");
}
