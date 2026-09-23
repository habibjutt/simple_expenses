import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import {
  getPublishedBlogPostBySlug,
  listRelatedBlogPosts,
} from "@/app/api/blog-action";
import { readingMinutes, withHeadingAnchors } from "@/lib/blog";
import { TocInline, TocSidebar } from "./TableOfContents";
import BlogCard from "../BlogCard";
import { BlogCtaBanner } from "../BlogSections";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return {};

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const image = post.ogImage || post.featuredImage || undefined;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await listRelatedBlogPosts(post.slug, post.categoryId);
  const image = post.ogImage || post.featuredImage;
  const { html, toc } = withHeadingAnchors(post.content);
  const showToc = toc.length >= 3;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: image ? new URL(image, SITE_URL).toString() : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.author?.name || SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />
      <main className="flex-1">
        <header className="relative overflow-hidden border-b border-[#1a9e5c]/15 bg-[#eaf7f0] dark:bg-[#0c2418]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(26,158,92,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,158,92,0.08)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#1a9e5c]/20 blur-3xl"
          />
          <div
            className={`relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16 grid gap-10 items-center ${
              post.featuredImage ? "lg:grid-cols-[1fr_1.05fr]" : "max-w-3xl"
            }`}
          >
            <div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-[#1a9e5c] mb-6"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
              </Link>
              {post.category && (
                <div className="mb-4">
                  <Link
                    href={`/blog/category/${post.category.slug}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-background/80 ring-1 ring-inset ring-current/20"
                    style={{ color: post.category.color }}
                  >
                    {post.category.name}
                  </Link>
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12] font-extrabold tracking-tight text-foreground text-balance mb-5">
                {post.title}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {post.author?.name && (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {post.author.name}
                  </span>
                )}
                {post.publishedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {post.publishedAt.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {readingMinutes(post.content)} min read
                </span>
              </div>
            </div>
            {post.featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full aspect-[1200/630] rounded-2xl object-cover shadow-2xl shadow-[#0f5c37]/20 ring-1 ring-black/5"
              />
            )}
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div
            className={
              showToc
                ? "lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14"
                : undefined
            }
          >
            {showToc && (
              <aside className="hidden lg:block">
                <TocSidebar items={toc} />
              </aside>
            )}
            <article
              className={`max-w-3xl min-w-0 ${showToc ? "" : "mx-auto"}`}
            >
              {showToc && (
                <div className="lg:hidden">
                  <TocInline items={toc} />
                </div>
              )}
              {/* content is sanitized server-side in blog-action.ts before storage */}
              <div
                className="blog-content text-foreground"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </article>
          </div>
        </div>

        {related.length > 0 && (
          <section className="border-t border-border bg-muted/30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
                Keep reading
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((relatedPost) => (
                  <BlogCard key={relatedPost.slug} post={relatedPost} />
                ))}
              </div>
            </div>
          </section>
        )}

        <div className={related.length > 0 ? "bg-muted/30" : undefined}>
          <BlogCtaBanner />
        </div>
      </main>
      <LandingFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
