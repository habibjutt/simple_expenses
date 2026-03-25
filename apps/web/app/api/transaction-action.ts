"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  CreateTransactionSchema,
  CreateTransferSchema,
  UpdateTransactionSchema,
} from "@/lib/validations/transaction";
import type { ActionResult } from "@/lib/validations";
import { checkCanAddTransaction } from "@/lib/plan-guards";

// Compute the next recurrence date from a base date + frequency
function computeNextRecurDate(from: Date, frequency: string): Date {
  const next = new Date(from);
  switch (frequency) {
    case "daily":   next.setDate(next.getDate() + 1); break;
    case "weekly":  next.setDate(next.getDate() + 7); break;
    case "monthly": next.setMonth(next.getMonth() + 1); break;
    case "yearly":  next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}

export async function createTransaction(formData: FormData): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Plan limit check
  const guard = await checkCanAddTransaction(session.user.id);
  if (!guard.allowed) {
    return { error: guard.reason ?? "Plan limit reached.", planLimitReached: true, requiredPlan: guard.requiredPlan };
  }

  const parse = CreateTransactionSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    category: formData.get("category"),
    notes: (formData.get("notes") as string) || null,
    creditCardId: (formData.get("creditCardId") as string) || null,
    bankAccountId: (formData.get("bankAccountId") as string) || null,
    installments: formData.get("installments") || "1",
    isRecurring: formData.get("isRecurring") === "true",
    recurringFrequency: (formData.get("recurringFrequency") as string) || null,
    recurringEndDate: (formData.get("recurringEndDate") as string) || null,
  });
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }
  const { name, amount, date, category, notes, creditCardId, bankAccountId, installments, isRecurring, recurringFrequency, recurringEndDate } =
    parse.data;

  if (isRecurring && !recurringFrequency) {
    return { error: "Please select a recurring frequency" };
  }

  if (!creditCardId && !bankAccountId) {
    throw new Error("Either credit card or bank account must be selected");
  }

  if (creditCardId && bankAccountId) {
    throw new Error("Cannot use both credit card and bank account for the same transaction");
  }

  // Compute nextRecurDate for recurring transactions
  const transactionDate = new Date(date);
  const nextRecurDate = isRecurring && recurringFrequency
    ? computeNextRecurDate(transactionDate, recurringFrequency)
    : null;

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
    // For income (negative amounts like cashback), increase available balance
    const newAvailableBalance = creditCard.availableBalance - amount;
    
    // Only check credit limit for expenses (positive amounts)
    if (amount > 0 && newAvailableBalance < 0) {
      throw new Error(
        `Insufficient credit limit. Available: ${creditCard.availableBalance}, Requested: ${amount}`
      );
    }
    
    // Ensure available balance doesn't exceed card limit when receiving income
    if (amount < 0 && newAvailableBalance > creditCard.cardLimit) {
      throw new Error(
        `Cashback would exceed card limit. Current available: ${creditCard.availableBalance}, Card limit: ${creditCard.cardLimit}`
      );
    }

    // If installments > 1, create multiple transactions spread across billing cycles
    if (installments > 1) {
      const installmentAmount = amount / installments;
      const txDate = new Date(date);
      
      // Calculate billing cycle start based on billGenerationDate
      const currentDay = txDate.getDate();
      const billGenerationDate = creditCard.billGenerationDate;
      
      // Determine the first billing cycle this transaction belongs to.
      // Transactions AFTER the bill generation date go to the NEXT month's cycle;
      // transactions ON or BEFORE the bill generation date stay in the current cycle
      // (TC-04 boundary: exact match = same cycle, not next cycle).
      let firstBillingMonth = new Date(txDate);
      if (currentDay > billGenerationDate) {
        // Transaction is after current billing cycle cutoff, first installment next month
        firstBillingMonth.setMonth(firstBillingMonth.getMonth() + 1);
      }
      // Set to billing generation date
      firstBillingMonth.setDate(billGenerationDate);

      // Create parent transaction (the original full amount transaction)
      const parentTransaction = await db.transaction.create({
        data: {
          name: `${name} (${installments} installments)`,
          amount,
          date: txDate,
          category,
          notes,
          installments,
          creditCardId,
          installmentNumber: 0, // 0 indicates this is the parent
        },
      });

      // Create installment transactions
      const installmentTransactions = [];
      for (let i = 1; i <= installments; i++) {
        const installmentDate = new Date(firstBillingMonth);
        installmentDate.setMonth(installmentDate.getMonth() + (i - 1));
        
        installmentTransactions.push(
          db.transaction.create({
            data: {
              name: `${name} (${i}/${installments})`,
              amount: installmentAmount,
              date: installmentDate,
              category,
              notes,
              installments,
              parentTransactionId: parentTransaction.id,
              installmentNumber: i,
              creditCardId,
            },
          })
        );
      }

      // Execute all installment creations and update credit card balance
      await db.$transaction([
        ...installmentTransactions,
        db.credit_card.update({
          where: { id: creditCardId },
          data: {
            availableBalance: newAvailableBalance,
          },
        }),
      ]);
    } else {
      // Single payment transaction (possibly recurring)
      await db.$transaction([
        db.transaction.create({
          data: {
            name,
            amount,
            date: transactionDate,
            category,
            notes,
            installments,
            creditCardId,
            isRecurring: isRecurring ?? false,
            recurringFrequency: recurringFrequency ?? null,
            recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
            isRecurringActive: isRecurring ? true : undefined,
            nextRecurDate,
          },
        }),
        db.credit_card.update({
          where: { id: creditCardId },
          data: {
            availableBalance: newAvailableBalance,
          },
        }),
      ]);
    }
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
          date: transactionDate,
          category,
          notes,
          installments,
          bankAccountId,
          isRecurring: isRecurring ?? false,
          recurringFrequency: recurringFrequency ?? null,
          recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
          isRecurringActive: isRecurring ? true : undefined,
          nextRecurDate,
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

export async function createTransfer(formData: FormData): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parse = CreateTransferSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    fromAccountId: formData.get("fromAccountId"),
    toAccountId: formData.get("toAccountId"),
  });
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }
  const { name, amount, date, fromAccountId, toAccountId } = parse.data;

  if (!fromAccountId || !toAccountId) {
    throw new Error("Both source and destination accounts must be selected");
  }

  if (fromAccountId === toAccountId) {
    throw new Error("Source and destination accounts must be different");
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
          OR: [
            { installmentNumber: null },
            { installmentNumber: { gt: 0 } },
          ],
        }
      : bankAccountId
      ? {
          bankAccountId,
          bankAccount: {
            userId: session.user.id,
          },
          OR: [
            { installmentNumber: null },
            { installmentNumber: { gt: 0 } },
          ],
        }
      : {
          AND: [
            {
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
            {
              OR: [
                { installmentNumber: null },
                { installmentNumber: { gt: 0 } },
              ],
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
      parentTransaction: true,
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found or unauthorized");
  }

  // If this is an installment transaction, get the parent to delete all related installments
  const parentId = transaction.parentTransactionId || transaction.id;
  
  // Get the parent transaction with ownership re-verified via the credit card / bank account relation
  const parentTransaction = await db.transaction.findFirst({
    where: {
      id: parentId,
      OR: [
        { creditCard: { userId: session.user.id } },
        { bankAccount: { userId: session.user.id } },
      ],
    },
    include: {
      creditCard: true,
      bankAccount: true,
    },
  });

  if (!parentTransaction) {
    throw new Error("Parent transaction not found or unauthorized");
  }

  // Refund the full original amount when deleting installment plan
  if (parentTransaction.creditCardId && parentTransaction.creditCard) {
    // For credit card: add the full amount back to available balance
    await db.$transaction([
      db.credit_card.update({
        where: { id: parentTransaction.creditCardId },
        data: {
          availableBalance: parentTransaction.creditCard.availableBalance + parentTransaction.amount,
        },
      }),
      // Delete all child installments and the parent
      db.transaction.deleteMany({
        where: {
          OR: [
            { id: parentId },
            { parentTransactionId: parentId },
          ],
        },
      }),
    ]);
  } else if (parentTransaction.bankAccountId && parentTransaction.bankAccount) {
    // For bank account: reverse the original effect by adding the amount back.
    // createTransaction uses: newBalance = currentBalance - amount
    // So deleteTransaction must use: newBalance = currentBalance + amount
    await db.$transaction([
      db.bank_account.update({
        where: { id: parentTransaction.bankAccountId },
        data: {
          currentBalance: parentTransaction.bankAccount.currentBalance + parentTransaction.amount,
        },
      }),
      db.transaction.delete({
        where: { id: transactionId },
      }),
    ]);
  }

  revalidatePath("/");
}

export async function updateTransaction(transactionId: string, formData: FormData): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parse = UpdateTransactionSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    category: formData.get("category"),
    notes: (formData.get("notes") as string) || null,
    installments: formData.get("installments") || "1",
  });
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }
  const { name, amount: newAmount, date, category, notes, installments: newInstallments } =
    parse.data;

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
          notes,
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
          notes,
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


export async function toggleRecurringStatus(transactionId: string): Promise<{ error?: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const transaction = await db.transaction.findFirst({
    where: {
      id: transactionId,
      isRecurring: true,
      OR: [
        { creditCard: { userId: session.user.id } },
        { bankAccount: { userId: session.user.id } },
      ],
    },
  });

  if (!transaction) {
    return { error: "Recurring transaction not found or unauthorized" };
  }

  await db.transaction.update({
    where: { id: transactionId },
    data: { isRecurringActive: !transaction.isRecurringActive },
  });

  revalidatePath("/");
  return {};
}
