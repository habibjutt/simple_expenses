"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createBankAccount(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const initialBalance = parseFloat(formData.get("initialBalance") as string);

  if (!name || isNaN(initialBalance)) {
    throw new Error("Invalid input");
  }

  if (initialBalance < 0) {
    throw new Error("Initial balance cannot be negative");
  }

  await db.bank_account.create({
    data: {
      name,
      initialBalance,
      currentBalance: initialBalance, // Initialize current balance to initial balance
      userId: session.user.id,
    },
  });

  revalidatePath("/");
}

export async function updateBankAccount(accountId: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const account = await db.bank_account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error("Bank account not found");
  }

  if (account.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const initialBalance = parseFloat(formData.get("initialBalance") as string);

  if (!name || isNaN(initialBalance)) {
    throw new Error("Invalid input");
  }

  if (initialBalance < 0) {
    throw new Error("Initial balance cannot be negative");
  }

  // Calculate the difference in initial balance to adjust current balance
  const balanceDifference = initialBalance - account.initialBalance;
  const newCurrentBalance = account.currentBalance + balanceDifference;

  await db.bank_account.update({
    where: { id: accountId },
    data: {
      name,
      initialBalance,
      currentBalance: newCurrentBalance,
    },
  });

  revalidatePath("/");
}

export async function getBankAccounts() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const accounts = await db.bank_account.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return accounts;
}

export async function deleteBankAccount(accountId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const account = await db.bank_account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error("Bank account not found");
  }

  if (account.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await db.bank_account.delete({
    where: { id: accountId },
  });

  revalidatePath("/");
}

export async function getBankAccountTransactions(
  accountId: string,
  month?: number,
  year?: number
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the bank account and verify ownership
  const account = await db.bank_account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error("Bank account not found");
  }

  if (account.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Determine the date range
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  // Get transactions for the month
  const transactions = await db.transaction.findMany({
    where: {
      bankAccountId: accountId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);

  return {
    account: {
      id: account.id,
      name: account.name,
      initialBalance: account.initialBalance,
      currentBalance: account.currentBalance,
    },
    monthStartDate: startDate,
    monthEndDate: endDate,
    transactions,
    totalAmount,
  };
}
