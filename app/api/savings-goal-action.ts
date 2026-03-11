"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  deadline: Date | null;
  isCompleted: boolean;
  createdAt: Date;
};

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const userId = await requireUser();
  const goals = await db.savings_goal.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return goals.map((g) => ({
    ...g,
    targetAmount: Number(g.targetAmount),
    currentAmount: Number(g.currentAmount),
  }));
}

export async function createSavingsGoal(data: {
  name: string;
  targetAmount: number;
  color: string;
  deadline?: Date | null;
}) {
  const userId = await requireUser();
  await db.savings_goal.create({
    data: {
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      color: data.color,
      deadline: data.deadline ?? null,
    },
  });
}

export async function updateSavingsGoal(
  id: string,
  data: {
    name?: string;
    targetAmount?: number;
    currentAmount?: number;
    color?: string;
    deadline?: Date | null;
    isCompleted?: boolean;
  }
) {
  const userId = await requireUser();
  const goal = await db.savings_goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== userId) throw new Error("Not found");
  await db.savings_goal.update({ where: { id }, data });
}

export async function deleteSavingsGoal(id: string) {
  const userId = await requireUser();
  const goal = await db.savings_goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== userId) throw new Error("Not found");
  await db.savings_goal.delete({ where: { id } });
}

export async function addContribution(id: string, amount: number) {
  const userId = await requireUser();
  const goal = await db.savings_goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== userId) throw new Error("Not found");
  const newAmount = Number(goal.currentAmount) + amount;
  const isCompleted = newAmount >= Number(goal.targetAmount);
  await db.savings_goal.update({
    where: { id },
    data: { currentAmount: newAmount, isCompleted },
  });
}
