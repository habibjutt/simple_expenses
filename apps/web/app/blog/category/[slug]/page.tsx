import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import BlogCard, { BlogCategoryChips } from "../../BlogCard";
import { BlogCtaBanner, BlogPagination } from "../../BlogSections";
import { getBlogCategoryBySlug } from "@/app/api/blog-category-action";
import {
  listPublicBlogCategories,
  listPublishedBlogPosts,
} from "@/app/api/blog-action";
import { SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getBlogCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: `${category.name} Guides for UAE Residents`,
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

  const [{ posts, pages }, categories] = await Promise.all([
    listPublishedBlogPosts({ page, categorySlug: slug }),
    listPublicBlogCategories(),
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />
      <JsonLd
        data={breadcrumbSchema([
          ["Blog", "/blog"],
          [category.name, `/blog/category/${category.slug}`],
        ])}
      />
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
          <div className="max-w-6xl mx-auto mt-10">
            <BlogCategoryChips categories={categories} activeSlug={slug} />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
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
          <BlogPagination
            page={page}
            pages={pages}
            basePath={`/blog/category/${slug}`}
          />
        </section>

        <BlogCtaBanner />
      </main>
      <LandingFooter />
    </div>
  );
}
