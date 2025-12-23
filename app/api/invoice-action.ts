"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function deleteInvoice(invoiceId: string) {
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
      // Return the money to the bank account
      await tx.bank_account.update({
        where: { id: invoice.paidFromBankAccountId! },
        data: {
          currentBalance: {
            increment: invoice.totalAmount,
          },
        },
      });

      // Deduct the amount from the credit card available balance
      // (reversing the payment that restored the balance)
      await tx.credit_card.update({
        where: { id: invoice.creditCardId },
        data: {
          availableBalance: {
            decrement: invoice.totalAmount,
          },
        },
      });

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
  newBankAccountId: string | null
) {
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
      if (newBankAccountId && newBankAccountId !== invoice.paidFromBankAccountId) {
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

export async function unpayInvoice(invoiceId: string) {
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
    // Return the money to the bank account
    await tx.bank_account.update({
      where: { id: invoice.paidFromBankAccountId! },
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

  // Get all credit cards for the user
  const creditCards = await db.credit_card.findMany({
    where: {
      userId: session.user.id,
    },
  });

  // For each card, calculate the current billing period and get invoice
  const invoices = await Promise.all(
    creditCards.map(async (card) => {
      const currentDay = today.getDate();
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

      // Get invoice for this period
      const invoice = await db.invoice.findUnique({
        where: {
          creditCardId_billStartDate_billEndDate: {
            creditCardId: card.id,
            billStartDate,
            billEndDate,
          },
        },
      });

      // If no invoice exists, calculate total from transactions
      let totalAmount = 0;
      if (!invoice) {
        const transactions = await db.transaction.findMany({
          where: {
            creditCardId: card.id,
            date: {
              gte: billStartDate,
              lt: billEndDate,
            },
            OR: [
              { installmentNumber: null },
              { installmentNumber: { gt: 0 } },
            ],
          },
        });
        totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);
      } else {
        totalAmount = invoice.totalAmount;
      }

      return {
        cardId: card.id,
        cardName: card.name,
        billStartDate,
        billEndDate,
        paymentDueDate,
        totalAmount,
        invoice: invoice || null,
      };
    })
  );

  // Filter to only unpaid invoices with amount > 0 AND where the bill end date is in the current month
  return invoices.filter(
    (inv) => !inv.invoice?.isPaid && inv.totalAmount > 0 && inv.billEndDate.getMonth() === currentMonth
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

  // Get all credit cards for the user
  const creditCards = await db.credit_card.findMany({
    where: {
      userId: session.user.id,
    },
  });

  // For each card, calculate the upcoming/next billing period
  const nextBills = await Promise.all(
    creditCards.map(async (card) => {
      // Determine what the current/upcoming bill period is
      let billStartDate: Date;
      let billEndDate: Date;
      let paymentDueDate: Date;

      if (currentDay >= card.billGenerationDate) {
        // We're in the current billing period
        billStartDate = new Date(currentYear, currentMonth, card.billGenerationDate);
        billEndDate = new Date(currentYear, currentMonth + 1, card.billGenerationDate);
        paymentDueDate = new Date(currentYear, currentMonth + 1, card.paymentDate);
      } else {
        // We're still in the previous billing period
        billStartDate = new Date(currentYear, currentMonth - 1, card.billGenerationDate);
        billEndDate = new Date(currentYear, currentMonth, card.billGenerationDate);
        paymentDueDate = new Date(currentYear, currentMonth, card.paymentDate);
      }

      // For credit cards, transactions appear on the NEXT billing cycle
      // So for the upcoming invoice (billStartDate to billEndDate with payment due on paymentDueDate),
      // we need to fetch transactions from the PREVIOUS billing period
      const transactionStartDate = new Date(billStartDate);
      transactionStartDate.setMonth(transactionStartDate.getMonth() - 1);
      const transactionEndDate = billStartDate;

      // Fetch transactions from the previous billing period that will appear on the upcoming invoice
      // Exclude parent transactions (installmentNumber: 0) - only show actual installments
      const transactions = await db.transaction.findMany({
        where: {
          creditCardId: card.id,
          date: {
            gte: transactionStartDate,
            lt: transactionEndDate,
          },
          OR: [
            { installmentNumber: null },
            { installmentNumber: { gt: 0 } },
          ],
        },
      });

      const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);

      return {
        cardId: card.id,
        nextBillStartDate: billStartDate,
        nextBillEndDate: billEndDate,
        nextPaymentDueDate: paymentDueDate,
        totalAmount,
      };
    })
  );

  return nextBills;
}
