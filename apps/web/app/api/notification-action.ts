"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type UpcomingBill = {
  cardId: string;
  cardName: string;
  invoiceId: string | null;
  paymentDueDate: Date;
  totalAmount: number;
  daysUntilDue: number;
  isPaid: boolean;
  currency: string;
  /** Stable key used to dismiss this notification: "bill:{cardId}:{YYYY-MM-DD}" */
  notificationKey: string;
};

/** Builds the stable key for a bill notification. Tied to the payment due date
 *  so it naturally resets next billing cycle. */
function buildNotificationKey(cardId: string, paymentDueDate: Date): string {
  return `bill:${cardId}:${paymentDueDate.toISOString().slice(0, 10)}`;
}

export async function getUpcomingBills(): Promise<UpcomingBill[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in14Days = new Date(today);
  in14Days.setDate(in14Days.getDate() + 14);

  // Load dismissed keys for this user in one query
  const dismissed = await db.dismissed_notification.findMany({
    where: { userId: session.user.id },
    select: { refKey: true },
  });
  const dismissedSet = new Set(dismissed.map((d) => d.refKey));

  const creditCards = await db.credit_card.findMany({
    where: { userId: session.user.id },
  });

  const bills: UpcomingBill[] = [];

  for (const card of creditCards) {
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let billStartDate: Date;
    let billEndDate: Date;
    let paymentDueDate: Date;

    if (currentDay >= card.billGenerationDate) {
      billStartDate = new Date(
        currentYear,
        currentMonth,
        card.billGenerationDate,
      );
      billEndDate = new Date(
        currentYear,
        currentMonth + 1,
        card.billGenerationDate,
      );
      paymentDueDate = new Date(
        currentYear,
        currentMonth + 1,
        card.paymentDate,
      );
    } else {
      billStartDate = new Date(
        currentYear,
        currentMonth - 1,
        card.billGenerationDate,
      );
      billEndDate = new Date(
        currentYear,
        currentMonth,
        card.billGenerationDate,
      );
      paymentDueDate = new Date(currentYear, currentMonth, card.paymentDate);
    }

    // Only show if due within 14 days
    if (paymentDueDate < today || paymentDueDate > in14Days) continue;

    const notificationKey = buildNotificationKey(card.id, paymentDueDate);

    // Skip if the user already dismissed this notification
    if (dismissedSet.has(notificationKey)) continue;

    const invoice = await db.invoice.findUnique({
      where: {
        creditCardId_billStartDate_billEndDate: {
          creditCardId: card.id,
          billStartDate,
          billEndDate,
        },
      },
    });

    if (invoice?.isPaid) continue;

    let totalAmount = invoice?.totalAmount ?? 0;
    if (!invoice) {
      // Transactions for a bill are from the month BEFORE billStartDate up to
      // and including billStartDate (the cut-off/statement date). This matches
      // the window used by getUpcomingInvoice() in credit-card-action.ts.
      const transactionWindowStart = new Date(billStartDate);
      transactionWindowStart.setMonth(transactionWindowStart.getMonth() - 1);

      const transactions = await db.transaction.findMany({
        where: {
          creditCardId: card.id,
          date: { gt: transactionWindowStart, lte: billStartDate },
          OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
        },
      });
      totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    }

    if (totalAmount <= 0) continue;

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilDue = Math.ceil(
      (paymentDueDate.getTime() - today.getTime()) / msPerDay,
    );

    bills.push({
      cardId: card.id,
      cardName: card.name,
      invoiceId: invoice?.id ?? null,
      paymentDueDate,
      totalAmount,
      daysUntilDue,
      isPaid: invoice?.isPaid ?? false,
      currency: card.currency,
      notificationKey,
    });
  }

  return bills.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

/** Mark a single bill notification as read (dismissed). */
export async function dismissNotification(notificationKey: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return;

  await db.dismissed_notification.upsert({
    where: { userId_refKey: { userId: session.user.id, refKey: notificationKey } },
    create: { userId: session.user.id, refKey: notificationKey },
    update: {}, // already dismissed — no-op
  });
}

/** Mark all current bill notifications as read at once. */
export async function dismissAllNotifications(notificationKeys: string[]): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id || notificationKeys.length === 0) return;

  await db.dismissed_notification.createMany({
    data: notificationKeys.map((refKey) => ({
      userId: session.user.id,
      refKey,
    })),
    skipDuplicates: true,
  });
}

export async function getInvoiceDetail(invoiceId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      creditCard: true,
      paidFromBankAccount: true,
    },
  });

  if (!invoice || invoice.creditCard.userId !== session.user.id) {
    throw new Error("Invoice not found");
  }

  // Transactions for an invoice span from the month before billStartDate (exclusive)
  // up to and including billStartDate — the same window used everywhere else.
  const transactionWindowStart = new Date(invoice.billStartDate);
  transactionWindowStart.setMonth(transactionWindowStart.getMonth() - 1);

  const transactions = await db.transaction.findMany({
    where: {
      creditCardId: invoice.creditCardId,
      date: {
        gt: transactionWindowStart,
        lte: invoice.billStartDate,
      },
      OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
    },
    orderBy: { date: "desc" },
  });

  return { invoice, transactions };
}
