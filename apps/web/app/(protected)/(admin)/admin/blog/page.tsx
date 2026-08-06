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
