"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createExpenseAccount(formData: FormData) {
  const name = formData.get("accountName") as string;
  const balance = parseFloat(formData.get("initialBalance") as string);
  if (!name || isNaN(balance)) {
    throw new Error("Invalid input");
  }
  await db.expense_account.create({
    data: { name, balance },
  });
  revalidatePath("/expenses");
}
