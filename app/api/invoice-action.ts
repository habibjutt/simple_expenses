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
