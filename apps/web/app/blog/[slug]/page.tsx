import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { getPublishedBlogPostBySlug } from "@/app/api/blog-action";
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.ogImage || post.featuredImage || undefined,
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
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-[#1a9e5c] mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
          </Link>
          {post.category && (
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-4"
              style={{
                background: `${post.category.color}1a`,
                color: post.category.color,
              }}
            >
              {post.category.name}
            </Link>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
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
          </div>
          {post.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full rounded-2xl mb-10 object-cover max-h-[420px] shadow-sm"
            />
          )}
          {/* content is sanitized server-side in blog-action.ts before storage */}
          <div
            className="blog-content text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
      <LandingFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
