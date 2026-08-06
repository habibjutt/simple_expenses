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
