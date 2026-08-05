# Blog CMS (Admin + Public) — Design

Date: 2026-08-05
Status: Approved, pending implementation plan

## Scope

This spec covers **Blogs + Blog Categories only**: admin CRUD, a WYSIWYG editor,
per-post SEO fields, dynamic sitemap inclusion, and public blog pages.

Explicitly **out of scope** (raised by the user as future ideas, deliberately
deferred): a "Resources" content type, and converting the existing static
`/features/*` pages into a CMS-driven module. Both should reuse this same
pattern (model + admin CRUD + WYSIWYG + SEO fields) in a future spec once
Blogs is built and proven.

Also explicitly skipped from this feature itself (YAGNI): comments,
related-posts, reading-time estimate, scheduled publishing (draft/published
only, no future-dated auto-publish), a file upload pipeline for images
(URL-only), multi-category/tags per post, RSS feed.

## Data model

Two new Prisma models in `apps/web/prisma/schema.prisma`, following the
existing snake_case-model / camelCase-field convention used by
`credit_card`, `bank_account`, `spending_limit`, etc.

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
  content         String         @db.Text   // sanitized HTML from Tiptap
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

Notes:
- `authorId` links to the existing `user` model — the admin who wrote the post.
- `categoryId` is nullable with `onDelete: SetNull` — deleting a category
  detaches its posts rather than deleting them.
- One category per post (not many-to-many): simpler admin UI, matches typical
  blog browsing UX.
- `metaTitle` / `metaDescription` / `ogImage` are optional overrides; when
  absent, rendering falls back to `title` / `excerpt` / `featuredImage`.
- Workflow: `status` toggles between `draft` and `published`; `publishedAt` is
  set the first time a post is published (and left untouched on later edits,
  so publish date doesn't jump on every save).

Migration workflow (per CLAUDE.md): edit schema →
`npx prisma migrate dev --name add_blog_models` (from `apps/web/`) →
`npx prisma generate`.

## New dependencies

- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`,
  `@tiptap/extension-link` — WYSIWYG editor, headless/React-friendly, stores
  clean HTML.
- `isomorphic-dompurify` — server-side sanitization of the Tiptap HTML output
  before it's persisted. The existing `lib/sanitize.ts#sanitizeString` strips
  *all* HTML tags and is not usable for rich content; a new sanitize helper
  (e.g. `sanitizeBlogHtml`) with an allowlist (headings, paragraphs, lists,
  links, images, bold/italic, code blocks) will live alongside it.

## Shared types (`packages/types/src/index.ts`)

Add `BlogPost`, `BlogCategory`, `BlogPostStatus` TypeScript interfaces plus
Zod schemas for create/update payloads, following the existing pattern in
that file (interfaces + schemas colocated per domain).

## Backend server actions

`apps/web/app/api/blog-action.ts` (admin-gated via `requireAdmin()`, mirrors
the `contact-action.ts` pattern):
- `listBlogPosts({ page, status, categoryId, search })`
- `getBlogPost(id)`
- `createBlogPost(data)`
- `updateBlogPost(id, data)`
- `deleteBlogPost(id)`
- `toggleBlogPostStatus(id)`

Slug is auto-generated from the title via a small `slugify()` helper,
editable in the form, and checked for uniqueness on save (append `-2`, `-3`,
etc. on collision). Content is run through `sanitizeBlogHtml` before being
written to the `content` column.

`apps/web/app/api/blog-category-action.ts`:
- `listBlogCategories()`
- `createBlogCategory(data)`
- `updateBlogCategory(id, data)`
- `deleteBlogCategory(id)`

## Admin UI

`app/(protected)/(admin)/admin/blog/`:

- **Sidebar**: one new **"Blog"** entry (new icon, e.g. `IconArticle`) added
  to the `navItems` array in `components/admin-app-sidebar.tsx`.
- **`/admin/blog`** — post list: table of title, category, status badge,
  author, updated date, row actions (edit/delete/toggle status). Status and
  category filter chips + pagination, visually matching the existing
  `/admin/enquiries` page. A "Categories" link/tab leads to
  `/admin/blog/categories`.
- **`/admin/blog/new`** and **`/admin/blog/[id]/edit`** — full-page form:
  title, slug (auto-generated, editable), category select, featured image
  URL, excerpt, Tiptap content editor, a collapsible "SEO" section (meta
  title, meta description, OG image), and a draft/published toggle + Save
  button.
- **`/admin/blog/categories`** — table + create/edit modal (name, slug,
  description, color), matching the lightweight CRUD style used elsewhere in
  admin (e.g. feature flags).

## Public pages

`apps/web/app/blog/`:

- **`/blog`** — paginated listing of published posts only, newest first;
  featured image + excerpt cards; category filter chips. Styled using the
  **ui-ux-pro-max** skill during implementation to match the existing
  landing-page aesthetic (`/features`, `/pricing`).
- **`/blog/[slug]`** — post detail page: sanitized HTML content rendered,
  author, published date, category badge. Includes JSON-LD `Article` schema
  and Open Graph / Twitter card meta tags sourced from
  `metaTitle`/`metaDescription`/`ogImage` (falling back to
  `title`/`excerpt`/`featuredImage`).
- **`/blog/category/[slug]`** — posts filtered by category, same card layout
  as `/blog`.
- Draft posts are not queryable on any public route (404 if requested by
  slug) — only `status: "published"` posts are ever fetched publicly.

## Sitemap

`apps/web/app/sitemap.ts`: after the existing static routes, fetch all
published posts and all categories and append dynamic entries — one for
`/blog`, one per post (`/blog/[slug]`, `lastModified: post.updatedAt`), and
one per category (`/blog/category/[slug]`).

## Site nav

Add `{ href: "/blog", label: "Blog" }` to the nav links in
`components/LandingNav.tsx` and to `components/LandingFooter.tsx`, consistent
with the existing Pricing/Contact links.

## Testing

- Unit-level: slug uniqueness/collision handling, `sanitizeBlogHtml`
  allowlist behavior (strips scripts/event handlers, keeps allowed tags).
- E2E (Playwright, `apps/web/e2e/`): admin can create → publish → view a post
  on `/blog/[slug]`; draft posts 404 publicly and don't appear in the
  sitemap; category CRUD reflected on `/blog/category/[slug]`.
