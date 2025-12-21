"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createTransaction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const category = formData.get("category") as string;
  const creditCardId = formData.get("creditCardId") as string;
  const bankAccountId = formData.get("bankAccountId") as string;
  const installments = parseInt(formData.get("installments") as string) || 1;

  if (!name || isNaN(amount) || !date || !category) {
    throw new Error("Invalid input");
  }

  if (!creditCardId && !bankAccountId) {
    throw new Error("Either credit card or bank account must be selected");
  }

  if (creditCardId && bankAccountId) {
    throw new Error("Cannot use both credit card and bank account for the same transaction");
  }

  // Allow negative amounts for income transactions
  if (amount === 0) {
    throw new Error("Amount cannot be zero");
  }

  if (installments < 1) {
    throw new Error("Installments must be at least 1");
  }

  if (creditCardId) {
    // Verify the credit card belongs to the user
    const creditCard = await db.credit_card.findFirst({
      where: {
        id: creditCardId,
        userId: session.user.id,
      },
    });

    if (!creditCard) {
      throw new Error("Credit card not found or unauthorized");
    }

    // For expenses (positive amounts), reduce available balance
    // Credit cards don't receive income, so negative amounts are not allowed
    if (amount < 0) {
      throw new Error("Credit cards cannot receive income");
    }

    // Check if there's enough available balance
    const newAvailableBalance = creditCard.availableBalance - amount;
    if (newAvailableBalance < 0) {
      throw new Error(
        `Insufficient credit limit. Available: ${creditCard.availableBalance}, Requested: ${amount}`
      );
    }

    // Create transaction and update credit card balance in a transaction
    await db.$transaction([
      db.transaction.create({
        data: {
          name,
          amount,
          date: new Date(date),
          category,
          installments,
          creditCardId,
        },
      }),
      db.credit_card.update({
        where: { id: creditCardId },
        data: {
          availableBalance: newAvailableBalance,
        },
      }),
    ]);
  } else if (bankAccountId) {
    // Verify the bank account belongs to the user
    const bankAccount = await db.bank_account.findFirst({
      where: {
        id: bankAccountId,
        userId: session.user.id,
      },
    });

    if (!bankAccount) {
      throw new Error("Bank account not found or unauthorized");
    }

    // For expenses (positive amounts), reduce balance
    // For income (negative amounts), increase balance
    const newBalance = bankAccount.currentBalance - amount;
    
    // Only check for sufficient funds if it's an expense (positive amount)
    if (amount > 0 && newBalance < 0) {
      throw new Error(
        `Insufficient funds. Available: ${bankAccount.currentBalance}, Requested: ${amount}`
      );
    }

    // Create transaction and update bank account balance in a transaction
    await db.$transaction([
      db.transaction.create({
        data: {
          name,
          amount,
          date: new Date(date),
          category,
          installments,
          bankAccountId,
        },
      }),
      db.bank_account.update({
        where: { id: bankAccountId },
        data: {
          currentBalance: newBalance,
        },
      }),
    ]);
  }

  revalidatePath("/");
}

export async function createTransfer(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const fromAccountId = formData.get("fromAccountId") as string;
  const toAccountId = formData.get("toAccountId") as string;

  if (!name || isNaN(amount) || !date) {
    throw new Error("Invalid input");
  }

  if (!fromAccountId || !toAccountId) {
    throw new Error("Both source and destination accounts must be selected");
  }

  if (fromAccountId === toAccountId) {
    throw new Error("Source and destination accounts must be different");
  }

  if (amount <= 0) {
    throw new Error("Transfer amount must be greater than 0");
  }

  // Verify both accounts belong to the user
  const fromAccount = await db.bank_account.findFirst({
    where: {
      id: fromAccountId,
      userId: session.user.id,
    },
  });

  const toAccount = await db.bank_account.findFirst({
    where: {
      id: toAccountId,
      userId: session.user.id,
    },
  });

  if (!fromAccount) {
    throw new Error("Source account not found or unauthorized");
  }

  if (!toAccount) {
    throw new Error("Destination account not found or unauthorized");
  }

  // Check if source account has enough balance
  const newFromBalance = fromAccount.currentBalance - amount;
  if (newFromBalance < 0) {
    throw new Error(
      `Insufficient funds in source account. Available: ${fromAccount.currentBalance}, Requested: ${amount}`
    );
  }

  // Perform the transfer
  await db.$transaction([
    // Debit from source account
    db.transaction.create({
      data: {
        name: `Transfer to ${toAccount.name}: ${name || "Transfer"}`,
        amount,
        date: new Date(date),
        category: "Transfer",
        installments: 1,
        bankAccountId: fromAccountId,
      },
    }),
    db.bank_account.update({
      where: { id: fromAccountId },
      data: {
        currentBalance: newFromBalance,
      },
    }),
    // Credit to destination account
    db.transaction.create({
      data: {
        name: `Transfer from ${fromAccount.name}: ${name || "Transfer"}`,
        amount: -amount, // Negative amount to increase balance
        date: new Date(date),
        category: "Transfer",
        installments: 1,
        bankAccountId: toAccountId,
      },
    }),
    db.bank_account.update({
      where: { id: toAccountId },
      data: {
        currentBalance: toAccount.currentBalance + amount,
      },
    }),
  ]);

  revalidatePath("/");
}

export async function getTransactions(creditCardId?: string, bankAccountId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const transactions = await db.transaction.findMany({
    where: creditCardId
      ? {
          creditCardId,
          creditCard: {
            userId: session.user.id,
          },
        }
      : bankAccountId
      ? {
          bankAccountId,
          bankAccount: {
            userId: session.user.id,
          },
        }
      : {
          OR: [
            {
              creditCard: {
                userId: session.user.id,
              },
            },
            {
              bankAccount: {
                userId: session.user.id,
              },
            },
          ],
        },
    include: {
      creditCard: {
        select: {
          name: true,
        },
      },
      bankAccount: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return transactions;
}

export async function deleteTransaction(transactionId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the transaction to verify ownership and get the amount to refund
  const transaction = await db.transaction.findFirst({
    where: {
      id: transactionId,
      OR: [
        {
          creditCard: {
            userId: session.user.id,
          },
        },
        {
          bankAccount: {
            userId: session.user.id,
          },
        },
      ],
    },
    include: {
      creditCard: true,
      bankAccount: true,
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found or unauthorized");
  }

  // Refund the amount when deleting
  if (transaction.creditCardId && transaction.creditCard) {
    // For credit card: add the amount back to available balance
    await db.$transaction([
      db.credit_card.update({
        where: { id: transaction.creditCardId },
        data: {
          availableBalance: transaction.creditCard.availableBalance + transaction.amount,
        },
      }),
      db.transaction.delete({
        where: { id: transactionId },
      }),
    ]);
  } else if (transaction.bankAccountId && transaction.bankAccount) {
    // For bank account: subtract the amount to reverse the original operation
    // (if it was an expense, balance increases; if it was income, balance decreases)
    await db.$transaction([
      db.bank_account.update({
        where: { id: transaction.bankAccountId },
        data: {
          currentBalance: transaction.bankAccount.currentBalance - transaction.amount,
        },
      }),
      db.transaction.delete({
        where: { id: transactionId },
      }),
    ]);
  }

  revalidatePath("/");
}

export async function updateTransaction(transactionId: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const newAmount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const category = formData.get("category") as string;
  const newInstallments = parseInt(formData.get("installments") as string) || 1;

  if (!name || isNaN(newAmount) || !date || !category) {
    throw new Error("Invalid input");
  }

  if (newAmount === 0) {
    throw new Error("Amount cannot be zero");
  }

  if (newInstallments < 1) {
    throw new Error("Installments must be at least 1");
  }

  // Get the existing transaction
  const existingTransaction = await db.transaction.findFirst({
    where: {
      id: transactionId,
      OR: [
        {
          creditCard: {
            userId: session.user.id,
          },
        },
        {
          bankAccount: {
            userId: session.user.id,
          },
        },
      ],
    },
    include: {
      creditCard: true,
      bankAccount: true,
    },
  });

  if (!existingTransaction) {
    throw new Error("Transaction not found or unauthorized");
  }

  const amountDifference = newAmount - existingTransaction.amount;

  // Update transaction and adjust balances
  if (existingTransaction.creditCardId && existingTransaction.creditCard) {
    // For credit cards, negative amounts (income) are not allowed
    if (newAmount < 0) {
      throw new Error("Credit cards cannot receive income");
    }

    const newAvailableBalance = existingTransaction.creditCard.availableBalance - amountDifference;
    
    if (newAvailableBalance < 0) {
      throw new Error(
        `Insufficient credit limit. Available: ${existingTransaction.creditCard.availableBalance}, Additional needed: ${amountDifference}`
      );
    }

    await db.$transaction([
      db.transaction.update({
        where: { id: transactionId },
        data: {
          name,
          amount: newAmount,
          date: new Date(date),
          category,
          installments: newInstallments,
        },
      }),
      db.credit_card.update({
        where: { id: existingTransaction.creditCardId },
        data: {
          availableBalance: newAvailableBalance,
        },
      }),
    ]);
  } else if (existingTransaction.bankAccountId && existingTransaction.bankAccount) {
    const newBalance = existingTransaction.bankAccount.currentBalance - amountDifference;
    
    // Only check for sufficient funds if the new amount increases the expense
    if (amountDifference > 0 && newBalance < 0) {
      throw new Error(
        `Insufficient funds. Available: ${existingTransaction.bankAccount.currentBalance}, Additional needed: ${amountDifference}`
      );
    }

    await db.$transaction([
      db.transaction.update({
        where: { id: transactionId },
        data: {
          name,
          amount: newAmount,
          date: new Date(date),
          category,
          installments: newInstallments,
        },
      }),
      db.bank_account.update({
        where: { id: existingTransaction.bankAccountId },
        data: {
          currentBalance: newBalance,
        },
      }),
    ]);
  }

  revalidatePath("/");
}
