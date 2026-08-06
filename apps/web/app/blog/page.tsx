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
