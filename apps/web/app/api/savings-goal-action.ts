"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CreateSavingsGoalSchema,
  UpdateSavingsGoalSchema,
  ContributionSchema,
} from "@/lib/validations/savings-goal";
import type { ActionResult } from "@/lib/validations";

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
}): Promise<ActionResult> {
  const userId = await requireUser();
  const parse = CreateSavingsGoalSchema.safeParse(data);
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }
  await db.savings_goal.create({
    data: {
      userId,
      name: parse.data.name,
      targetAmount: parse.data.targetAmount,
      color: parse.data.color,
      deadline: parse.data.deadline ?? null,
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
  },
): Promise<ActionResult> {
  const userId = await requireUser();
  const parse = UpdateSavingsGoalSchema.safeParse(data);
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }
  const goal = await db.savings_goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== userId) throw new Error("Not found");
  await db.savings_goal.update({ where: { id }, data: parse.data });
}

export async function deleteSavingsGoal(id: string) {
  const userId = await requireUser();
  const goal = await db.savings_goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== userId) throw new Error("Not found");
  await db.savings_goal.delete({ where: { id } });
}

export async function addContribution(
  id: string,
  amount: number,
): Promise<ActionResult> {
  const userId = await requireUser();
  const parse = ContributionSchema.safeParse({ id, amount });
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }
  const goal = await db.savings_goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== userId) throw new Error("Not found");
  const newAmount = Number(goal.currentAmount) + parse.data.amount;
  const isCompleted = newAmount >= Number(goal.targetAmount);
  await db.savings_goal.update({
    where: { id },
    data: { currentAmount: newAmount, isCompleted },
  });
}
