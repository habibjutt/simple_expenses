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

  // Determine the billing period start and end dates (always use UTC to avoid timezone issues)
  let billStartDate: Date;
  let billEndDate: Date;
  let paymentDueDate: Date;

  if (isCurrentMonth && currentDay >= card.billGenerationDate) {
    // We're in the current billing period
    billStartDate = new Date(Date.UTC(targetYear, targetMonth, card.billGenerationDate));
    billEndDate = new Date(Date.UTC(targetYear, targetMonth + 1, card.billGenerationDate));
    paymentDueDate = new Date(Date.UTC(targetYear, targetMonth + 1, card.paymentDate));
  } else if (isCurrentMonth && currentDay < card.billGenerationDate) {
    // We're still in the previous billing period
    billStartDate = new Date(Date.UTC(targetYear, targetMonth - 1, card.billGenerationDate));
    billEndDate = new Date(Date.UTC(targetYear, targetMonth, card.billGenerationDate));
    paymentDueDate = new Date(Date.UTC(targetYear, targetMonth, card.paymentDate));
  } else {
    // Historical or future month - use the target month
    billStartDate = new Date(Date.UTC(targetYear, targetMonth, card.billGenerationDate));
    billEndDate = new Date(Date.UTC(targetYear, targetMonth + 1, card.billGenerationDate));
    paymentDueDate = new Date(Date.UTC(targetYear, targetMonth + 1, card.paymentDate));
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
  console.log('=== QUERYING DATABASE ===');
  console.log('cardId:', cardId);
  console.log('billStartDate:', billStartDate);
  console.log('billEndDate:', billEndDate);
  console.log('billStartDate ISO:', billStartDate.toISOString());
  console.log('billEndDate ISO:', billEndDate.toISOString());
  
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

  console.log('=== SERVER: Invoice from DB ===');
  console.log('Invoice:', existingInvoice);
  console.log('isPaid:', existingInvoice?.isPaid);
  console.log('paidAt:', existingInvoice?.paidAt);
  console.log('paidAmount:', existingInvoice?.paidAmount);
  console.log('totalAmount:', existingInvoice?.totalAmount);

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
    throw new Error("Invoice is already fully paid");
  }

  // Check if this would be a partial or full payment, or an overpayment
  const currentPaidAmount = existingInvoice?.paidAmount || 0;
  const creditFromPreviousMonth = existingInvoice?.creditFromPreviousMonth || 0;
  const invoiceTotal = existingInvoice?.totalAmount || totalAmount;
  
  // Actual amount owed is invoice total minus any credit from previous month
  const amountOwed = invoiceTotal - creditFromPreviousMonth;
  const totalPaidSoFar = currentPaidAmount;
  const remainingAmount = amountOwed - totalPaidSoFar;
  const newPaidAmount = currentPaidAmount + totalAmount;
  
  // Invoice is fully paid if total paid (including new payment) >= amount owed
  const isFullyPaid = newPaidAmount >= amountOwed;
  const overpaymentAmount = Math.max(0, newPaidAmount - amountOwed);

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

    // Restore credit card available balance for the full payment (including overpayment)
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
          paidAmount: newPaidAmount,
          isPaid: isFullyPaid,
          paidAt: isFullyPaid ? new Date() : existingInvoice.paidAt,
          paidFromBankAccountId: bankAccountId,
          totalAmount: existingInvoice.totalAmount, // Keep the original total
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
          paidAmount: totalAmount,
          isPaid: true,
          paidAt: new Date(),
          paidFromBankAccountId: bankAccountId,
        },
      });
    }

    // If there's an overpayment, apply it to the next invoice
    if (overpaymentAmount > 0) {
      // Calculate next billing period
      const nextBillStartDate = new Date(billEndDate);
      const nextBillEndDate = new Date(billEndDate);
      nextBillEndDate.setMonth(nextBillEndDate.getMonth() + 1);
      
      const nextPaymentDueDate = new Date(paymentDueDate);
      nextPaymentDueDate.setMonth(nextPaymentDueDate.getMonth() + 1);

      // Check if next invoice already exists
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
        // Update existing next invoice with the overpayment credit
        const nextInvoiceCreditFromPrevious = nextInvoice.creditFromPreviousMonth + overpaymentAmount;
        const nextInvoiceAmountOwed = nextInvoice.totalAmount - nextInvoiceCreditFromPrevious;
        const nextInvoiceIsFullyPaid = nextInvoice.paidAmount >= nextInvoiceAmountOwed;
        
        await tx.invoice.update({
          where: { id: nextInvoice.id },
          data: {
            creditFromPreviousMonth: nextInvoiceCreditFromPrevious,
            isPaid: nextInvoiceIsFullyPaid,
            paidAt: nextInvoiceIsFullyPaid ? new Date() : nextInvoice.paidAt,
          },
        });
      } else {
        // Create a new invoice for the next period with the overpayment as credit
        // Calculate total amount from transactions in next period
        const nextPeriodTransactions = await tx.transaction.findMany({
          where: {
            creditCardId: cardId,
            date: {
              gte: nextBillStartDate,
              lt: nextBillEndDate,
            },
            OR: [
              { installmentNumber: null },
              { installmentNumber: { gt: 0 } },
            ],
          },
        });
        
        const nextPeriodTotal = nextPeriodTransactions.reduce((sum, txn) => sum + txn.amount, 0);
        const nextInvoiceAmountOwed = nextPeriodTotal - overpaymentAmount;
        const nextInvoiceIsFullyPaid = overpaymentAmount >= nextPeriodTotal;
        
        await tx.invoice.create({
          data: {
            creditCardId: cardId,
            billStartDate: nextBillStartDate,
            billEndDate: nextBillEndDate,
            paymentDueDate: nextPaymentDueDate,
            totalAmount: nextPeriodTotal,
            creditFromPreviousMonth: overpaymentAmount,
            paidAmount: 0, // The credit is separate from paid amount
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

export async function debugListInvoices(cardId: string) {
  const invoices = await db.invoice.findMany({
    where: { creditCardId: cardId },
    orderBy: { billStartDate: 'desc' },
  });
  
  console.log(`\n=== ALL INVOICES FOR CARD ${cardId} ===`);
  invoices.forEach((inv, idx) => {
    console.log(`\nInvoice ${idx + 1}:`);
    console.log(`  billStartDate: ${inv.billStartDate.toISOString()}`);
    console.log(`  billEndDate: ${inv.billEndDate.toISOString()}`);
    console.log(`  isPaid: ${inv.isPaid}`);
    console.log(`  paidAt: ${inv.paidAt?.toISOString()}`);
    console.log(`  totalAmount: ${inv.totalAmount}`);
    console.log(`  paidAmount: ${inv.paidAmount}`);
  });
  
  return invoices.map(inv => ({
    billStartDate: inv.billStartDate.toISOString(),
    billEndDate: inv.billEndDate.toISOString(),
    isPaid: inv.isPaid,
    paidAt: inv.paidAt?.toISOString(),
    totalAmount: inv.totalAmount,
    paidAmount: inv.paidAmount,
  }));
}
