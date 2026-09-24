/**
 * Creates or updates a blog post from a Markdown draft with YAML-style front
 * matter (title, meta_title, meta_description, slug, category, image,
 * excerpt). Safe to re-run: the post is matched by slug.
 *
 * Usage:
 *   npx tsx scripts/publish-blog-post.ts <draft.md> [more.md ...]            # save as draft
 *   npx tsx scripts/publish-blog-post.ts <draft.md> [more.md ...] --publish  # publish live
 *   npx tsx scripts/publish-blog-post.ts <draft.md> --dry-run             # print HTML only
 *
 * Featured images are served from public/images/blog/, so deploy the app
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
import { slugify } from "../lib/slugify";

const args = process.argv.slice(2);
const publish = args.includes("--publish");
const dryRun = args.includes("--dry-run");
const files = args.filter((a) => !a.startsWith("--"));

const CATEGORY_COLORS: Record<string, string> = {
  Budgeting: "#1a9e5c",
  "Credit Cards": "#0ea5e9",
};

// ─── Markdown → HTML (the subset our drafts use) ─────────────────────────────

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s: string) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, href: string) =>
      /^https?:\/\//.test(href)
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
        : `<a href="${href}">${text}</a>`,
    );
}

function markdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = line.match(/^(#{1,3}) (.*)$/);
    if (heading) {
      // The page renders the title as its own <h1>, so drop it here.
      if (heading[1].length > 1) {
        const level = heading[1].length;
        out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      }
      i++;
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].trim().slice(1, -1).split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      out.push(
        "<table><thead><tr>" +
          head.map((c) => `<th>${inline(c)}</th>`).join("") +
          "</tr></thead><tbody>" +
          body
            .map((r) => "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>")
            .join("") +
          "</tbody></table>",
      );
      continue;
    }
    const listMatch = line.match(/^(- |\d+\. )/);
    if (listMatch) {
      const ordered = listMatch[1] !== "- ";
      const items: string[] = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^(- |\d+\. )/, ""))}</li>`);
        i++;
      }
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||- |\d+\. )/.test(lines[i])) {
      para.push(lines[i].trim());
      i++;
    }
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

// ─── Front matter ────────────────────────────────────────────────────────────

function parseDraft(file: string) {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing front matter`);
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv && kv[2] && !kv[2].startsWith("[")) {
      meta[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1");
    }
  }
  for (const key of ["title", "slug", "meta_description", "category", "image"]) {
    if (!meta[key]) throw new Error(`${file}: front matter needs "${key}"`);
  }
  return { meta, html: markdownToHtml(match[2]) };
}

// ─── Main ────────────────────────────────────────────────────────────────────

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  if (files.length === 0) {
    throw new Error("Usage: publish-blog-post.ts <draft.md> [...] [--publish]");
  }
  if (dryRun) {
    for (const file of files) console.log(sanitizeBlogHtml(parseDraft(file).html));
    return;
  }
  const author = await prisma.user.findFirst({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  if (!author) throw new Error("No admin user found to author the post");

  for (const file of files) {
    const { meta, html } = parseDraft(file);
    const categorySlug = slugify(meta.category);
    const category = await prisma.blog_category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: {
        name: meta.category,
        slug: categorySlug,
        color: CATEGORY_COLORS[meta.category] ?? "#1a9e5c",
      },
    });

    const existing = await prisma.blog_post.findUnique({
      where: { slug: meta.slug },
    });
    const status = publish ? "published" : "draft";
    const data = {
      title: meta.title,
      excerpt: meta.excerpt || meta.meta_description,
      content: sanitizeBlogHtml(html),
      featuredImage: meta.image,
      ogImage: meta.image,
      metaTitle: meta.meta_title || null,
      metaDescription: meta.meta_description,
      status,
      categoryId: category.id,
      publishedAt: publish ? (existing?.publishedAt ?? new Date()) : null,
    };

    const post = existing
      ? await prisma.blog_post.update({ where: { id: existing.id }, data })
      : await prisma.blog_post.create({
          data: { ...data, slug: meta.slug, authorId: author.id },
        });
    console.log(
      `${existing ? "Updated" : "Created"} [${status}] /blog/${post.slug} (${category.name})`,
    );
  }
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
