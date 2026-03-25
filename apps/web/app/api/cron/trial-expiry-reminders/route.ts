import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendTrialExpiringEmail } from "@/lib/email";

// Vercel Cron: runs daily at 09:00 UTC
// Configured in vercel.json: /api/cron/trial-expiry-reminders
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find users whose trial ends within the next 3 days and haven't been reminded today
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  threeDaysFromNow.setHours(23, 59, 59, 999);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const trialingUsers = await db.user.findMany({
    where: {
      subscriptionStatus: "trialing",
      trialEndsAt: {
        gt: now, // Trial hasn't expired yet
        lte: threeDaysFromNow, // Ends within 3 days
      },
      OR: [
        { lastTrialReminderAt: null },
        { lastTrialReminderAt: { lt: todayStart } }, // Not already reminded today
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      trialEndsAt: true,
    },
  });

  const results = { sent: 0, errors: 0 };

  for (const user of trialingUsers) {
    try {
      const daysLeft = Math.ceil(
        (user.trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      await sendTrialExpiringEmail({
        to: user.email,
        name: user.name || "there",
        daysLeft,
        trialEndsAt: user.trialEndsAt!,
      });

      await db.user.update({
        where: { id: user.id },
        data: { lastTrialReminderAt: now },
      });

      results.sent++;
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    checked: trialingUsers.length,
    processedAt: new Date().toISOString(),
  });
}
