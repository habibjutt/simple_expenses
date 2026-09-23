/**
 * Creates or updates the "How to Create a Monthly Budget in the UAE" post.
 * Safe to re-run: the post is matched by slug and the category by slug.
 *
 * Usage:
 *   npx tsx scripts/publish-uae-budget-post.ts            # save as draft
 *   npx tsx scripts/publish-uae-budget-post.ts --publish  # publish live
 *
 * The featured image is served from public/images/blog/, so deploy the app
 * before publishing or the image will 404.
 */

import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { sanitizeBlogHtml } from "../lib/sanitize";

const publish = process.argv.includes("--publish");

const CATEGORY = {
  name: "Budgeting",
  slug: "budgeting",
  description: "Step-by-step budgeting guides for UAE residents and businesses.",
  color: "#1a9e5c",
};

const POST = {
  title: "How to Create a Monthly Budget in the UAE: A Step-by-Step Guide",
  slug: "how-to-create-a-monthly-budget-uae",
  excerpt:
    "Build a monthly budget that plans for rent cheques, school fees and flights home, with a real AED 15,000 example and tips for small business owners.",
  metaTitle: "How to Create a Monthly Budget in the UAE (2026 Guide)",
  metaDescription:
    "Create a monthly budget in the UAE step by step: a real AED example, rent cheques, school fees, annual costs, and tips for small business owners.",
  featuredImage: "/images/blog/uae-monthly-budget.jpg",
  contentFile: resolve(__dirname, "content/uae-monthly-budget.html"),
};

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const author = await prisma.user.findFirst({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  if (!author) throw new Error("No admin user found to author the post");

  const category = await prisma.blog_category.upsert({
    where: { slug: CATEGORY.slug },
    update: {},
    create: CATEGORY,
  });

  const content = sanitizeBlogHtml(readFileSync(POST.contentFile, "utf8"));
  const status = publish ? "published" : "draft";
  const existing = await prisma.blog_post.findUnique({
    where: { slug: POST.slug },
  });

  const data = {
    title: POST.title,
    excerpt: POST.excerpt,
    content,
    featuredImage: POST.featuredImage,
    ogImage: POST.featuredImage,
    metaTitle: POST.metaTitle,
    metaDescription: POST.metaDescription,
    status,
    categoryId: category.id,
    publishedAt: publish ? (existing?.publishedAt ?? new Date()) : null,
  };

  const post = existing
    ? await prisma.blog_post.update({ where: { id: existing.id }, data })
    : await prisma.blog_post.create({
        data: { ...data, slug: POST.slug, authorId: author.id },
      });

  console.log(
    `${existing ? "Updated" : "Created"} "${post.title}" as ${status}` +
      ` (author: ${author.name}, category: ${category.name})`,
  );
  console.log(`URL: /blog/${post.slug}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
