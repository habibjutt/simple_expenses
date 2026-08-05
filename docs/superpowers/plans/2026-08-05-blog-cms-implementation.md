# Blog CMS (Admin + Public) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an admin-managed blog (posts + categories) with a Tiptap WYSIWYG editor, per-post SEO fields, dynamic sitemap inclusion, and public blog pages.

**Architecture:** Two new Prisma models (`blog_post`, `blog_category`) behind admin-gated Next.js Server Actions, following the existing `contact-action.ts` / `category-action.ts` conventions exactly. Admin CRUD UI mirrors `/admin/enquiries`. Public pages (`/blog`, `/blog/[slug]`, `/blog/category/[slug]`) follow the existing landing-page conventions (`/features`) and get a design pass via the `ui-ux-pro-max` skill.

**Tech Stack:** Next.js 16 App Router, Prisma 7 (`@prisma/adapter-pg`), Zod, Tiptap (`@tiptap/react` v3), `isomorphic-dompurify`, shadcn/ui, Tailwind CSS v4, Playwright.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-05-blog-cms-design.md` — this plan implements that spec in full.
- Prisma workflow (from `apps/web/`): edit `schema.prisma` → `npx prisma migrate dev --name <name>` → `npx prisma generate`. **Never** `prisma db push`.
- All admin mutations/reads go through Server Actions gated by `await requireAdmin()` from `@/lib/permissions`, matching `apps/web/app/api/contact-action.ts` and `apps/web/app/api/category-action.ts`.
- Model names are `snake_case` (`blog_post`, `blog_category`); fields are `camelCase` — matches every existing Prisma model in `apps/web/prisma/schema.prisma`.
- **No unit test runner exists in this repo** (no vitest/jest — only Playwright e2e in `apps/web/e2e/`). Do not add one. Pure helpers (`slugify`, `sanitizeBlogHtml`) are small enough to verify by inspection; their behavior is exercised end-to-end by the Playwright test in Task 17 (slug generation via the real form, content sanitization via the rendered public page).
- **Deviation from the spec doc's "Shared types" section:** the spec suggested adding Blog types to `packages/types`. Codebase exploration during planning found that the existing single-category feature (`apps/web/lib/validations/category.ts`, `apps/web/app/api/category-action.ts`) does **not** duplicate its types into `packages/types` — Zod schemas and types live locally in `apps/web/lib/validations/`. Since Blog is a web-only admin feature (no mobile consumption in scope), this plan follows that established local pattern instead: `apps/web/lib/validations/blog.ts`. This is a same-spec implementation-detail choice, not a scope change.
- Public marketing pages use Tailwind utility classes + shadcn theme tokens (`bg-background`, `text-foreground`) and the brand green `#1a9e5c` — see `apps/web/app/features/page.tsx`. Admin panel pages use a separate dark theme via inline hex styles (`#0f1e38` background, `#1a2d4a` borders, `#4f6ef7` accent) — see `apps/web/app/(protected)/(admin)/admin/enquiries/`. Do not mix the two conventions.
- Featured/OG images are URL-only (no upload pipeline). Render with a plain `<img>` tag, not `next/image` — `next/image` requires each external domain to be allow-listed in `next.config`, which would block arbitrary admin-pasted URLs.
- Blog post `content` is sanitized server-side (`sanitizeBlogHtml`) before every write to the database. Public rendering via `dangerouslySetInnerHTML` is safe **only** because of this write-time sanitization — never render unsanitized HTML.

---

### Task 1: Prisma schema — `blog_post` and `blog_category` models

**Files:**
- Modify: `apps/web/prisma/schema.prisma`

**Interfaces:**
- Produces: Prisma models `blog_category { id, name, slug, description, color, createdAt, updatedAt, posts }` and `blog_post { id, title, slug, excerpt, content, featuredImage, status, publishedAt, metaTitle, metaDescription, ogImage, authorId, categoryId, createdAt, updatedAt, author, category }`.

- [ ] **Step 1: Add the `blogPosts` back-relation to the `user` model**

In `apps/web/prisma/schema.prisma`, find this line inside `model user`:

```prisma
  categories category[]
```

Change it to:

```prisma
  categories category[]
  blogPosts  blog_post[]
```

- [ ] **Step 2: Append the two new models at the end of the file**

Append this to the end of `apps/web/prisma/schema.prisma`:

```prisma
model blog_category {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  description String?
  color       String      @default("#4f6ef7")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  posts       blog_post[]
}

model blog_post {
  id              String         @id @default(cuid())
  title           String
  slug            String         @unique
  excerpt         String
  content         String         @db.Text
  featuredImage   String?
  status          String         @default("draft") // draft | published
  publishedAt     DateTime?
  metaTitle       String?
  metaDescription String?
  ogImage         String?
  authorId        String
  categoryId      String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  author   user           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  category blog_category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  @@index([status, publishedAt])
  @@index([categoryId])
}
```

- [ ] **Step 3: Run the migration**

Run (from `apps/web/`):

```bash
npx prisma migrate dev --name add_blog_models
```

Expected: a new migration folder under `apps/web/prisma/migrations/` and "Your database is now in sync with your schema."

- [ ] **Step 4: Regenerate the Prisma client**

Run (from `apps/web/`):

```bash
npx prisma generate
```

Expected: "Generated Prisma Client" with no errors. Verify the migration actually created both tables:

```bash
grep -rl "CREATE TABLE \"blog_post\"" apps/web/prisma/migrations
grep -rl "CREATE TABLE \"blog_category\"" apps/web/prisma/migrations
```

Expected: each command prints the path to the migration's `migration.sql` file created in Step 3.

- [ ] **Step 5: Commit**

```bash
git add apps/web/prisma/schema.prisma apps/web/prisma/migrations
git commit -m "feat: add blog_post and blog_category Prisma models"
```

---

### Task 2: Slug and sanitization helpers

**Files:**
- Create: `apps/web/lib/slugify.ts`
- Modify: `apps/web/lib/sanitize.ts`
- Modify: `apps/web/package.json` (new dependency)

**Interfaces:**
- Produces: `slugify(text: string): string` from `@/lib/slugify`.
- Produces: `sanitizeBlogHtml(html: string): string` from `@/lib/sanitize`.

- [ ] **Step 1: Install `isomorphic-dompurify`**

Run:

```bash
cd apps/web && npm install isomorphic-dompurify
```

Expected: `isomorphic-dompurify` added to `apps/web/package.json` dependencies.

- [ ] **Step 2: Create `apps/web/lib/slugify.ts`**

```ts
/** Convert arbitrary text into a URL-safe slug, e.g. "Hello, World!" -> "hello-world". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

- [ ] **Step 3: Add `sanitizeBlogHtml` to `apps/web/lib/sanitize.ts`**

Add this import at the top of the file:

```ts
import { sanitize } from "isomorphic-dompurify";
```

Add this to the bottom of the file:

```ts
const BLOG_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "u",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "a",
  "img",
];
const BLOG_ALLOWED_ATTR = ["href", "src", "alt", "target", "rel"];

/**
 * Sanitize Tiptap-generated HTML before it's stored. Rendering blog content
 * later with dangerouslySetInnerHTML is only safe because this strips
 * scripts/event handlers and restricts tags/attrs to a known allowlist.
 */
export function sanitizeBlogHtml(html: string): string {
  return sanitize(html, {
    ALLOWED_TAGS: BLOG_ALLOWED_TAGS,
    ALLOWED_ATTR: BLOG_ALLOWED_ATTR,
  });
}
```

- [ ] **Step 4: Verify**

`isomorphic-dompurify` v3 is ESM-only, so it can't be sanity-checked with a plain `node -e "require(...)"` one-liner (Next.js's bundler handles ESM fine, but raw Node `require` will throw `ERR_REQUIRE_ESM`). Instead run:

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors in `lib/sanitize.ts` (confirms the import and types resolve correctly). Functional behavior of `sanitizeBlogHtml` is exercised for real in Task 5's `createBlogPost`/`updateBlogPost` and verified manually in Task 10's browser check.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/slugify.ts apps/web/lib/sanitize.ts apps/web/package.json apps/web/package-lock.json
git commit -m "feat: add slugify and sanitizeBlogHtml helpers"
```

---

### Task 3: Zod validation schemas

**Files:**
- Create: `apps/web/lib/validations/blog.ts`
- Modify: `apps/web/lib/validations/index.ts`

**Interfaces:**
- Consumes: `sanitizeString` from `@/lib/sanitize` (Task 2's file, unchanged export).
- Produces: `BlogCategorySchema`, `UpdateBlogCategorySchema`, `BlogPostSchema`, `UpdateBlogPostSchema` (Zod schemas) and their inferred types `BlogCategoryInput`, `UpdateBlogCategoryInput`, `BlogPostInput`, `UpdateBlogPostInput`, all from `@/lib/validations` (re-exported) or `@/lib/validations/blog`.

- [ ] **Step 1: Create `apps/web/lib/validations/blog.ts`**

```ts
import { z } from "zod";
import { sanitizeString } from "@/lib/sanitize";

export const BlogCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .transform(sanitizeString),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug is too long")
    .transform(sanitizeString),
  description: z
    .string()
    .max(500, "Description is too long")
    .transform(sanitizeString)
    .optional()
    .nullable(),
  color: z.string().min(1, "Color is required"),
});

export const UpdateBlogCategorySchema = BlogCategorySchema.partial();

export type BlogCategoryInput = z.infer<typeof BlogCategorySchema>;
export type UpdateBlogCategoryInput = z.infer<typeof UpdateBlogCategorySchema>;

export const BlogPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .transform(sanitizeString),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug is too long")
    .transform(sanitizeString),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt is too long")
    .transform(sanitizeString),
  content: z.string().min(1, "Content is required"),
  featuredImage: z
    .string()
    .max(2000)
    .transform(sanitizeString)
    .optional()
    .nullable(),
  status: z.enum(["draft", "published"] as const, {
    error: 'Status must be "draft" or "published"',
  }),
  categoryId: z.string().optional().nullable(),
  metaTitle: z
    .string()
    .max(70, "Meta title is too long")
    .transform(sanitizeString)
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, "Meta description is too long")
    .transform(sanitizeString)
    .optional()
    .nullable(),
  ogImage: z
    .string()
    .max(2000)
    .transform(sanitizeString)
    .optional()
    .nullable(),
});

export const UpdateBlogPostSchema = BlogPostSchema.partial();

export type BlogPostInput = z.infer<typeof BlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof UpdateBlogPostSchema>;
```

- [ ] **Step 2: Export it from `apps/web/lib/validations/index.ts`**

Add this line alongside the existing `export * from "./category";` line:

```ts
export * from "./blog";
```

- [ ] **Step 3: Verify**

Run (from `apps/web/`):

```bash
npx tsc --noEmit
```

Expected: no new errors referencing `lib/validations/blog.ts` or `lib/validations/index.ts`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/validations/blog.ts apps/web/lib/validations/index.ts
git commit -m "feat: add blog post/category Zod validation schemas"
```

---

### Task 4: Blog category Server Actions

**Files:**
- Create: `apps/web/app/api/blog-category-action.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`; `requireAdmin` from `@/lib/permissions`; `BlogCategorySchema`, `UpdateBlogCategorySchema` from `@/lib/validations/blog`; `ActionResult` from `@/lib/validations`.
- Produces (all exported from `@/app/api/blog-category-action`):
  - `getBlogCategoryBySlug(slug: string)` — public, returns `blog_category | null`.
  - `listBlogCategoriesForSitemap()` — public, returns `{ slug: string; updatedAt: Date }[]`.
  - `listBlogCategories()` — admin, returns full `blog_category[]`.
  - `createBlogCategory(data): Promise<{ error: string } | { category: BlogCategoryRecord }>` where `BlogCategoryRecord = { id: string; name: string; slug: string; description: string | null; color: string }`.
  - `updateBlogCategory(id, data): Promise<ActionResult>`.
  - `deleteBlogCategory(id): Promise<void>`.

- [ ] **Step 1: Create the file**

```ts
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
```

- [ ] **Step 2: Verify**

Run (from `apps/web/`):

```bash
npx tsc --noEmit
```

Expected: no errors in `app/api/blog-category-action.ts`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/api/blog-category-action.ts
git commit -m "feat: add blog category server actions"
```

---

### Task 5: Blog post Server Actions

**Files:**
- Create: `apps/web/app/api/blog-action.ts`

**Interfaces:**
- Consumes: `db`, `requireAdmin`, `sanitizeBlogHtml` (Task 2), `BlogPostSchema`/`UpdateBlogPostSchema` (Task 3), `ActionResult`.
- Produces (all exported from `@/app/api/blog-action`):
  - `listPublishedBlogPosts({ page?, categorySlug? })` — public, paginated published posts with `category`.
  - `getPublishedBlogPostBySlug(slug: string)` — public, published post with `category` + `author`, or `null`.
  - `listPublishedBlogPostsForSitemap()` — public, `{ slug: string; updatedAt: Date }[]`.
  - `listBlogPosts({ page?, status?, categoryId?, search? })` — admin, paginated with `category` + `author`.
  - `getBlogPost(id: string)` — admin, full row or `null`.
  - `createBlogPost(data): Promise<{ error: string } | { id: string }>`.
  - `updateBlogPost(id, data): Promise<ActionResult>`.
  - `updateBlogPostStatus(id, status): Promise<ActionResult>`.
  - `deleteBlogPost(id): Promise<void>`.

- [ ] **Step 1: Create the file**

```ts
"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { sanitizeBlogHtml } from "@/lib/sanitize";
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
      include: {
        category: { select: { name: true, slug: true, color: true } },
      },
    }),
    db.blog_post.count({ where }),
  ]);

  return { posts, total, pages: Math.ceil(total / limit) };
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
```

- [ ] **Step 2: Verify**

Run (from `apps/web/`):

```bash
npx tsc --noEmit
```

Expected: no errors in `app/api/blog-action.ts`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/api/blog-action.ts
git commit -m "feat: add blog post server actions"
```

---

### Task 6: Admin sidebar nav entry

**Files:**
- Modify: `apps/web/components/admin-app-sidebar.tsx`

- [ ] **Step 1: Add the icon import**

Change:

```ts
import {
  IconDashboard,
  IconUsers,
  IconCreditCard,
  IconChartBar,
  IconFlag,
  IconClipboardList,
  IconMail,
  type Icon,
} from "@tabler/icons-react";
```

to:

```ts
import {
  IconDashboard,
  IconUsers,
  IconCreditCard,
  IconChartBar,
  IconFlag,
  IconClipboardList,
  IconMail,
  IconArticle,
  type Icon,
} from "@tabler/icons-react";
```

- [ ] **Step 2: Register the icon and nav item**

Change:

```ts
const iconMap: Record<string, Icon> = {
  dashboard: IconDashboard,
  users: IconUsers,
  subscriptions: IconCreditCard,
  metrics: IconChartBar,
  flags: IconFlag,
  logs: IconClipboardList,
  enquiries: IconMail,
};
```

to:

```ts
const iconMap: Record<string, Icon> = {
  dashboard: IconDashboard,
  users: IconUsers,
  subscriptions: IconCreditCard,
  metrics: IconChartBar,
  flags: IconFlag,
  logs: IconClipboardList,
  enquiries: IconMail,
  blog: IconArticle,
};
```

Change:

```ts
  { title: "Enquiries", url: "/admin/enquiries", iconKey: "enquiries" },
];
```

to:

```ts
  { title: "Enquiries", url: "/admin/enquiries", iconKey: "enquiries" },
  { title: "Blog", url: "/admin/blog", iconKey: "blog" },
];
```

- [ ] **Step 3: Verify**

Run (from `apps/web/`):

```bash
npx tsc --noEmit
```

Expected: no errors in `components/admin-app-sidebar.tsx`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/admin-app-sidebar.tsx
git commit -m "feat: add Blog entry to admin sidebar nav"
```

---

### Task 7: Admin Blog Categories page

**Files:**
- Create: `apps/web/app/(protected)/(admin)/admin/blog/categories/page.tsx`
- Create: `apps/web/app/(protected)/(admin)/admin/blog/categories/BlogCategoriesTable.tsx`

**Interfaces:**
- Consumes: `listBlogCategories`, `createBlogCategory`, `updateBlogCategory`, `deleteBlogCategory` (Task 4); `slugify` (Task 2).

- [ ] **Step 1: Create `apps/web/app/(protected)/(admin)/admin/blog/categories/page.tsx`**

```tsx
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { listBlogCategories } from "@/app/api/blog-category-action";
import BlogCategoriesTable from "./BlogCategoriesTable";

export default async function AdminBlogCategoriesPage() {
  const categories = await listBlogCategories();

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FolderKanban className="w-4 h-4" style={{ color: "#4f6ef7" }} />
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "#4f6ef7" }}
          >
            Blog
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Blog Categories
            </h1>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              {categories.length} categor
              {categories.length !== 1 ? "ies" : "y"}
            </p>
          </div>
          <Link
            href="/admin/blog"
            className="text-sm font-medium"
            style={{ color: "#4f6ef7" }}
          >
            &larr; Back to posts
          </Link>
        </div>
      </div>

      <BlogCategoriesTable categories={categories} />
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/web/app/(protected)/(admin)/admin/blog/categories/BlogCategoriesTable.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { slugify } from "@/lib/slugify";
import {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "@/app/api/blog-category-action";

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
};

const EMPTY_FORM = { name: "", slug: "", description: "", color: "#4f6ef7" };

export default function BlogCategoriesTable({
  categories: initial,
}: {
  categories: BlogCategory[];
}) {
  const [categories, setCategories] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setOpen(true);
  }

  function openEdit(category: BlogCategory) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      color: category.color,
    });
    setSlugTouched(true);
    setOpen(true);
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  }

  function handleSubmit() {
    startTransition(async () => {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        color: form.color,
      };

      if (editingId) {
        const res = await updateBlogCategory(editingId, payload);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c)),
        );
        toast.success("Category updated");
      } else {
        const res = await createBlogCategory(payload);
        if ("error" in res) {
          toast.error(res.error);
          return;
        }
        setCategories((prev) =>
          [...prev, res.category].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
        toast.success("Category created");
      }
      setOpen(false);
    });
  }

  function handleDelete(id: string) {
    if (
      !confirm(
        "Delete this category? Posts in it will become uncategorized.",
      )
    )
      return;
    startTransition(async () => {
      await deleteBlogCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="w-4 h-4" /> New Category
        </Button>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: "#1a2d4a" }}>
              {["Name", "Slug", "Description", "Actions"].map((h) => (
                <TableHead
                  key={h}
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#3d5a80" }}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id} style={{ borderColor: "#1a2d4a" }}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: c.color }}
                    />
                    <span className="text-white">{c.name}</span>
                  </span>
                </TableCell>
                <TableCell className="text-xs" style={{ color: "#94a3b8" }}>
                  {c.slug}
                </TableCell>
                <TableCell className="text-xs" style={{ color: "#64748b" }}>
                  {c.description ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-[#1a2d4a]"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-[#1a2d4a] text-destructive"
                      onClick={() => handleDelete(c.id)}
                      disabled={pending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-sm"
                  style={{ color: "#64748b" }}
                >
                  No categories yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((prev) => ({ ...prev, slug: e.target.value }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-color">Color</Label>
              <Input
                id="cat-color"
                type="color"
                className="h-10 w-16 p-1"
                value={form.color}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, color: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={pending || !form.name || !form.slug}
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

- [ ] **Step 3: Verify manually**

Run `npm run dev` from repo root, sign in as the admin user, visit `/admin/blog/categories`, create a category named "Guides" (slug auto-fills to `guides`), edit it, then delete it. Expected: toasts confirm each action, the table updates without a full page reload, no console errors.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(protected)/(admin)/admin/blog/categories"
git commit -m "feat: add admin blog categories page"
```

---

### Task 8: Tiptap rich text editor component

**Files:**
- Modify: `apps/web/package.json` (new dependencies)
- Modify: `apps/web/app/globals.css`
- Create: `apps/web/components/RichTextEditor.tsx`

**Interfaces:**
- Produces: `RichTextEditor({ content: string; onChange: (html: string) => void })` default export from `@/components/RichTextEditor`. The `.blog-content` CSS class it uses is also reused by the public post detail page (Task 14).

- [ ] **Step 1: Install Tiptap packages**

Run:

```bash
cd apps/web && npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
```

Expected: five new packages added to `apps/web/package.json` dependencies.

- [ ] **Step 2: Add `.blog-content` styles to `apps/web/app/globals.css`**

Append to the end of the file:

```css
.blog-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
}
.blog-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.blog-content p {
  margin-bottom: 1rem;
  line-height: 1.75;
}
.blog-content ul,
.blog-content ol {
  margin: 0 0 1rem 1.5rem;
}
.blog-content ul {
  list-style: disc;
}
.blog-content ol {
  list-style: decimal;
}
.blog-content li {
  margin-bottom: 0.375rem;
}
.blog-content blockquote {
  border-left: 3px solid #1a9e5c;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  opacity: 0.85;
}
.blog-content a {
  color: #1a9e5c;
  text-decoration: underline;
}
.blog-content img {
  border-radius: 0.75rem;
  margin: 1.5rem 0;
  max-width: 100%;
}
.blog-content code {
  background: rgba(127, 127, 127, 0.15);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}
```

- [ ] **Step 3: Create `apps/web/components/RichTextEditor.tsx`**

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link.configure({ openOnClick: false })],
    content,
    // Avoid SSR hydration mismatches — see Tiptap's Next.js install guide.
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "blog-content min-h-[300px] px-4 py-3 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  function addLink() {
    const url = window.prompt("URL");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  }

  function addImage() {
    const url = window.prompt("Image URL");
    if (!url) return;
    editor?.chain().focus().setImage({ src: url }).run();
  }

  const buttons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      icon: Heading2,
      label: "H2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      label: "H3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: List,
      label: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: addLink,
      active: editor.isActive("link"),
    },
    { icon: ImageIcon, label: "Image", action: addImage, active: false },
    {
      icon: Undo,
      label: "Undo",
      action: () => editor.chain().focus().undo().run(),
      active: false,
    },
    {
      icon: Redo,
      label: "Redo",
      action: () => editor.chain().focus().redo().run(),
      active: false,
    },
  ];

  return (
    <div
      className="rounded-lg border"
      style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
    >
      <div
        className="flex flex-wrap gap-1 p-2 border-b"
        style={{ borderColor: "#1a2d4a" }}
      >
        {buttons.map(({ icon: Icon, label, action, active }) => (
          <Button
            key={label}
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 border-[#1a2d4a]"
            style={
              active ? { background: "#4f6ef733", color: "#4f6ef7" } : undefined
            }
            onClick={action}
            title={label}
          >
            <Icon className="w-3.5 h-3.5" />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} className="text-white" />
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run (from `apps/web/`):

```bash
npx tsc --noEmit
```

Expected: no errors in `components/RichTextEditor.tsx`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json apps/web/app/globals.css apps/web/components/RichTextEditor.tsx
git commit -m "feat: add Tiptap rich text editor component"
```

---

### Task 9: Blog post form (shared create/edit component)

**Files:**
- Create: `apps/web/app/(protected)/(admin)/admin/blog/BlogPostForm.tsx`

**Interfaces:**
- Consumes: `RichTextEditor` (Task 8); `slugify` (Task 2); `createBlogPost`, `updateBlogPost` (Task 5).
- Produces: `BlogPostForm({ categories: { id: string; name: string }[]; post?: BlogPostRecord })` default export, where `BlogPostRecord = { id: string; title: string; slug: string; excerpt: string; content: string; featuredImage: string | null; status: string; categoryId: string | null; metaTitle: string | null; metaDescription: string | null; ogImage: string | null }`. Consumed by Task 10's `new` and `[id]/edit` pages.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/RichTextEditor";
import { slugify } from "@/lib/slugify";
import { createBlogPost, updateBlogPost } from "@/app/api/blog-action";

type BlogCategoryOption = { id: string; name: string };

type BlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  status: string;
  categoryId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
};

export default function BlogPostForm({
  categories,
  post,
}: {
  categories: BlogCategoryOption[];
  post?: BlogPostRecord;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [seoOpen, setSeoOpen] = useState(false);

  const [form, setForm] = useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    featuredImage: post?.featuredImage ?? "",
    categoryId: post?.categoryId ?? "",
    metaTitle: post?.metaTitle ?? "",
    metaDescription: post?.metaDescription ?? "",
    ogImage: post?.ogImage ?? "",
  });

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title),
    }));
  }

  function handleSubmit(status: "draft" | "published") {
    if (!form.title || !form.slug || !form.excerpt || !form.content) {
      toast.error("Title, slug, excerpt, and content are required");
      return;
    }

    startTransition(async () => {
      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        featuredImage: form.featuredImage || null,
        status,
        categoryId: form.categoryId || null,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        ogImage: form.ogImage || null,
      };

      if (post) {
        const res = await updateBlogPost(post.id, payload);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Post updated");
      } else {
        const res = await createBlogPost(payload);
        if ("error" in res) {
          toast.error(res.error);
          return;
        }
        toast.success(
          status === "published" ? "Post published" : "Draft saved",
        );
      }
      router.push("/admin/blog");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-1.5">
        <Label htmlFor="post-title">Title</Label>
        <Input
          id="post-title"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="How to track expenses in the UAE"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-slug">Slug</Label>
        <Input
          id="post-slug"
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setForm((prev) => ({ ...prev, slug: e.target.value }));
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-category">Category</Label>
        <Select
          value={form.categoryId || "none"}
          onValueChange={(value) =>
            setForm((prev) => ({
              ...prev,
              categoryId: value === "none" ? "" : value,
            }))
          }
        >
          <SelectTrigger id="post-category" className="w-full">
            <SelectValue placeholder="No category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No category</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-image">Featured image URL</Label>
        <Input
          id="post-image"
          value={form.featuredImage}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, featuredImage: e.target.value }))
          }
          placeholder="https://…"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-excerpt">Excerpt</Label>
        <Textarea
          id="post-excerpt"
          rows={3}
          value={form.excerpt}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, excerpt: e.target.value }))
          }
          placeholder="A short summary shown on the blog listing and used as the meta description fallback."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Content</Label>
        <RichTextEditor
          content={form.content}
          onChange={(html) =>
            setForm((prev) => ({ ...prev, content: html }))
          }
        />
      </div>

      <div className="rounded-lg border" style={{ borderColor: "#1a2d4a" }}>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white"
          onClick={() => setSeoOpen((v) => !v)}
        >
          SEO
          <span style={{ color: "#64748b" }}>{seoOpen ? "Hide" : "Show"}</span>
        </button>
        {seoOpen && (
          <div className="p-4 pt-0 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="post-meta-title">Meta title</Label>
              <Input
                id="post-meta-title"
                value={form.metaTitle}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, metaTitle: e.target.value }))
                }
                placeholder={form.title || "Falls back to the post title"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-meta-description">Meta description</Label>
              <Textarea
                id="post-meta-description"
                rows={2}
                value={form.metaDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    metaDescription: e.target.value,
                  }))
                }
                placeholder={form.excerpt || "Falls back to the excerpt"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-og-image">OG image URL</Label>
              <Input
                id="post-og-image"
                value={form.ogImage}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ogImage: e.target.value }))
                }
                placeholder={
                  form.featuredImage || "Falls back to the featured image"
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => handleSubmit("draft")}
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Save draft"
          )}
        </Button>
        <Button disabled={pending} onClick={() => handleSubmit("published")}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run (from `apps/web/`):

```bash
npx tsc --noEmit
```

Expected: no errors in `BlogPostForm.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(protected)/(admin)/admin/blog/BlogPostForm.tsx"
git commit -m "feat: add shared admin blog post form"
```

---

### Task 10: Admin new/edit post pages

**Files:**
- Create: `apps/web/app/(protected)/(admin)/admin/blog/new/page.tsx`
- Create: `apps/web/app/(protected)/(admin)/admin/blog/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `BlogPostForm` (Task 9); `listBlogCategories` (Task 4); `getBlogPost` (Task 5).

- [ ] **Step 1: Create `apps/web/app/(protected)/(admin)/admin/blog/new/page.tsx`**

```tsx
import { listBlogCategories } from "@/app/api/blog-category-action";
import BlogPostForm from "../BlogPostForm";

export default async function NewBlogPostPage() {
  const categories = await listBlogCategories();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">New Post</h1>
      <BlogPostForm categories={categories} />
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/web/app/(protected)/(admin)/admin/blog/[id]/edit/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { getBlogPost } from "@/app/api/blog-action";
import { listBlogCategories } from "@/app/api/blog-category-action";
import BlogPostForm from "../../BlogPostForm";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    getBlogPost(id),
    listBlogCategories(),
  ]);

  if (!post) notFound();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Edit Post</h1>
      <BlogPostForm categories={categories} post={post} />
    </div>
  );
}
```

- [ ] **Step 3: Verify manually**

Run `npm run dev`, sign in as admin, visit `/admin/blog/new`. Fill in a title (slug auto-fills), an excerpt, and some content in the editor (try bold, a heading, a bullet list). Click "Save draft" — expect a toast and a redirect to `/admin/blog`. Click into the post again from the list, change the title, click "Publish" — expect a toast and redirect.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(protected)/(admin)/admin/blog/new" "apps/web/app/(protected)/(admin)/admin/blog/[id]"
git commit -m "feat: add admin new/edit blog post pages"
```

---

### Task 11: Admin Blog posts list page

**Files:**
- Create: `apps/web/app/(protected)/(admin)/admin/blog/page.tsx`
- Create: `apps/web/app/(protected)/(admin)/admin/blog/BlogPostsTable.tsx`

**Interfaces:**
- Consumes: `listBlogPosts`, `deleteBlogPost`, `updateBlogPostStatus` (Task 5); `listBlogCategories` (Task 4).

- [ ] **Step 1: Create `apps/web/app/(protected)/(admin)/admin/blog/page.tsx`**

```tsx
import Link from "next/link";
import { Newspaper, Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listBlogPosts } from "@/app/api/blog-action";
import { listBlogCategories } from "@/app/api/blog-category-action";
import BlogPostsTable from "./BlogPostsTable";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; categoryId?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const status = params.status ?? "";
  const categoryId = params.categoryId ?? "";

  const [{ posts, total, pages }, categories] = await Promise.all([
    listBlogPosts({ page, status, categoryId }),
    listBlogCategories(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="w-4 h-4" style={{ color: "#4f6ef7" }} />
            <span
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: "#4f6ef7" }}
            >
              Blog
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Posts</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            {total} post{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog/categories">
            <Button
              variant="outline"
              className="gap-1.5 border-[#1a2d4a] text-[#94a3b8]"
            >
              <FolderKanban className="w-4 h-4" /> Categories
            </Button>
          </Link>
          <Link href="/admin/blog/new">
            <Button className="gap-1.5">
              <Plus className="w-4 h-4" /> New Post
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`?status=${opt.value}&categoryId=${categoryId}&page=1`}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
            style={{
              borderColor: status === opt.value ? "#4f6ef7" : "#1a2d4a",
              background: status === opt.value ? "#4f6ef722" : "transparent",
              color: status === opt.value ? "#4f6ef7" : "#64748b",
            }}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Link
            href={`?status=${status}&page=1`}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
            style={{
              borderColor: !categoryId ? "#4f6ef7" : "#1a2d4a",
              background: !categoryId ? "#4f6ef722" : "transparent",
              color: !categoryId ? "#4f6ef7" : "#64748b",
            }}
          >
            All categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`?status=${status}&categoryId=${c.id}&page=1`}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
              style={{
                borderColor: categoryId === c.id ? c.color : "#1a2d4a",
                background:
                  categoryId === c.id ? `${c.color}22` : "transparent",
                color: categoryId === c.id ? c.color : "#64748b",
              }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <BlogPostsTable posts={posts} />

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "#64748b" }}>
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?status=${status}&categoryId=${categoryId}&page=${page - 1}`}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
                style={{
                  borderColor: "#1a2d4a",
                  color: "#94a3b8",
                  background: "#0f1e38",
                }}
              >
                Previous
              </Link>
            )}
            {page < pages && (
              <Link
                href={`?status=${status}&categoryId=${categoryId}&page=${page + 1}`}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
                style={{
                  borderColor: "#1a2d4a",
                  color: "#94a3b8",
                  background: "#0f1e38",
                }}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/web/app/(protected)/(admin)/admin/blog/BlogPostsTable.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteBlogPost, updateBlogPostStatus } from "@/app/api/blog-action";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: Date;
  category: { id: string; name: string; color: string } | null;
  author: { id: string; name: string | null } | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Published",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "#f59e0b",
  published: "#22c55e",
};

export default function BlogPostsTable({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function handleStatusChange(id: string, status: "draft" | "published") {
    setLoadingId(id);
    startTransition(async () => {
      const res = await updateBlogPostStatus(id, status);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status } : p)),
        );
        toast.success(`Marked as ${STATUS_LABELS[status]}`);
      }
      setLoadingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setLoadingId(id);
    startTransition(async () => {
      await deleteBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
      setLoadingId(null);
    });
  }

  if (posts.length === 0) {
    return (
      <div
        className="rounded-xl border py-16 text-center text-sm"
        style={{ borderColor: "#1a2d4a", background: "#0f1e38", color: "#64748b" }}
      >
        No posts found.
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden overflow-x-auto"
      style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
    >
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#1a2d4a" }}>
            {["Title", "Category", "Author", "Status", "Updated", "Actions"].map(
              (h) => (
                <TableHead
                  key={h}
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#3d5a80" }}
                >
                  {h}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((p) => (
            <TableRow key={p.id} style={{ borderColor: "#1a2d4a" }}>
              <TableCell className="font-medium text-white">
                {p.title}
              </TableCell>
              <TableCell className="text-xs" style={{ color: "#94a3b8" }}>
                {p.category?.name ?? "—"}
              </TableCell>
              <TableCell className="text-xs" style={{ color: "#94a3b8" }}>
                {p.author?.name ?? "—"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-[#1a2d4a]"
                      style={{ color: STATUS_COLORS[p.status] }}
                      disabled={loadingId === p.id && pending}
                    >
                      {loadingId === p.id && pending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        STATUS_LABELS[p.status]
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <DropdownMenuItem
                        key={key}
                        disabled={p.status === key}
                        onClick={() =>
                          handleStatusChange(p.id, key as "draft" | "published")
                        }
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell
                className="text-xs whitespace-nowrap"
                style={{ color: "#64748b" }}
              >
                {new Date(p.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/admin/blog/${p.id}/edit`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-[#1a2d4a]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 border-[#1a2d4a] text-destructive"
                    onClick={() => handleDelete(p.id)}
                    disabled={loadingId === p.id && pending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 3: Verify manually**

Visit `/admin/blog`. Expect the post(s) created in Task 10's manual check to appear, with working status filter chips, category filter chips, and a status dropdown that flips draft/published inline.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(protected)/(admin)/admin/blog/page.tsx" "apps/web/app/(protected)/(admin)/admin/blog/BlogPostsTable.tsx"
git commit -m "feat: add admin blog posts list page"
```

---

### Task 12: Public BlogCard component

**Files:**
- Create: `apps/web/app/blog/BlogCard.tsx`

**Interfaces:**
- Produces: `BlogCard({ post: { slug, title, excerpt, featuredImage, publishedAt, category } })` default export from `@/app/blog/BlogCard` (imported via relative path by Tasks 13 and 15).

- [ ] **Step 1: Create the file**

```tsx
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type BlogCardPost = {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  publishedAt: Date | null;
  category: { name: string; slug: string; color: string } | null;
};

export default function BlogCard({ post }: { post: BlogCardPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-background border border-border rounded-2xl overflow-hidden hover:border-[#1a9e5c]/40 hover:shadow-md transition-all"
    >
      {post.featuredImage ? (
        // Featured images are admin-pasted URLs from any host — next/image
        // would require allow-listing every domain, so a plain <img> is used.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-[#1a9e5c]/10" />
      )}
      <div className="flex flex-col gap-2 p-5 flex-1">
        {post.category && (
          <span
            className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
            style={{
              background: `${post.category.color}1a`,
              color: post.category.color,
            }}
          >
            {post.category.name}
          </span>
        )}
        <h2 className="font-bold text-foreground group-hover:text-[#1a9e5c] transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        {post.publishedAt && (
          <p className="text-xs text-muted-foreground/70 mt-1">
            {formatDistanceToNow(post.publishedAt, { addSuffix: true })}
          </p>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify**

Run (from `apps/web/`):

```bash
npx tsc --noEmit
```

Expected: no errors in `app/blog/BlogCard.tsx`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/blog/BlogCard.tsx
git commit -m "feat: add public BlogCard component"
```

---

### Task 13: Public blog listing page (`/blog`)

**Files:**
- Create: `apps/web/app/blog/page.tsx`

**Interfaces:**
- Consumes: `listPublishedBlogPosts` (Task 5); `BlogCard` (Task 12); `LandingNav`/`LandingFooter` (existing); `SITE_URL` from `@/lib/seo`.

- [ ] **Step 1: Create the file**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import BlogCard from "./BlogCard";
import { listPublishedBlogPosts } from "@/app/api/blog-action";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, guides, and updates on personal finance, budgeting, and expense tracking for UAE residents.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Blog | Fixpenses",
    description:
      "Tips, guides, and updates on personal finance, budgeting, and expense tracking for UAE residents.",
    url: `${SITE_URL}/blog`,
  },
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const { posts, pages } = await listPublishedBlogPosts({ page });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              Fixpenses Blog
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Money tips for{" "}
              <span className="text-[#1a9e5c]">UAE residents</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Guides, product updates, and practical advice for tracking
              every dirham.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No posts yet — check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              {page > 1 && (
                <Link
                  href={`/blog?page=${page - 1}`}
                  className="text-sm font-medium text-[#1a9e5c]"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                Page {page} of {pages}
              </span>
              {page < pages && (
                <Link
                  href={`/blog?page=${page + 1}`}
                  className="text-sm font-medium text-[#1a9e5c] flex items-center gap-1"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
```

- [ ] **Step 2: Verify manually**

Run `npm run dev`, visit `/blog` while logged out. Expect the published post(s) from earlier tasks to appear as cards; draft posts must **not** appear.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/blog/page.tsx
git commit -m "feat: add public blog listing page"
```

---

### Task 14: Public blog post detail page (`/blog/[slug]`)

**Files:**
- Create: `apps/web/app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getPublishedBlogPostBySlug` (Task 5); `SITE_URL`, `SITE_NAME` from `@/lib/seo`; the `.blog-content` CSS class (Task 8).

- [ ] **Step 1: Create the file**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedBlogPostBySlug } from "@/app/api/blog-action";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return {};

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const image = post.ogImage || post.featuredImage || undefined;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.ogImage || post.featuredImage || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.author?.name || SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {post.category && (
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-4"
              style={{
                background: `${post.category.color}1a`,
                color: post.category.color,
              }}
            >
              {post.category.name}
            </Link>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
            {post.author?.name && <span>{post.author.name}</span>}
            {post.publishedAt && (
              <>
                <span>&middot;</span>
                <span>
                  {post.publishedAt.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
          {post.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full rounded-2xl mb-10 object-cover max-h-[420px]"
            />
          )}
          {/* content is sanitized server-side in blog-action.ts before storage */}
          <div
            className="blog-content text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
      <LandingFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify manually**

Visit `/blog/<published-post-slug>`. Expect the title, category badge, author/date line, and formatted content (headings, lists, links) to render. View page source and confirm a `<script type="application/ld+json">` block with the post's `headline` is present. Visit `/blog/<draft-post-slug>` — expect a 404 page.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/blog/[slug]"
git commit -m "feat: add public blog post detail page"
```

---

### Task 15: Public blog category page (`/blog/category/[slug]`)

**Files:**
- Create: `apps/web/app/blog/category/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getBlogCategoryBySlug` (Task 4); `listPublishedBlogPosts` (Task 5); `BlogCard` (Task 12).

- [ ] **Step 1: Create the file**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import BlogCard from "../../BlogCard";
import { getBlogCategoryBySlug } from "@/app/api/blog-category-action";
import { listPublishedBlogPosts } from "@/app/api/blog-action";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getBlogCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: `${category.name} — Blog`,
    description:
      category.description || `Posts about ${category.name} on the Fixpenses blog.`,
    alternates: { canonical: `${SITE_URL}/blog/category/${category.slug}` },
  };
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? 1);

  const category = await getBlogCategoryBySlug(slug);
  if (!category) notFound();

  const { posts, pages } = await listPublishedBlogPosts({
    page,
    categorySlug: slug,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              Blog category
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No posts in this category yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
          {pages > 1 && (
            <p className="text-center text-sm text-muted-foreground mt-12">
              Page {page} of {pages}
            </p>
          )}
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
```

- [ ] **Step 2: Design pass with ui-ux-pro-max**

Invoke the `ui-ux-pro-max` skill (Skill tool, `skill: "ui-ux-pro-max"`) describing the three public blog pages built in Tasks 12–15 (`/blog` listing, `/blog/[slug]` detail, `/blog/category/[slug]`) and the existing brand palette (`#1a9e5c` green, shadcn `background`/`foreground`/`muted-foreground` tokens, Plus Jakarta Sans font). Apply its concrete recommendations (typography scale, spacing, card treatment, any icon/illustration suggestions) as edits to `apps/web/app/blog/page.tsx`, `apps/web/app/blog/BlogCard.tsx`, `apps/web/app/blog/[slug]/page.tsx`, `apps/web/app/blog/category/[slug]/page.tsx`, and the `.blog-content` rules in `apps/web/app/globals.css`, keeping every data-fetching call and prop signature from Tasks 12–15 unchanged.

- [ ] **Step 3: Verify manually**

Visit `/blog/category/<category-slug>` for the category created in Task 7. Expect the category name/description as the header and its published posts below. Visit `/blog/category/does-not-exist` — expect a 404.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/blog
git commit -m "feat: add public blog category page and design pass"
```

---

### Task 16: Dynamic sitemap entries

**Files:**
- Modify: `apps/web/app/sitemap.ts`

**Interfaces:**
- Consumes: `listPublishedBlogPostsForSitemap` (Task 5); `listBlogCategoriesForSitemap` (Task 4).

- [ ] **Step 1: Update `apps/web/app/sitemap.ts`**

Add these imports at the top of the file (after the existing `SITE_URL` import):

```ts
import { listPublishedBlogPostsForSitemap } from "@/app/api/blog-action";
import { listBlogCategoriesForSitemap } from "@/app/api/blog-category-action";
```

Change the function signature from:

```ts
export default function sitemap(): MetadataRoute.Sitemap {
```

to:

```ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
```

Add a `/blog` entry to the end of the existing `staticRoutes` array (right before its closing `];`):

```ts
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
```

Replace the final `return staticRoutes;` line with:

```ts
  const [posts, categories] = await Promise.all([
    listPublishedBlogPostsForSitemap(),
    listBlogCategoriesForSitemap(),
  ]);

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/blog/category/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
```

- [ ] **Step 2: Verify manually**

Run `npm run dev`, visit `/sitemap.xml`. Expect `<url>` entries for `/blog`, every published post's `/blog/<slug>`, and every category's `/blog/category/<slug>` — with no entry for any draft post's slug.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/sitemap.ts
git commit -m "feat: include blog posts and categories in sitemap"
```

---

### Task 17: Nav/footer links and end-to-end test

**Files:**
- Modify: `apps/web/components/LandingNav.tsx`
- Modify: `apps/web/components/LandingFooter.tsx`
- Create: `apps/web/e2e/blog.spec.ts`
- Modify: `apps/web/playwright.config.ts`

**Interfaces:**
- Consumes: the full admin blog flow (Tasks 6–11) and public blog flow (Tasks 13–16) end-to-end via the browser; `TEST_USER` session persisted by `apps/web/e2e/auth.setup.ts` (already admin, per `apps/web/e2e/auth.spec.ts`'s "admin user can access /admin panel" test).

- [ ] **Step 1: Add "Blog" to `apps/web/components/LandingNav.tsx`**

Change:

```ts
const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];
```

to:

```ts
const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];
```

- [ ] **Step 2: Add "Blog" to `apps/web/components/LandingFooter.tsx`**

Change:

```ts
  product: [
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#faq", label: "FAQ" },
    { href: "/#testimonials", label: "Testimonials" },
  ],
```

to:

```ts
  product: [
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#faq", label: "FAQ" },
    { href: "/#testimonials", label: "Testimonials" },
  ],
```

- [ ] **Step 3: Create `apps/web/e2e/blog.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

test.describe("Blog CMS", () => {
  test("admin can publish a post and view it live", async ({ page }) => {
    const title = `E2E Published Post ${Date.now()}`;

    await page.goto("/admin/blog/new");
    await page.waitForLoadState("networkidle");

    await page.locator("#post-title").fill(title);
    await page.locator("#post-excerpt").fill("Excerpt written by the e2e test.");
    await page.locator('[contenteditable="true"]').first().click();
    await page.keyboard.type(
      "Body of the e2e test post, including a <script> tag string to confirm sanitization.",
    );

    await page.getByRole("button", { name: "Publish" }).click();
    await page.waitForURL("**/admin/blog", { timeout: 10_000 });
    await expect(page.getByText(title)).toBeVisible();

    const slug = slugify(title);
    await page.goto(`/blog/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    // The literal "<script>" text typed above must render as text, not execute.
    await expect(page.locator("script[src]")).toHaveCount(0);
  });

  test("draft posts 404 on the public site", async ({ page }) => {
    const title = `E2E Draft Post ${Date.now()}`;

    await page.goto("/admin/blog/new");
    await page.waitForLoadState("networkidle");

    await page.locator("#post-title").fill(title);
    await page.locator("#post-excerpt").fill("Draft excerpt.");
    await page.locator('[contenteditable="true"]').first().click();
    await page.keyboard.type("Draft body.");

    await page.getByRole("button", { name: "Save draft" }).click();
    await page.waitForURL("**/admin/blog", { timeout: 10_000 });

    const slug = slugify(title);
    const response = await page.goto(`/blog/${slug}`);
    expect(response?.status()).toBe(404);
  });
});
```

- [ ] **Step 4: Register the spec in `apps/web/playwright.config.ts`**

Change:

```ts
    // 3. All other tests — reuse the saved session so login is skipped.
    {
      name: "chromium",
      testMatch: /ui-consistency\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
```

to:

```ts
    // 3. All other tests — reuse the saved session so login is skipped.
    {
      name: "chromium",
      testMatch: [/ui-consistency\.spec\.ts/, /blog\.spec\.ts/],
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
```

- [ ] **Step 5: Run the e2e tests**

Run (from `apps/web/`):

```bash
npx playwright test e2e/blog.spec.ts
```

Expected: both tests pass (`2 passed`). This depends on the `setup` project running first for the `chromium` project's `storageState` — Playwright's `dependencies: ["setup"]` handles that automatically when running the full suite; running just `e2e/blog.spec.ts` directly still works because Playwright resolves the `chromium` project's `dependencies` regardless of the file filter.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/LandingNav.tsx apps/web/components/LandingFooter.tsx apps/web/e2e/blog.spec.ts apps/web/playwright.config.ts
git commit -m "feat: add blog nav/footer links and e2e coverage"
```
