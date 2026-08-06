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
