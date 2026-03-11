"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { DEFAULT_CATEGORIES, type Category } from "@/lib/category-data";

export type { Category } from "@/lib/category-data";

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getCategories(): Promise<Category[]> {
  const session = await getSession();
  const cats = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return cats;
}

export async function getCategoriesByType(type: "expense" | "income" | "both"): Promise<Category[]> {
  const session = await getSession();
  const cats = await prisma.category.findMany({
    where: {
      userId: session.user.id,
      OR: [{ type }, { type: "both" }],
    },
    orderBy: { name: "asc" },
  });
  return cats;
}

export async function createCategory(data: {
  name: string;
  color: string;
  icon: string;
  type: string;
}): Promise<Category> {
  const session = await getSession();
  const cat = await prisma.category.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  });
  return cat;
}

export async function updateCategory(
  id: string,
  data: { name?: string; color?: string; icon?: string; type?: string }
): Promise<Category> {
  const session = await getSession();
  const existing = await prisma.category.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) throw new Error("Category not found");
  const cat = await prisma.category.update({ where: { id }, data });
  return cat;
}

export async function deleteCategory(id: string): Promise<void> {
  const session = await getSession();
  const existing = await prisma.category.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) throw new Error("Category not found");
  await prisma.category.delete({ where: { id } });
}

export async function seedDefaultCategories(): Promise<void> {
  const session = await getSession();
  const existing = await prisma.category.count({ where: { userId: session.user.id } });
  if (existing > 0) return;
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: session.user.id })),
    skipDuplicates: true,
  });
}
