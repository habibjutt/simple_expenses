"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { sanitizeBlogHtml } from "@/lib/sanitize";
import { readingMinutes } from "@/lib/blog";
import { revalidatePath } from "next/cache";
import { BlogPostSchema, UpdateBlogPostSchema } from "@/lib/validations/blog";
import type { ActionResult } from "@/lib/validations";

async function generateUniqueSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  let slug = base;
  let suffix = 2;
  // eslint-disable-next-line no-await-in-loop
  while (
    await db.blog_post.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix++;
  }
  return slug;
}

// ─── Public ───────────────────────────────────────────────────────────────

const publicCardSelect = {
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  featuredImage: true,
  publishedAt: true,
  category: { select: { name: true, slug: true, color: true } },
} as const;

// Content is only fetched to estimate reading time; don't ship it to cards.
function toBlogCard<T extends { content: string }>({
  content,
  ...post
}: T) {
  return { ...post, readingMinutes: readingMinutes(content) };
}

export async function listPublishedBlogPosts({
  page = 1,
  categorySlug = "",
}: {
  page?: number;
  categorySlug?: string;
} = {}) {
  const limit = 9;
  const skip = (page - 1) * limit;

  const where = {
    status: "published",
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const [posts, total] = await Promise.all([
    db.blog_post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
      select: publicCardSelect,
    }),
    db.blog_post.count({ where }),
  ]);

  return {
    posts: posts.map(toBlogCard),
    total,
    pages: Math.ceil(total / limit),
  };
}

/** Up to `limit` other published posts, same category first, then newest. */
export async function listRelatedBlogPosts(
  slug: string,
  categoryId: string | null,
  limit = 3,
) {
  const sameCategory = categoryId
    ? await db.blog_post.findMany({
        where: { status: "published", categoryId, NOT: { slug } },
        orderBy: { publishedAt: "desc" },
        take: limit,
        select: publicCardSelect,
      })
    : [];

  const rest =
    sameCategory.length < limit
      ? await db.blog_post.findMany({
          where: {
            status: "published",
            slug: { notIn: [slug, ...sameCategory.map((p) => p.slug)] },
          },
          orderBy: { publishedAt: "desc" },
          take: limit - sameCategory.length,
          select: publicCardSelect,
        })
      : [];

  return [...sameCategory, ...rest].map(toBlogCard);
}

/** Categories that have at least one published post, for the filter bar. */
export async function listPublicBlogCategories() {
  return db.blog_category.findMany({
    where: { posts: { some: { status: "published" } } },
    orderBy: { name: "asc" },
    select: { name: true, slug: true, color: true },
  });
}

export async function getPublishedBlogPostBySlug(slug: string) {
  return db.blog_post.findFirst({
    where: { slug, status: "published" },
    include: {
      category: { select: { name: true, slug: true, color: true } },
      author: { select: { name: true, image: true } },
    },
  });
}

export async function listPublishedBlogPostsForSitemap() {
  return db.blog_post.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────

export async function listBlogPosts({
  page = 1,
  status = "",
  categoryId = "",
  search = "",
}: {
  page?: number;
  status?: string;
  categoryId?: string;
  search?: string;
} = {}) {
  await requireAdmin();
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? { title: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [posts, total] = await Promise.all([
    db.blog_post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { id: true, name: true, color: true } },
        author: { select: { id: true, name: true } },
      },
    }),
    db.blog_post.count({ where }),
  ]);

  return { posts, total, pages: Math.ceil(total / limit) };
}

export async function getBlogPost(id: string) {
  await requireAdmin();
  return db.blog_post.findUnique({ where: { id } });
}

export async function createBlogPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string | null;
  status: "draft" | "published";
  categoryId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
}): Promise<{ error: string } | { id: string }> {
  const session = await requireAdmin();
  const parse = BlogPostSchema.safeParse(data);
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  const slug = await generateUniqueSlug(parse.data.slug);

  const post = await db.blog_post.create({
    data: {
      ...parse.data,
      slug,
      content: sanitizeBlogHtml(parse.data.content),
      categoryId: parse.data.categoryId || null,
      authorId: session.user.id,
      publishedAt: parse.data.status === "published" ? new Date() : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { id: post.id };
}

export async function updateBlogPost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featuredImage?: string | null;
    status?: "draft" | "published";
    categoryId?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: string | null;
  },
): Promise<ActionResult> {
  await requireAdmin();
  const parse = UpdateBlogPostSchema.safeParse(data);
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  const existing = await db.blog_post.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Post not found" };
  }

  const updateData: Record<string, unknown> = { ...parse.data };

  if (parse.data.slug && parse.data.slug !== existing.slug) {
    updateData.slug = await generateUniqueSlug(parse.data.slug, id);
  }
  if (parse.data.content) {
    updateData.content = sanitizeBlogHtml(parse.data.content);
  }
  if (parse.data.categoryId !== undefined) {
    updateData.categoryId = parse.data.categoryId || null;
  }
  if (parse.data.status === "published" && !existing.publishedAt) {
    updateData.publishedAt = new Date();
  }

  await db.blog_post.update({ where: { id }, data: updateData });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
}

export async function updateBlogPostStatus(
  id: string,
  status: "draft" | "published",
): Promise<ActionResult> {
  await requireAdmin();
  const existing = await db.blog_post.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Post not found" };
  }

  await db.blog_post.update({
    where: { id },
    data: {
      status,
      publishedAt:
        status === "published" && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await requireAdmin();
  const existing = await db.blog_post.findUnique({ where: { id } });
  if (!existing) return;
  await db.blog_post.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
