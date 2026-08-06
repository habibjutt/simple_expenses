"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import {
  BlogCategorySchema,
  UpdateBlogCategorySchema,
} from "@/lib/validations/blog";
import type { ActionResult } from "@/lib/validations";

export type BlogCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
};

// ─── Public ───────────────────────────────────────────────────────────────

export async function getBlogCategoryBySlug(slug: string) {
  return db.blog_category.findUnique({ where: { slug } });
}

export async function listBlogCategoriesForSitemap() {
  return db.blog_category.findMany({
    select: { slug: true, updatedAt: true },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────

export async function listBlogCategories() {
  await requireAdmin();
  return db.blog_category.findMany({ orderBy: { name: "asc" } });
}

export async function createBlogCategory(data: {
  name: string;
  slug: string;
  description?: string | null;
  color: string;
}): Promise<{ error: string } | { category: BlogCategoryRecord }> {
  await requireAdmin();
  const parse = BlogCategorySchema.safeParse(data);
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  const existing = await db.blog_category.findUnique({
    where: { slug: parse.data.slug },
  });
  if (existing) {
    return { error: "A category with this slug already exists" };
  }

  const category = await db.blog_category.create({ data: parse.data });
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
  return { category };
}

export async function updateBlogCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    color?: string;
  },
): Promise<ActionResult> {
  await requireAdmin();
  const parse = UpdateBlogCategorySchema.safeParse(data);
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  if (parse.data.slug) {
    const existing = await db.blog_category.findFirst({
      where: { slug: parse.data.slug, NOT: { id } },
    });
    if (existing) {
      return { error: "A category with this slug already exists" };
    }
  }

  await db.blog_category.update({ where: { id }, data: parse.data });
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
}

export async function deleteBlogCategory(id: string): Promise<void> {
  await requireAdmin();
  await db.blog_category.delete({ where: { id } });
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
}
