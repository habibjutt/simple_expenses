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
