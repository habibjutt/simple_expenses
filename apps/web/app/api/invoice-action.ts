"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { IdSchema, EditInvoiceSchema } from "@/lib/validations/invoice";
import type { ActionResult } from "@/lib/validations";

export async function deleteInvoice(invoiceId: string): Promise<ActionResult> {
  const idParse = IdSchema.safeParse({ id: invoiceId });
  if (!idParse.success) {
    return { error: idParse.error.issues[0].message };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Fetch the invoice with credit card info
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      creditCard: true,
      paidFromBankAccount: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Verify the invoice belongs to the user
  if (invoice.creditCard.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // If the invoice was paid, we need to reverse the transaction
  if (invoice.isPaid && invoice.paidFromBankAccountId) {
    await db.$transaction(async (tx) => {
      // Calculate if there was an overpayment
      const amountOwed = invoice.totalAmount - invoice.creditFromPreviousMonth;
      const overpaymentAmount = Math.max(0, invoice.paidAmount - amountOwed);

      // Return the paid amount to the bank account
      await tx.bank_account.update({
        where: { id: invoice.paidFromBankAccountId! },
        data: {
          currentBalance: {
            increment: invoice.paidAmount || invoice.totalAmount,
          },
        },
      });

      // Deduct the paid amount from the credit card available balance
      // (reversing the payment that restored the balance)
      await tx.credit_card.update({
        where: { id: invoice.creditCardId },
        data: {
          availableBalance: {
            decrement: invoice.paidAmount || invoice.totalAmount,
          },
        },
      });

      // If there was an overpayment, we need to reverse it from the next invoice
      if (overpaymentAmount > 0) {
        // Calculate next billing period
        const nextBillStartDate = new Date(invoice.billEndDate);
        const nextBillEndDate = new Date(invoice.billEndDate);
        nextBillEndDate.setMonth(nextBillEndDate.getMonth() + 1);

        // Find and update the next invoice
        const nextInvoice = await tx.invoice.findUnique({
          where: {
            creditCardId_billStartDate_billEndDate: {
              creditCardId: invoice.creditCardId,
              billStartDate: nextBillStartDate,
              billEndDate: nextBillEndDate,
            },
          },
        });

        if (nextInvoice) {
          const newCreditFromPrevious = Math.max(
            0,
            nextInvoice.creditFromPreviousMonth - overpaymentAmount,
          );
          const newAmountOwed = nextInvoice.totalAmount - newCreditFromPrevious;
          const newIsPaid =
            nextInvoice.paidAmount >= newAmountOwed && newAmountOwed > 0;

          await tx.invoice.update({
            where: { id: nextInvoice.id },
            data: {
              creditFromPreviousMonth: newCreditFromPrevious,
              isPaid: newIsPaid,
            },
          });
        }
      }

      // Delete the invoice
      await tx.invoice.delete({
        where: { id: invoiceId },
      });
    });
  } else {
    // Invoice wasn't paid, just delete it
    await db.invoice.delete({
      where: { id: invoiceId },
    });
  }

  revalidatePath("/");
  revalidatePath(`/credit-card/${invoice.creditCardId}`);
}

export async function editInvoice(
  invoiceId: string,
  newBankAccountId: string | null,
): Promise<ActionResult> {
  const parse = EditInvoiceSchema.safeParse({ invoiceId, newBankAccountId });
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Fetch the invoice with credit card info
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      creditCard: true,
      paidFromBankAccount: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Verify the invoice belongs to the user
  if (invoice.creditCard.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // If trying to change the bank account, verify the new bank account
  if (newBankAccountId) {
    const newBankAccount = await db.bank_account.findUnique({
      where: { id: newBankAccountId },
    });

    if (!newBankAccount || newBankAccount.userId !== session.user.id) {
      throw new Error("Invalid bank account");
    }

    // Check if the new bank account has sufficient balance
    if (newBankAccount.currentBalance < invoice.totalAmount) {
      throw new Error("Insufficient balance in the selected bank account");
    }
  }

  // Handle the edit based on current state and desired state
  await db.$transaction(async (tx) => {
    // If invoice was paid and we're changing the payment source
    if (invoice.isPaid && invoice.paidFromBankAccountId) {
      if (
        newBankAccountId &&
        newBankAccountId !== invoice.paidFromBankAccountId
      ) {
        // Reverse the original payment
        await tx.bank_account.update({
          where: { id: invoice.paidFromBankAccountId },
          data: {
            currentBalance: {
              increment: invoice.totalAmount,
            },
          },
        });

        // Apply the payment to the new bank account
        await tx.bank_account.update({
          where: { id: newBankAccountId },
          data: {
            currentBalance: {
              decrement: invoice.totalAmount,
            },
          },
        });

        // Update the invoice with the new bank account
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            paidFromBankAccountId: newBankAccountId,
          },
        });
      } else if (!newBankAccountId) {
        // User wants to mark as unpaid - reverse the payment
        await tx.bank_account.update({
          where: { id: invoice.paidFromBankAccountId },
          data: {
            currentBalance: {
              increment: invoice.totalAmount,
            },
          },
        });

        // Deduct from credit card available balance
        await tx.credit_card.update({
          where: { id: invoice.creditCardId },
          data: {
            availableBalance: {
              decrement: invoice.totalAmount,
            },
          },
        });

        // Update invoice to unpaid
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            isPaid: false,
            paidAt: null,
            paidFromBankAccountId: null,
          },
        });
      }
    } else if (!invoice.isPaid && newBankAccountId) {
      // Invoice wasn't paid, but user wants to mark it as paid
      await tx.bank_account.update({
        where: { id: newBankAccountId },
        data: {
          currentBalance: {
            decrement: invoice.totalAmount,
          },
        },
      });

      // Restore credit card available balance
      await tx.credit_card.update({
        where: { id: invoice.creditCardId },
        data: {
          availableBalance: {
            increment: invoice.totalAmount,
          },
        },
      });

      // Update invoice to paid
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paidFromBankAccountId: newBankAccountId,
        },
      });
    }
  });

  revalidatePath("/");
  revalidatePath(`/credit-card/${invoice.creditCardId}`);
}

export async function unpayInvoice(invoiceId: string): Promise<ActionResult> {
  const idParse = IdSchema.safeParse({ id: invoiceId });
  if (!idParse.success) {
    return { error: idParse.error.issues[0].message };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Fetch the invoice with credit card info
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      creditCard: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Verify the invoice belongs to the user
  if (invoice.creditCard.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (!invoice.isPaid) {
    throw new Error("Invoice is not paid");
  }

  if (!invoice.paidFromBankAccountId) {
    throw new Error("No payment information found");
  }

  // Reverse the payment transaction
  await db.$transaction(async (tx) => {
    // Calculate if there was an overpayment
    const amountOwed = invoice.totalAmount - invoice.creditFromPreviousMonth;
    const overpaymentAmount = Math.max(0, invoice.paidAmount - amountOwed);

    // Return the paid amount to the bank account
    await tx.bank_account.update({
      where: { id: invoice.paidFromBankAccountId! },
      data: {
        currentBalance: {
          increment: invoice.paidAmount || invoice.totalAmount,
        },
      },
    });

    // Deduct from credit card available balance
    await tx.credit_card.update({
      where: { id: invoice.creditCardId },
      data: {
        availableBalance: {
          decrement: invoice.paidAmount || invoice.totalAmount,
        },
      },
    });

    // If there was an overpayment, we need to reverse it from the next invoice
    if (overpaymentAmount > 0) {
      // Calculate next billing period
      const nextBillStartDate = new Date(invoice.billEndDate);
      const nextBillEndDate = new Date(invoice.billEndDate);
      nextBillEndDate.setMonth(nextBillEndDate.getMonth() + 1);

      // Find and update the next invoice
      const nextInvoice = await tx.invoice.findUnique({
        where: {
          creditCardId_billStartDate_billEndDate: {
            creditCardId: invoice.creditCardId,
            billStartDate: nextBillStartDate,
            billEndDate: nextBillEndDate,
          },
        },
      });

      if (nextInvoice) {
        const newCreditFromPrevious = Math.max(
          0,
          nextInvoice.creditFromPreviousMonth - overpaymentAmount,
        );
        const newAmountOwed = nextInvoice.totalAmount - newCreditFromPrevious;
        const newIsPaid =
          nextInvoice.paidAmount >= newAmountOwed && newAmountOwed > 0;

        await tx.invoice.update({
          where: { id: nextInvoice.id },
          data: {
            creditFromPreviousMonth: newCreditFromPrevious,
            isPaid: newIsPaid,
          },
        });
      }
    }

    // Update invoice to unpaid and reset paid amount
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        isPaid: false,
        paidAmount: 0,
        paidAt: null,
        paidFromBankAccountId: null,
      },
    });
  });

  revalidatePath("/");
  revalidatePath(`/credit-card/${invoice.creditCardId}`);
}

export async function getCurrentMonthInvoices() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  const creditCards = await db.credit_card.findMany({
    where: { userId: session.user.id },
  });

  if (creditCards.length === 0) return [];

  // Compute billing periods for all cards in JS
  type CardPeriod = {
    card: (typeof creditCards)[0];
    billStartDate: Date;
    billEndDate: Date;
    paymentDueDate: Date;
  };

  const cardPeriods: CardPeriod[] = creditCards.map((card) => {
    const g = card.billGenerationDate;
    if (currentDay >= g) {
      return {
        card,
        billStartDate: new Date(currentYear, currentMonth, g),
        billEndDate: new Date(currentYear, currentMonth + 1, g),
        paymentDueDate: new Date(
          currentYear,
          currentMonth + 1,
          card.paymentDate,
        ),
      };
    }
    return {
      card,
      billStartDate: new Date(currentYear, currentMonth - 1, g),
      billEndDate: new Date(currentYear, currentMonth, g),
      paymentDueDate: new Date(currentYear, currentMonth, card.paymentDate),
    };
  });

  const cardIds = creditCards.map((c) => c.id);

  // Batch invoice fetch — one query for all cards
  const allStarts = cardPeriods.map((p) => p.billStartDate.getTime());
  const allEnds = cardPeriods.map((p) => p.billEndDate.getTime());

  const allInvoices = await db.invoice.findMany({
    where: {
      creditCardId: { in: cardIds },
      billStartDate: { gte: new Date(Math.min(...allStarts) - 86_400_000) },
      billEndDate: { lte: new Date(Math.max(...allEnds) + 86_400_000) },
    },
  });

  const invoicesByCard = new Map<string, (typeof allInvoices)[number][]>();
  for (const inv of allInvoices) {
    const list = invoicesByCard.get(inv.creditCardId) ?? [];
    list.push(inv);
    invoicesByCard.set(inv.creditCardId, list);
  }

  function findInvoice(cardId: string, start: Date, end: Date) {
    return (
      (invoicesByCard.get(cardId) ?? []).find(
        (inv) =>
          inv.billStartDate.getTime() === start.getTime() &&
          inv.billEndDate.getTime() === end.getTime(),
      ) ?? null
    );
  }

  // Determine which cards need a transaction-based amount (no stored invoice)
  const periodsNeedingTxns = cardPeriods.filter(
    (p) => !findInvoice(p.card.id, p.billStartDate, p.billEndDate),
  );

  // Batch transaction fetch for all such cards in one query
  const txnsByCard = new Map<string, { amount: number; date: Date }[]>();
  if (periodsNeedingTxns.length > 0) {
    const txnStarts = periodsNeedingTxns.map((p) => p.billStartDate.getTime());
    const txnEnds = periodsNeedingTxns.map((p) => p.billEndDate.getTime());
    const txnCardIds = periodsNeedingTxns.map((p) => p.card.id);

    const transactions = await db.transaction.findMany({
      where: {
        creditCardId: { in: txnCardIds },
        date: {
          gte: new Date(Math.min(...txnStarts)),
          lt: new Date(Math.max(...txnEnds)),
        },
        OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
      },
      select: { creditCardId: true, amount: true, date: true },
    });

    for (const txn of transactions) {
      if (!txn.creditCardId) continue;
      const list = txnsByCard.get(txn.creditCardId) ?? [];
      list.push({ amount: txn.amount, date: txn.date });
      txnsByCard.set(txn.creditCardId, list);
    }
  }

  const results = cardPeriods.map((period) => {
    const { card, billStartDate, billEndDate, paymentDueDate } = period;
    const invoice = findInvoice(card.id, billStartDate, billEndDate);

    const totalAmount = invoice
      ? invoice.totalAmount
      : (txnsByCard.get(card.id) ?? [])
          .filter((t) => t.date >= billStartDate && t.date < billEndDate)
          .reduce((sum, t) => sum + t.amount, 0);

    return {
      cardId: card.id,
      cardName: card.name,
      billStartDate,
      billEndDate,
      paymentDueDate,
      totalAmount,
      invoice: invoice ?? null,
    };
  });

  return results.filter(
    (inv) =>
      !inv.invoice?.isPaid &&
      inv.totalAmount > 0 &&
      inv.billEndDate.getMonth() === currentMonth,
  );
}

export async function getNextBillAmounts() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  const creditCards = await db.credit_card.findMany({
    where: { userId: session.user.id },
  });

  if (creditCards.length === 0) return [];

  const cardIds = creditCards.map((c) => c.id);

  // Compute billing periods for all cards in JS (UTC dates, matching invoice storage)
  type CardPeriod = {
    card: (typeof creditCards)[0];
    billStartDate: Date;
    billEndDate: Date;
    paymentDueDate: Date;
    txnStart: Date; // transaction window start = billStartDate - 1 month
  };

  const cardPeriods: CardPeriod[] = creditCards.map((card) => {
    const g = card.billGenerationDate;
    let billStartDate: Date, billEndDate: Date, paymentDueDate: Date;

    if (currentDay >= g) {
      billStartDate = new Date(Date.UTC(currentYear, currentMonth, g));
      billEndDate = new Date(Date.UTC(currentYear, currentMonth + 1, g));
      paymentDueDate = new Date(
        Date.UTC(currentYear, currentMonth + 1, card.paymentDate),
      );
    } else {
      billStartDate = new Date(Date.UTC(currentYear, currentMonth - 1, g));
      billEndDate = new Date(Date.UTC(currentYear, currentMonth, g));
      paymentDueDate = new Date(
        Date.UTC(currentYear, currentMonth, card.paymentDate),
      );
    }

    const txnStart = new Date(billStartDate);
    txnStart.setMonth(txnStart.getMonth() - 1);

    return { card, billStartDate, billEndDate, paymentDueDate, txnStart };
  });

  // Batch invoice fetch — one query covering all cards' billing periods
  const allStarts = cardPeriods.map((p) => p.billStartDate.getTime());
  const allEnds = cardPeriods.map((p) => p.billEndDate.getTime());

  // Include 1 extra month of invoices in case some are paid → next period shown
  const rangeMax = new Date(Math.max(...allEnds));
  rangeMax.setMonth(rangeMax.getMonth() + 1);

  const allInvoices = await db.invoice.findMany({
    where: {
      creditCardId: { in: cardIds },
      billStartDate: { gte: new Date(Math.min(...allStarts) - 86_400_000) },
      billEndDate: { lte: rangeMax },
    },
  });

  const invoicesByCard = new Map<string, (typeof allInvoices)[number][]>();
  for (const inv of allInvoices) {
    const list = invoicesByCard.get(inv.creditCardId) ?? [];
    list.push(inv);
    invoicesByCard.set(inv.creditCardId, list);
  }

  function findInvoice(cardId: string, start: Date, end: Date) {
    return (
      (invoicesByCard.get(cardId) ?? []).find(
        (inv) =>
          inv.billStartDate.getTime() === start.getTime() &&
          inv.billEndDate.getTime() === end.getTime(),
      ) ?? null
    );
  }

  // Compute the broadest transaction date range across all cards and scenarios
  // (paid vs unpaid changes which window we need, but the union covers both)
  const txnTimestamps = cardPeriods.flatMap((p) => [
    p.txnStart.getTime(),
    p.billEndDate.getTime(),
  ]);
  const txnRangeMin = new Date(Math.min(...txnTimestamps));
  const txnRangeMax = new Date(Math.max(...txnTimestamps));

  // Batch transaction fetch — one query for all cards
  const allTransactions = await db.transaction.findMany({
    where: {
      creditCardId: { in: cardIds },
      date: { gte: txnRangeMin, lte: txnRangeMax },
      OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
    },
    select: { creditCardId: true, amount: true, date: true },
  });

  const txnsByCard = new Map<string, { amount: number; date: Date }[]>();
  for (const txn of allTransactions) {
    if (!txn.creditCardId) continue;
    const list = txnsByCard.get(txn.creditCardId) ?? [];
    list.push({ amount: txn.amount, date: txn.date });
    txnsByCard.set(txn.creditCardId, list);
  }

  return cardPeriods.map((period) => {
    const { card, billStartDate, billEndDate, paymentDueDate, txnStart } =
      period;
    const existingInvoice = findInvoice(card.id, billStartDate, billEndDate);

    let nextBillStartDate: Date,
      nextBillEndDate: Date,
      nextPaymentDueDate: Date;
    let txnFrom: Date, txnTo: Date;

    if (existingInvoice?.isPaid) {
      // Current invoice paid → shift view to next billing period
      nextBillStartDate = new Date(
        Date.UTC(
          billEndDate.getUTCFullYear(),
          billEndDate.getUTCMonth(),
          card.billGenerationDate,
        ),
      );
      nextBillEndDate = new Date(
        Date.UTC(
          nextBillStartDate.getUTCFullYear(),
          nextBillStartDate.getUTCMonth() + 1,
          card.billGenerationDate,
        ),
      );
      nextPaymentDueDate = new Date(
        Date.UTC(
          nextBillEndDate.getUTCFullYear(),
          nextBillEndDate.getUTCMonth(),
          card.paymentDate,
        ),
      );
      txnFrom = billStartDate;
      txnTo = billEndDate;
    } else {
      nextBillStartDate = billStartDate;
      nextBillEndDate = billEndDate;
      nextPaymentDueDate = paymentDueDate;
      txnFrom = txnStart;
      txnTo = billStartDate;
    }

    const totalAmount = (txnsByCard.get(card.id) ?? [])
      .filter((t) => t.date >= txnFrom && t.date < txnTo)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      cardId: card.id,
      nextBillStartDate,
      nextBillEndDate,
      nextPaymentDueDate,
      totalAmount,
    };
  });
}
