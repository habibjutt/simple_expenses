"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type DashboardInvoice = {
  cardId: string;
  cardName: string;
  billStartDate: Date;
  billEndDate: Date;
  paymentDueDate: Date;
  totalAmount: number;
  invoice: { id: string; isPaid: boolean; paidAmount: number } | null;
};

export type DashboardNextBill = {
  cardId: string;
  nextBillStartDate: Date;
  nextBillEndDate: Date;
  nextPaymentDueDate: Date;
  totalAmount: number;
};

export type DashboardData = {
  creditCards: {
    id: string;
    name: string;
    billGenerationDate: number;
    paymentDate: number;
    cardLimit: number;
    availableBalance: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  bankAccounts: {
    id: string;
    name: string;
    initialBalance: number;
    currentBalance: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  invoices: DashboardInvoice[];
  nextBills: DashboardNextBill[];
  hasTransactions: boolean;
};

/**
 * Single consolidated dashboard data fetch.
 *
 * Replaces the previous 5-action waterfall (getCreditCards, getBankAccounts,
 * getTransactions, getCurrentMonthInvoices, getNextBillAmounts) with a single
 * server action that issues at most 6 DB queries regardless of how many cards
 * the user has, eliminating the N+1 problem.
 *
 * Query budget:
 *   1. credit_card + bank_account   (parallel)
 *   2. invoice findMany             (1 batch instead of N)
 *   3. transaction findMany         (1 batch instead of N+K)
 *   4. transaction findFirst        (cheap existence check, parallel with 3)
 */
export async function getDashboardData(): Promise<DashboardData> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  // ── 1. Cards + accounts in parallel ────────────────────────────────────
  const [creditCards, bankAccounts] = await Promise.all([
    db.credit_card.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    db.bank_account.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  const cardIds = creditCards.map((c) => c.id);

  if (cardIds.length === 0) {
    // Fast-path: no cards — just check for any bank transactions
    const firstTxn = await db.transaction.findFirst({
      where: { bankAccount: { userId } },
      select: { id: true },
    });
    return {
      creditCards,
      bankAccounts,
      invoices: [],
      nextBills: [],
      hasTransactions: firstTxn !== null,
    };
  }

  // ── 2. Compute billing periods in pure JS (zero DB calls) ───────────────
  // Each card has its own billGenerationDate, so periods differ per card.
  // We compute two sets of dates:
  //   • local dates  → to match getCurrentMonthInvoices behaviour
  //   • UTC dates    → to match getNextBillAmounts / invoice storage behaviour
  type CardPeriod = {
    cardId: string;
    card: (typeof creditCards)[0];
    // local-date period (current month invoice detection)
    localStart: Date;
    localEnd: Date;
    localDue: Date;
    // UTC-date period (next-bill and invoice storage)
    utcStart: Date;
    utcEnd: Date;
    utcDue: Date;
    // transaction window for the "next bill" (one billing cycle earlier)
    utcTxnStart: Date; // = utcStart - 1 month
    utcTxnEnd: Date;   // = utcStart
  };

  const cardPeriods: CardPeriod[] = creditCards.map((card) => {
    const g = card.billGenerationDate;
    const p = card.paymentDate;

    let localStart: Date, localEnd: Date, localDue: Date;
    let utcStart: Date, utcEnd: Date, utcDue: Date;

    if (currentDay >= g) {
      localStart = new Date(currentYear, currentMonth, g);
      localEnd   = new Date(currentYear, currentMonth + 1, g);
      localDue   = new Date(currentYear, currentMonth + 1, p);
      utcStart   = new Date(Date.UTC(currentYear, currentMonth, g));
      utcEnd     = new Date(Date.UTC(currentYear, currentMonth + 1, g));
      utcDue     = new Date(Date.UTC(currentYear, currentMonth + 1, p));
    } else {
      localStart = new Date(currentYear, currentMonth - 1, g);
      localEnd   = new Date(currentYear, currentMonth, g);
      localDue   = new Date(currentYear, currentMonth, p);
      utcStart   = new Date(Date.UTC(currentYear, currentMonth - 1, g));
      utcEnd     = new Date(Date.UTC(currentYear, currentMonth, g));
      utcDue     = new Date(Date.UTC(currentYear, currentMonth, p));
    }

    const utcTxnStart = new Date(utcStart);
    utcTxnStart.setMonth(utcTxnStart.getMonth() - 1);

    return { cardId: card.id, card, localStart, localEnd, localDue, utcStart, utcEnd, utcDue, utcTxnStart, utcTxnEnd: utcStart };
  });

  // ── 3. Batch invoice fetch (1 query) ────────────────────────────────────
  // Build the union date range that covers all cards' billing periods
  // (include 1-month extension forward for "already-paid → show next period" case,
  //  and 2-day extension backward for timezone edge cases).
  const allTimestamps = cardPeriods.flatMap((p) => [
    p.localStart.getTime(), p.localEnd.getTime(),
    p.utcStart.getTime(),   p.utcEnd.getTime(),
  ]);
  const rangeMin = new Date(Math.min(...allTimestamps) - 2 * 86_400_000); // -2 days
  const rangeMax = new Date(Math.max(...allTimestamps));
  rangeMax.setMonth(rangeMax.getMonth() + 1); // +1 month for next-period invoices

  const allInvoices = await db.invoice.findMany({
    where: {
      creditCardId: { in: cardIds },
      billStartDate: { gte: rangeMin },
      billEndDate:   { lte: rangeMax },
    },
  });

  // Index invoices by cardId for O(1) lookup
  const invoicesByCard = new Map<string, (typeof allInvoices)[number][]>();
  for (const inv of allInvoices) {
    const list = invoicesByCard.get(inv.creditCardId) ?? [];
    list.push(inv);
    invoicesByCard.set(inv.creditCardId, list);
  }

  // Find an invoice matching a specific (cardId, start, end) — tries both local & UTC
  function findInvoice(cardId: string, start: Date, end: Date) {
    return (invoicesByCard.get(cardId) ?? []).find(
      (inv) =>
        inv.billStartDate.getTime() === start.getTime() &&
        inv.billEndDate.getTime()   === end.getTime(),
    ) ?? null;
  }

  function getInvoiceForPeriod(p: CardPeriod) {
    return (
      findInvoice(p.cardId, p.localStart, p.localEnd) ??
      findInvoice(p.cardId, p.utcStart,   p.utcEnd)
    );
  }

  // ── 4. Compute transaction date range (covers all cards, all scenarios) ──
  const txnTimestamps = cardPeriods.flatMap((p) => [
    p.localStart.getTime(), p.localEnd.getTime(),
    p.utcTxnStart.getTime(), p.utcEnd.getTime(),
  ]);
  const txnRangeMin = new Date(Math.min(...txnTimestamps));
  const txnRangeMax = new Date(Math.max(...txnTimestamps));

  // ── 5. Transactions + existence check in parallel ───────────────────────
  const [allTransactions, firstTxn] = await Promise.all([
    db.transaction.findMany({
      where: {
        creditCardId: { in: cardIds },
        date: { gte: txnRangeMin, lte: txnRangeMax },
        OR: [
          { installmentNumber: null },
          { installmentNumber: { gt: 0 } },
        ],
      },
      select: { creditCardId: true, amount: true, date: true },
    }),
    db.transaction.findFirst({
      where: { OR: [{ creditCard: { userId } }, { bankAccount: { userId } }] },
      select: { id: true },
    }),
  ]);

  const hasTransactions = firstTxn !== null;

  // Group transactions by cardId for fast per-card sum
  const txnsByCard = new Map<string, { amount: number; date: Date }[]>();
  for (const txn of allTransactions) {
    if (!txn.creditCardId) continue;
    const list = txnsByCard.get(txn.creditCardId) ?? [];
    list.push({ amount: txn.amount, date: txn.date });
    txnsByCard.set(txn.creditCardId, list);
  }

  function sumTransactions(cardId: string, from: Date, to: Date) {
    return (txnsByCard.get(cardId) ?? [])
      .filter((t) => t.date >= from && t.date < to)
      .reduce((s, t) => s + t.amount, 0);
  }

  // ── 6. Build invoices (current month dues) ──────────────────────────────
  const invoices: DashboardInvoice[] = [];
  for (const period of cardPeriods) {
    const { cardId, card, localStart, localEnd, localDue } = period;
    const existing = getInvoiceForPeriod(period);

    if (existing?.isPaid) continue;

    const totalAmount = existing
      ? existing.totalAmount
      : sumTransactions(cardId, localStart, localEnd);

    if (totalAmount > 0 && localEnd.getMonth() === currentMonth) {
      invoices.push({
        cardId,
        cardName: card.name,
        billStartDate: localStart,
        billEndDate:   localEnd,
        paymentDueDate: localDue,
        totalAmount,
        invoice: existing
          ? { id: existing.id, isPaid: existing.isPaid, paidAmount: existing.paidAmount }
          : null,
      });
    }
  }

  // ── 7. Build next bill amounts ───────────────────────────────────────────
  const nextBills: DashboardNextBill[] = [];
  for (const period of cardPeriods) {
    const { cardId, card, utcStart, utcEnd, utcDue, utcTxnStart } = period;
    const existing = getInvoiceForPeriod(period);

    let nextBillStart: Date, nextBillEnd: Date, nextBillDue: Date;
    let txnFrom: Date, txnTo: Date;

    if (existing?.isPaid) {
      // Current period is paid → shift the "upcoming" view to the next period
      nextBillStart = new Date(Date.UTC(utcEnd.getUTCFullYear(),   utcEnd.getUTCMonth(),       card.billGenerationDate));
      nextBillEnd   = new Date(Date.UTC(nextBillStart.getUTCFullYear(), nextBillStart.getUTCMonth() + 1, card.billGenerationDate));
      nextBillDue   = new Date(Date.UTC(nextBillEnd.getUTCFullYear(),   nextBillEnd.getUTCMonth(),  card.paymentDate));
      txnFrom = utcStart;
      txnTo   = utcEnd;
    } else {
      nextBillStart = utcStart;
      nextBillEnd   = utcEnd;
      nextBillDue   = utcDue;
      txnFrom = utcTxnStart;
      txnTo   = utcStart; // period.utcTxnEnd
    }

    const totalAmount = sumTransactions(cardId, txnFrom, txnTo);

    nextBills.push({ cardId, nextBillStartDate: nextBillStart, nextBillEndDate: nextBillEnd, nextPaymentDueDate: nextBillDue, totalAmount });
  }

  return { creditCards, bankAccounts, invoices, nextBills, hasTransactions };
}
