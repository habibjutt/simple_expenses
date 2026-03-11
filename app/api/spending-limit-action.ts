"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export type SpendingLimit = {
  id: string;
  categoryName: string;
  amount: number;
  month: number;
  year: number;
  userId: string;
};

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getSpendingLimits(month: number, year: number) {
  const session = await getSession();
  return prisma.spending_limit.findMany({
    where: { userId: session.user.id, month, year },
    orderBy: { categoryName: "asc" },
  });
}

export async function upsertSpendingLimit(data: {
  categoryName: string;
  amount: number;
  month: number;
  year: number;
}) {
  const session = await getSession();
  return prisma.spending_limit.upsert({
    where: {
      userId_categoryName_month_year: {
        userId: session.user.id,
        categoryName: data.categoryName,
        month: data.month,
        year: data.year,
      },
    },
    update: { amount: data.amount },
    create: { ...data, userId: session.user.id },
  });
}

export async function deleteSpendingLimit(id: string) {
  const session = await getSession();
  const existing = await prisma.spending_limit.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Not found");
  await prisma.spending_limit.delete({ where: { id } });
}
