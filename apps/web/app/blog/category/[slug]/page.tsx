import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-muted-foreground text-balance">
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
            <div className="flex items-center justify-center gap-3 mt-14">
              {page > 1 && (
                <Link
                  href={`/blog/category/${slug}?page=${page - 1}`}
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-[#1a9e5c]/40 hover:text-[#1a9e5c]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                Page {page} of {pages}
              </span>
              {page < pages && (
                <Link
                  href={`/blog/category/${slug}?page=${page + 1}`}
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-[#1a9e5c]/40 hover:text-[#1a9e5c]"
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
