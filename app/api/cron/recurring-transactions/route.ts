import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Vercel Cron: runs daily at 00:00 UTC
// Configured in vercel.json: /api/cron/recurring-transactions
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function computeNextRecurDate(from: Date, frequency: string): Date {
  const next = new Date(from);
  switch (frequency) {
    case "daily":   next.setDate(next.getDate() + 1); break;
    case "weekly":  next.setDate(next.getDate() + 7); break;
    case "monthly": next.setMonth(next.getMonth() + 1); break;
    case "yearly":  next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}

export async function GET(request: Request) {
  // Validate cron secret to prevent unauthorized invocations
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find all active recurring templates due today or overdue
  const dueTemplates = await db.transaction.findMany({
    where: {
      isRecurring: true,
      isRecurringActive: true,
      nextRecurDate: { lte: tomorrow },
    },
    include: {
      creditCard: true,
      bankAccount: true,
    },
  });

  const results = { created: 0, paused: 0, errors: 0 };

  for (const template of dueTemplates) {
    try {
      if (!template.recurringFrequency) continue;

      // Check if end date has passed
      if (template.recurringEndDate && template.recurringEndDate < today) {
        await db.transaction.update({
          where: { id: template.id },
          data: { isRecurringActive: false },
        });
        results.paused++;
        continue;
      }

      const instanceDate = template.nextRecurDate ?? today;
      const nextDate = computeNextRecurDate(instanceDate, template.recurringFrequency);

      // Deactivate if next date would exceed end date
      const willExpire = !!(template.recurringEndDate && nextDate > template.recurringEndDate);

      if (template.creditCardId && template.creditCard) {
        const newAvailableBalance = template.creditCard.availableBalance - template.amount;
        if (template.amount > 0 && newAvailableBalance < 0) {
          await db.transaction.update({
            where: { id: template.id },
            data: { isRecurringActive: false },
          });
          results.paused++;
          continue;
        }

        await db.$transaction([
          db.transaction.create({
            data: {
              name: template.name,
              amount: template.amount,
              date: instanceDate,
              category: template.category,
              notes: template.notes,
              installments: 1,
              creditCardId: template.creditCardId,
              parentRecurringId: template.id,
            },
          }),
          db.credit_card.update({
            where: { id: template.creditCardId },
            data: { availableBalance: newAvailableBalance },
          }),
          db.transaction.update({
            where: { id: template.id },
            data: { nextRecurDate: nextDate, isRecurringActive: !willExpire },
          }),
        ]);
      } else if (template.bankAccountId && template.bankAccount) {
        const newBalance = template.bankAccount.currentBalance - template.amount;
        if (template.amount > 0 && newBalance < 0) {
          await db.transaction.update({
            where: { id: template.id },
            data: { isRecurringActive: false },
          });
          results.paused++;
          continue;
        }

        await db.$transaction([
          db.transaction.create({
            data: {
              name: template.name,
              amount: template.amount,
              date: instanceDate,
              category: template.category,
              notes: template.notes,
              installments: 1,
              bankAccountId: template.bankAccountId,
              parentRecurringId: template.id,
            },
          }),
          db.bank_account.update({
            where: { id: template.bankAccountId },
            data: { currentBalance: newBalance },
          }),
          db.transaction.update({
            where: { id: template.id },
            data: { nextRecurDate: nextDate, isRecurringActive: !willExpire },
          }),
        ]);
      }

      results.created++;
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json({ success: true, ...results, processedAt: new Date().toISOString() });
}
