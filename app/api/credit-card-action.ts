"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createCreditCard(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const billGenerationDate = parseInt(
    formData.get("billGenerationDate") as string
  );
  const paymentDate = parseInt(formData.get("paymentDate") as string);
  const cardLimit = parseFloat(formData.get("cardLimit") as string);

  if (!name || isNaN(billGenerationDate) || isNaN(paymentDate) || isNaN(cardLimit)) {
    throw new Error("Invalid input");
  }

  if (billGenerationDate < 1 || billGenerationDate > 31) {
    throw new Error("Bill generation date must be between 1 and 31");
  }

  if (paymentDate < 1 || paymentDate > 31) {
    throw new Error("Payment date must be between 1 and 31");
  }

  if (cardLimit <= 0) {
    throw new Error("Card limit must be greater than 0");
  }

  await db.credit_card.create({
    data: {
      name,
      billGenerationDate,
      paymentDate,
      cardLimit,
      availableBalance: cardLimit, // Initialize available balance to card limit
      userId: session.user.id,
    },
  });

  revalidatePath("/");
}

export async function updateCreditCard(cardId: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const card = await db.credit_card.findUnique({
    where: { id: cardId },
  });

  if (!card) {
    throw new Error("Credit card not found");
  }

  if (card.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const billGenerationDate = parseInt(
    formData.get("billGenerationDate") as string
  );
  const paymentDate = parseInt(formData.get("paymentDate") as string);
  const cardLimit = parseFloat(formData.get("cardLimit") as string);

  if (!name || isNaN(billGenerationDate) || isNaN(paymentDate) || isNaN(cardLimit)) {
    throw new Error("Invalid input");
  }

  if (billGenerationDate < 1 || billGenerationDate > 31) {
    throw new Error("Bill generation date must be between 1 and 31");
  }

  if (paymentDate < 1 || paymentDate > 31) {
    throw new Error("Payment date must be between 1 and 31");
  }

  if (cardLimit <= 0) {
    throw new Error("Card limit must be greater than 0");
  }

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

  const card = await db.credit_card.findUnique({
    where: { id: cardId },
  });

  if (!card) {
    throw new Error("Credit card not found");
  }

  if (card.userId !== session.user.id) {
    throw new Error("Unauthorized");
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

  const card = await db.credit_card.findUnique({
    where: { id: cardId },
    include: {
      transactions: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  if (!card) {
    throw new Error("Credit card not found");
  }

  if (card.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  return card;
}

export async function getUpcomingInvoice(cardId: string, month?: number, year?: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const card = await db.credit_card.findUnique({
    where: { id: cardId },
  });

  if (!card) {
    throw new Error("Credit card not found");
  }

  if (card.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Calculate the billing period for the specified or current month
  const today = new Date();
  const targetMonth = month !== undefined ? month : today.getMonth();
  const targetYear = year !== undefined ? year : today.getFullYear();
  const currentDay = today.getDate();
  
  // For navigation, we need to determine if we're viewing current month or historical
  const isCurrentMonth = targetMonth === today.getMonth() && targetYear === today.getFullYear();

  // Determine the billing period start and end dates
  let billStartDate: Date;
  let billEndDate: Date;
  let paymentDueDate: Date;

  if (isCurrentMonth && currentDay >= card.billGenerationDate) {
    // We're in the current billing period
    billStartDate = new Date(targetYear, targetMonth, card.billGenerationDate);
    billEndDate = new Date(targetYear, targetMonth + 1, card.billGenerationDate);
    paymentDueDate = new Date(targetYear, targetMonth + 1, card.paymentDate);
  } else if (isCurrentMonth && currentDay < card.billGenerationDate) {
    // We're still in the previous billing period
    billStartDate = new Date(targetYear, targetMonth - 1, card.billGenerationDate);
    billEndDate = new Date(targetYear, targetMonth, card.billGenerationDate);
    paymentDueDate = new Date(targetYear, targetMonth, card.paymentDate);
  } else {
    // Historical or future month - use the target month
    billStartDate = new Date(targetYear, targetMonth, card.billGenerationDate);
    billEndDate = new Date(targetYear, targetMonth + 1, card.billGenerationDate);
    paymentDueDate = new Date(targetYear, targetMonth + 1, card.paymentDate);
  }

  // For credit cards, transactions appear on the NEXT billing cycle
  // So if the invoice period is Dec 10 - Jan 10, we fetch transactions from Nov 10 - Dec 10
  // Calculate the previous billing period start date (one month before billStartDate)
  const transactionStartDate = new Date(billStartDate);
  transactionStartDate.setMonth(transactionStartDate.getMonth() - 1);
  
  // The transaction end date is the billStartDate (transactions up to but not including billStartDate)
  const transactionEndDate = billStartDate;

  // Fetch transactions from the previous billing period (these will appear on this invoice)
  // Exclude parent transactions (installmentNumber: 0) - only show actual installments
  const transactions = await db.transaction.findMany({
    where: {
      creditCardId: cardId,
      date: {
        gte: transactionStartDate,
        lt: transactionEndDate,
      },
      OR: [
        { installmentNumber: null },
        { installmentNumber: { gt: 0 } },
      ],
    },
    orderBy: {
      date: "desc",
    },
  });

  // Calculate total amount
  const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);

  // Check if there's an existing invoice record for this period
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
  };
}

export async function payInvoice(
  cardId: string,
  bankAccountId: string,
  billStartDate: Date,
  billEndDate: Date,
  paymentDueDate: Date,
  totalAmount: number
) {
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
  if (bankAccount.currentBalance < totalAmount) {
    throw new Error("Insufficient balance in bank account");
  }

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
    throw new Error("Invoice is already paid");
  }

  // Perform the payment in a transaction
  await db.$transaction(async (tx) => {
    // Deduct amount from bank account
    await tx.bank_account.update({
      where: { id: bankAccountId },
      data: {
        currentBalance: {
          decrement: totalAmount,
        },
      },
    });

    // Restore credit card available balance
    await tx.credit_card.update({
      where: { id: cardId },
      data: {
        availableBalance: {
          increment: totalAmount,
        },
      },
    });

    // Create or update invoice record
    if (existingInvoice) {
      await tx.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paidFromBankAccountId: bankAccountId,
          totalAmount,
        },
      });
    } else {
      await tx.invoice.create({
        data: {
          creditCardId: cardId,
          billStartDate,
          billEndDate,
          paymentDueDate,
          totalAmount,
          isPaid: true,
          paidAt: new Date(),
          paidFromBankAccountId: bankAccountId,
        },
      });
    }
  });

  revalidatePath("/");
  revalidatePath(`/credit-card/${cardId}`);
}

