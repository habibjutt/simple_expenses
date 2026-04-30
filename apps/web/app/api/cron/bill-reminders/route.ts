import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendBillDueReminderEmail } from "@/lib/email";

// Vercel Cron: runs daily at 09:00 UTC
// Configured in vercel.json: /api/cron/bill-reminders
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Fetch all unpaid invoices without a reminder sent, due within the next 14 days
  // (14 is the maximum billReminderDays option users can choose)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const maxFutureDate = new Date(todayStart);
  maxFutureDate.setDate(maxFutureDate.getDate() + 14);
  maxFutureDate.setHours(23, 59, 59, 999);

  const invoices = await db.invoice.findMany({
    where: {
      isPaid: false,
      reminderSentAt: null,
      paymentDueDate: {
        gte: todayStart,
        lte: maxFutureDate,
      },
    },
    select: {
      id: true,
      paymentDueDate: true,
      totalAmount: true,
      creditCard: {
        select: {
          name: true,
          currency: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              billReminderDays: true,
            },
          },
        },
      },
    },
  });

  const results = { sent: 0, skipped: 0, errors: 0 };

  for (const invoice of invoices) {
    const user = invoice.creditCard.user;
    const dueDate = invoice.paymentDueDate;

    // Calculate days until due (midnight-based, whole-day comparison)
    const dueDayStart = new Date(dueDate);
    dueDayStart.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.round(
      (dueDayStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Only send if this invoice falls exactly on the user's configured reminder day
    if (daysUntilDue !== user.billReminderDays) {
      results.skipped++;
      continue;
    }

    try {
      await sendBillDueReminderEmail({
        to: user.email,
        userName: user.name || "there",
        cardName: invoice.creditCard.name,
        dueDate,
        totalAmount: invoice.totalAmount,
        currency: invoice.creditCard.currency,
        daysUntilDue,
      });

      await db.invoice.update({
        where: { id: invoice.id },
        data: { reminderSentAt: now },
      });

      results.sent++;
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    checked: invoices.length,
    processedAt: new Date().toISOString(),
  });
}
