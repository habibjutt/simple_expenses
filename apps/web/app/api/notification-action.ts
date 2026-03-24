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
};

export async function getUpcomingBills(): Promise<UpcomingBill[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in14Days = new Date(today);
  in14Days.setDate(in14Days.getDate() + 14);

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
      billStartDate = new Date(currentYear, currentMonth, card.billGenerationDate);
      billEndDate = new Date(currentYear, currentMonth + 1, card.billGenerationDate);
      paymentDueDate = new Date(currentYear, currentMonth + 1, card.paymentDate);
    } else {
      billStartDate = new Date(currentYear, currentMonth - 1, card.billGenerationDate);
      billEndDate = new Date(currentYear, currentMonth, card.billGenerationDate);
      paymentDueDate = new Date(currentYear, currentMonth, card.paymentDate);
    }

    // Only show if due within 14 days
    if (paymentDueDate < today || paymentDueDate > in14Days) continue;

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
      const transactions = await db.transaction.findMany({
        where: {
          creditCardId: card.id,
          date: { gte: billStartDate, lt: billEndDate },
          OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
        },
      });
      totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    }

    if (totalAmount <= 0) continue;

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilDue = Math.ceil((paymentDueDate.getTime() - today.getTime()) / msPerDay);

    bills.push({
      cardId: card.id,
      cardName: card.name,
      invoiceId: invoice?.id ?? null,
      paymentDueDate,
      totalAmount,
      daysUntilDue,
      isPaid: invoice?.isPaid ?? false,
    });
  }

  return bills.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
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

  const transactions = await db.transaction.findMany({
    where: {
      creditCardId: invoice.creditCardId,
      date: {
        gte: invoice.billStartDate,
        lt: invoice.billEndDate,
      },
      OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
    },
    orderBy: { date: "desc" },
  });

  return { invoice, transactions };
}
