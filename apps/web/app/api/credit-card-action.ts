"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CreditCardSchema } from "@/lib/validations/credit-card";
import { PayInvoiceSchema } from "@/lib/validations/invoice";
import type { ActionResult } from "@/lib/validations";
import { checkCanAddCreditCard } from "@/lib/plan-guards";

export async function createCreditCard(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Plan limit check
  const guard = await checkCanAddCreditCard(session.user.id);
  if (!guard.allowed) {
    return {
      error: guard.reason ?? "Plan limit reached.",
      planLimitReached: true,
      requiredPlan: guard.requiredPlan,
    };
  }

  const parse = CreditCardSchema.safeParse({
    name: formData.get("name"),
    billGenerationDate: formData.get("billGenerationDate"),
    paymentDate: formData.get("paymentDate"),
    cardLimit: formData.get("cardLimit"),
    currency: formData.get("currency"),
  });
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }
  const { name, billGenerationDate, paymentDate, cardLimit, currency } =
    parse.data;

  await db.credit_card.create({
    data: {
      name,
      billGenerationDate,
      paymentDate,
      cardLimit,
      availableBalance: cardLimit, // Initialize available balance to card limit
      currency,
      userId: session.user.id,
    },
  });

  revalidatePath("/");
}

export async function updateCreditCard(
  cardId: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const card = await db.credit_card.findFirst({
    where: { id: cardId, userId: session.user.id },
  });

  if (!card) {
    throw new Error("Credit card not found or unauthorized");
  }

  const parse = CreditCardSchema.safeParse({
    name: formData.get("name"),
    billGenerationDate: formData.get("billGenerationDate"),
    paymentDate: formData.get("paymentDate"),
    cardLimit: formData.get("cardLimit"),
    currency: formData.get("currency"),
  });
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }
  const { name, billGenerationDate, paymentDate, cardLimit, currency } =
    parse.data;

  // Calculate the difference in card limit to adjust available balance
  const limitDifference = cardLimit - card.cardLimit;
  const newAvailableBalance = card.availableBalance + limitDifference;

  await db.credit_card.update({
    where: { id: cardId },
    data: {
      name,
      billGenerationDate,
      paymentDate,
      cardLimit,
      availableBalance: newAvailableBalance,
      currency,
    },
  });

  revalidatePath("/");
}

export async function getCreditCards() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const cards = await db.credit_card.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return cards;
}

export async function deleteCreditCard(cardId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const card = await db.credit_card.findFirst({
    where: { id: cardId, userId: session.user.id },
  });

  if (!card) {
    throw new Error("Credit card not found or unauthorized");
  }

  await db.credit_card.delete({
    where: { id: cardId },
  });

  revalidatePath("/");
}

export async function getCreditCardDetails(cardId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const card = await db.credit_card.findFirst({
    where: { id: cardId, userId: session.user.id },
    include: {
      transactions: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  if (!card) {
    throw new Error("Credit card not found or unauthorized");
  }

  return card;
}

export async function getUpcomingInvoice(
  cardId: string,
  month?: number,
  year?: number,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const card = await db.credit_card.findFirst({
    where: { id: cardId, userId: session.user.id },
  });

  if (!card) {
    throw new Error("Credit card not found or unauthorized");
  }

  // Calculate the billing period for the specified or current month
  const today = new Date();
  const targetMonth = month !== undefined ? month : today.getMonth();
  const targetYear = year !== undefined ? year : today.getFullYear();
  const currentDay = today.getDate();

  // Check if user is explicitly navigating to a specific month
  const isExplicitNavigation = month !== undefined && year !== undefined;

  // For navigation, we need to determine if we're viewing current month or historical
  const isCurrentMonth =
    targetMonth === today.getMonth() && targetYear === today.getFullYear();

  // Determine the billing period start and end dates (always use UTC to avoid timezone issues)
  let billStartDate: Date;
  let billEndDate: Date;
  let paymentDueDate: Date;

  // When explicitly navigating, always show the billing period for that month
  // When auto-detecting (month/year undefined), use current day logic
  if (
    !isExplicitNavigation &&
    isCurrentMonth &&
    currentDay >= card.billGenerationDate
  ) {
    // We're in the current billing period (auto-detect mode only)
    // But check if this period's invoice is already paid - if so, show next period
    const currentPeriodStart = new Date(
      Date.UTC(targetYear, targetMonth, card.billGenerationDate),
    );
    const currentPeriodEnd = new Date(
      Date.UTC(targetYear, targetMonth + 1, card.billGenerationDate),
    );

    const currentPeriodInvoice = await db.invoice.findUnique({
      where: {
        creditCardId_billStartDate_billEndDate: {
          creditCardId: cardId,
          billStartDate: currentPeriodStart,
          billEndDate: currentPeriodEnd,
        },
      },
    });

    // If current period invoice is paid, show next period
    if (currentPeriodInvoice?.isPaid) {
      billStartDate = new Date(
        Date.UTC(targetYear, targetMonth + 1, card.billGenerationDate),
      );
      billEndDate = new Date(
        Date.UTC(targetYear, targetMonth + 2, card.billGenerationDate),
      );
      paymentDueDate = new Date(
        Date.UTC(targetYear, targetMonth + 2, card.paymentDate),
      );
    } else {
      billStartDate = currentPeriodStart;
      billEndDate = currentPeriodEnd;
      paymentDueDate = new Date(
        Date.UTC(targetYear, targetMonth + 1, card.paymentDate),
      );
    }
  } else if (
    !isExplicitNavigation &&
    isCurrentMonth &&
    currentDay < card.billGenerationDate
  ) {
    // We're still in the previous billing period (auto-detect mode only)
    // But check if this period's invoice is already paid - if so, show current/next period
    const previousPeriodStart = new Date(
      Date.UTC(targetYear, targetMonth - 1, card.billGenerationDate),
    );
    const previousPeriodEnd = new Date(
      Date.UTC(targetYear, targetMonth, card.billGenerationDate),
    );

    const previousPeriodInvoice = await db.invoice.findUnique({
      where: {
        creditCardId_billStartDate_billEndDate: {
          creditCardId: cardId,
          billStartDate: previousPeriodStart,
          billEndDate: previousPeriodEnd,
        },
      },
    });

    // If previous period invoice is paid, show current period instead
    if (previousPeriodInvoice?.isPaid) {
      billStartDate = new Date(
        Date.UTC(targetYear, targetMonth, card.billGenerationDate),
      );
      billEndDate = new Date(
        Date.UTC(targetYear, targetMonth + 1, card.billGenerationDate),
      );
      paymentDueDate = new Date(
        Date.UTC(targetYear, targetMonth + 1, card.paymentDate),
      );
    } else {
      billStartDate = previousPeriodStart;
      billEndDate = previousPeriodEnd;
      paymentDueDate = new Date(
        Date.UTC(targetYear, targetMonth, card.paymentDate),
      );
    }
  } else {
    // Explicit navigation or historical/future month - use the target month
    billStartDate = new Date(
      Date.UTC(targetYear, targetMonth, card.billGenerationDate),
    );
    billEndDate = new Date(
      Date.UTC(targetYear, targetMonth + 1, card.billGenerationDate),
    );
    paymentDueDate = new Date(
      Date.UTC(targetYear, targetMonth + 1, card.paymentDate),
    );
  }

  // For credit cards, transactions appear on the NEXT billing cycle
  // So if the invoice period is Dec 10 - Jan 10, we fetch transactions from Nov 10 - Dec 10
  // Calculate the previous billing period start date (one month before billStartDate)
  const transactionStartDate = new Date(billStartDate);
  transactionStartDate.setMonth(transactionStartDate.getMonth() - 1);

  // The transaction end date is the billStartDate (inclusive: transactions ON the bill gen date
  // belong to this cycle, matching real-world credit card billing where the cut-off date is inclusive)
  const transactionEndDate = billStartDate;

  // Fetch transactions from the previous billing period (these will appear on this invoice).
  // Uses gt (exclusive) for start and lte (inclusive) for end so that a transaction on the
  // exact bill generation date falls into this cycle, not the next one (TC-04 boundary fix).
  // Exclude parent transactions (installmentNumber: 0) - only show actual installments
  const transactions = await db.transaction.findMany({
    where: {
      creditCardId: cardId,
      date: {
        gt: transactionStartDate,
        lte: transactionEndDate,
      },
      OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
    },
    orderBy: {
      date: "desc",
    },
  });

  // Calculate total amount
  const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);

  const existingInvoice = await db.invoice.findUnique({
    where: {
      creditCardId_billStartDate_billEndDate: {
        creditCardId: cardId,
        billStartDate,
        billEndDate,
      },
    },
    include: {
      paidFromBankAccount: true,
    },
  });

  return {
    billStartDate,
    billEndDate,
    paymentDueDate,
    transactions,
    totalAmount,
    card,
    invoice: existingInvoice,
    previousBalanceOwed: await (async () => {
      // If we already have a stored value use it
      if (existingInvoice?.previousBalanceOwed) {
        return existingInvoice.previousBalanceOwed;
      }
      // Otherwise lazily compute from the previous billing period's unpaid balance
      const prevBillStart = new Date(billStartDate);
      prevBillStart.setMonth(prevBillStart.getMonth() - 1);
      const prevInvoice = await db.invoice.findUnique({
        where: {
          creditCardId_billStartDate_billEndDate: {
            creditCardId: cardId,
            billStartDate: prevBillStart,
            billEndDate: billStartDate,
          },
        },
      });
      if (prevInvoice && !prevInvoice.isPaid) {
        const prevEffectiveTotal =
          prevInvoice.totalAmount +
          (prevInvoice.previousBalanceOwed ?? 0) -
          prevInvoice.creditFromPreviousMonth;
        return Math.max(0, prevEffectiveTotal - prevInvoice.paidAmount);
      }
      return 0;
    })(),
  };
}

export async function payInvoice(
  cardId: string,
  bankAccountId: string,
  billStartDate: Date,
  billEndDate: Date,
  paymentDueDate: Date,
  paymentAmount: number, // the amount being paid now (not the invoice total)
): Promise<ActionResult> {
  const parse = PayInvoiceSchema.safeParse({
    cardId,
    bankAccountId,
    billStartDate,
    billEndDate,
    paymentDueDate,
    paymentAmount,
  });
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify card belongs to user
  const card = await db.credit_card.findUnique({
    where: { id: cardId },
  });

  if (!card || card.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Verify bank account belongs to user
  const bankAccount = await db.bank_account.findUnique({
    where: { id: bankAccountId },
  });

  if (!bankAccount || bankAccount.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Check if bank account has sufficient balance
  if (bankAccount.currentBalance < paymentAmount) {
    throw new Error("Insufficient balance in bank account");
  }

  // Compute the actual invoice total from DB transactions using the correct billing window.
  // Transactions for a bill starting on billStartDate come from the PREVIOUS month's window:
  // gt: billStartDate - 1 month, lte: billStartDate
  const transactionWindowStart = new Date(billStartDate);
  transactionWindowStart.setMonth(transactionWindowStart.getMonth() - 1);

  const invoiceTransactions = await db.transaction.findMany({
    where: {
      creditCardId: cardId,
      date: { gt: transactionWindowStart, lte: billStartDate },
      OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
    },
  });
  const invoiceTransactionTotal = invoiceTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );

  // Check if invoice already exists and is paid
  const existingInvoice = await db.invoice.findUnique({
    where: {
      creditCardId_billStartDate_billEndDate: {
        creditCardId: cardId,
        billStartDate,
        billEndDate,
      },
    },
  });

  if (existingInvoice?.isPaid) {
    throw new Error("Invoice is already fully paid");
  }

  const currentPaidAmount = existingInvoice?.paidAmount ?? 0;
  const creditFromPreviousMonth = existingInvoice?.creditFromPreviousMonth ?? 0;

  // Determine previousBalanceOwed: if the invoice already exists, use its stored value.
  // For the first payment, check the previous billing period for any unpaid carry-forward.
  let previousBalanceOwed = existingInvoice?.previousBalanceOwed ?? 0;
  if (!existingInvoice) {
    const prevBillStart = new Date(billStartDate);
    prevBillStart.setMonth(prevBillStart.getMonth() - 1);

    const prevInvoice = await db.invoice.findUnique({
      where: {
        creditCardId_billStartDate_billEndDate: {
          creditCardId: cardId,
          billStartDate: prevBillStart,
          billEndDate: billStartDate,
        },
      },
    });

    if (prevInvoice && !prevInvoice.isPaid) {
      const prevEffectiveTotal =
        prevInvoice.totalAmount +
        (prevInvoice.previousBalanceOwed ?? 0) -
        prevInvoice.creditFromPreviousMonth;
      previousBalanceOwed = Math.max(
        0,
        prevEffectiveTotal - prevInvoice.paidAmount,
      );
    }
  }

  // Effective total = DB transaction total + previous unpaid balance - overpayment credit
  const invoiceTotal = invoiceTransactionTotal;
  const effectiveTotal = Math.max(
    0,
    invoiceTotal + previousBalanceOwed - creditFromPreviousMonth,
  );
  const newPaidAmount = currentPaidAmount + paymentAmount;
  const isFullyPaid = newPaidAmount >= effectiveTotal;
  const overpaymentAmount = Math.max(0, newPaidAmount - effectiveTotal);

  // Perform the payment in a transaction
  await db.$transaction(async (tx) => {
    // Deduct amount from bank account
    await tx.bank_account.update({
      where: { id: bankAccountId },
      data: {
        currentBalance: {
          decrement: paymentAmount,
        },
      },
    });

    // Restore credit card available balance
    await tx.credit_card.update({
      where: { id: cardId },
      data: {
        availableBalance: {
          increment: paymentAmount,
        },
      },
    });

    // Create or update invoice record with DB-computed totals
    if (existingInvoice) {
      await tx.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          totalAmount: invoiceTotal,
          previousBalanceOwed,
          paidAmount: newPaidAmount,
          isPaid: isFullyPaid,
          paidAt: isFullyPaid ? new Date() : existingInvoice.paidAt,
          paidFromBankAccountId: bankAccountId,
        },
      });
    } else {
      await tx.invoice.create({
        data: {
          creditCardId: cardId,
          billStartDate,
          billEndDate,
          paymentDueDate,
          totalAmount: invoiceTotal,
          previousBalanceOwed,
          paidAmount: paymentAmount,
          isPaid: isFullyPaid,
          paidAt: isFullyPaid ? new Date() : null,
          paidFromBankAccountId: bankAccountId,
        },
      });
    }

    // If there's an overpayment, carry the credit forward to the next invoice
    if (overpaymentAmount > 0) {
      const nextBillStartDate = new Date(billEndDate);
      const nextBillEndDate = new Date(billEndDate);
      nextBillEndDate.setMonth(nextBillEndDate.getMonth() + 1);

      const nextPaymentDueDate = new Date(paymentDueDate);
      nextPaymentDueDate.setMonth(nextPaymentDueDate.getMonth() + 1);

      const nextInvoice = await tx.invoice.findUnique({
        where: {
          creditCardId_billStartDate_billEndDate: {
            creditCardId: cardId,
            billStartDate: nextBillStartDate,
            billEndDate: nextBillEndDate,
          },
        },
      });

      if (nextInvoice) {
        const nextInvoiceCreditFromPrevious =
          nextInvoice.creditFromPreviousMonth + overpaymentAmount;
        const nextEffectiveTotal = Math.max(
          0,
          nextInvoice.totalAmount +
            (nextInvoice.previousBalanceOwed ?? 0) -
            nextInvoiceCreditFromPrevious,
        );
        const nextInvoiceIsFullyPaid =
          nextInvoice.paidAmount >= nextEffectiveTotal;

        await tx.invoice.update({
          where: { id: nextInvoice.id },
          data: {
            creditFromPreviousMonth: nextInvoiceCreditFromPrevious,
            isPaid: nextInvoiceIsFullyPaid,
            paidAt: nextInvoiceIsFullyPaid ? new Date() : nextInvoice.paidAt,
          },
        });
      } else {
        // Fetch next period's transaction total using the correct billing window:
        // transactions for nextBillStartDate come from: gt: billStartDate, lte: nextBillStartDate
        const nextPeriodTransactions = await tx.transaction.findMany({
          where: {
            creditCardId: cardId,
            date: { gt: billStartDate, lte: nextBillStartDate },
            OR: [{ installmentNumber: null }, { installmentNumber: { gt: 0 } }],
          },
        });

        const nextPeriodTotal = nextPeriodTransactions.reduce(
          (sum, txn) => sum + txn.amount,
          0,
        );
        const nextEffectiveTotal = Math.max(
          0,
          nextPeriodTotal - overpaymentAmount,
        );
        const nextInvoiceIsFullyPaid = overpaymentAmount >= nextPeriodTotal;

        await tx.invoice.create({
          data: {
            creditCardId: cardId,
            billStartDate: nextBillStartDate,
            billEndDate: nextBillEndDate,
            paymentDueDate: nextPaymentDueDate,
            totalAmount: nextPeriodTotal,
            creditFromPreviousMonth: overpaymentAmount,
            paidAmount: 0,
            isPaid: nextInvoiceIsFullyPaid,
            paidAt: nextInvoiceIsFullyPaid ? new Date() : null,
          },
        });
      }
    }
  });

  revalidatePath("/");
  revalidatePath(`/credit-card/${cardId}`);
}
