"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createExpenseAccount(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

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
