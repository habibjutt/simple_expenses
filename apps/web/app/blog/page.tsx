import type { Metadata } from "next";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import BlogCard, { BlogCategoryChips, FeaturedBlogCard } from "./BlogCard";
import { BlogCtaBanner, BlogPagination } from "./BlogSections";
import {
  listPublicBlogCategories,
  listPublishedBlogPosts,
} from "@/app/api/blog-action";
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
  const [{ posts, pages }, categories] = await Promise.all([
    listPublishedBlogPosts({ page }),
    listPublicBlogCategories(),
  ]);

  // The newest post gets the wide card, but only on the first page.
  const featured = page === 1 ? posts[0] : undefined;
  const rest = featured ? posts.slice(1) : posts;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1">
        <section className="relative overflow-hidden px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(26,158,92,0.14),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(127,127,127,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(127,127,127,0.07)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
          />
          <div className="relative max-w-2xl mx-auto space-y-5">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              Fixpenses Blog
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance">
              Money tips for{" "}
              <span className="text-[#1a9e5c]">UAE residents</span>
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              Budgeting guides, saving strategies, and practical advice for
              making every dirham count.
            </p>
          </div>
          <div className="relative max-w-6xl mx-auto mt-10">
            <BlogCategoryChips categories={categories} activeSlug="" />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              No posts yet. Check back soon.
            </p>
          ) : (
            <>
              {featured && <FeaturedBlogCard post={featured} />}
              {rest.length > 0 && (
                <>
                  {featured && (
                    <h2 className="mt-16 mb-6 text-xl font-bold tracking-tight text-foreground">
                      More guides
                    </h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map((post) => (
                      <BlogCard key={post.slug} post={post} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <BlogPagination page={page} pages={pages} basePath="/blog" />
        </section>

        <BlogCtaBanner />
      </main>

      <LandingFooter />
    </div>
  );
}
