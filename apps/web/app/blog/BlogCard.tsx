import Link from "next/link";
import { ArrowRight, Calendar, Clock, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export type BlogCardPost = {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  publishedAt: Date | null;
  readingMinutes: number;
  category: { name: string; slug: string; color: string } | null;
};

type BlogCategoryChip = { name: string; slug: string; color: string };

function formatPostDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PostImage({
  post,
  className,
}: {
  post: BlogCardPost;
  className: string;
}) {
  if (!post.featuredImage) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-[#1a9e5c]/15 via-[#1a9e5c]/5 to-transparent",
          className,
        )}
      >
        <Wallet className="h-10 w-10 text-[#1a9e5c]/40" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    // Featured images are admin-pasted URLs from any host — next/image
    // would require allow-listing every domain, so a plain <img> is used.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.featuredImage}
      alt={post.title}
      loading="lazy"
      className={cn(
        "object-cover transition-transform duration-500 group-hover:scale-[1.04]",
        className,
      )}
    />
  );
}

function CategoryBadge({
  category,
}: {
  category: NonNullable<BlogCardPost["category"]>;
}) {
  return (
    <span
      className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: `${category.color}1a`, color: category.color }}
    >
      {category.name}
    </span>
  );
}

function PostMeta({ post }: { post: BlogCardPost }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {post.publishedAt && (
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
          {formatPostDate(post.publishedAt)}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
        {post.readingMinutes} min read
      </span>
    </div>
  );
}

export default function BlogCard({ post }: { post: BlogCardPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-background border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[#1a9e5c]/40 hover:shadow-xl hover:shadow-[#1a9e5c]/5"
    >
      <div className="overflow-hidden">
        <PostImage post={post} className="w-full aspect-[1200/630]" />
      </div>
      <div className="flex flex-col gap-3 p-5 flex-1">
        {post.category && <CategoryBadge category={post.category} />}
        <h2 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-[#1a9e5c] line-clamp-2">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
          <PostMeta post={post} />
          <ArrowRight
            className="h-4 w-4 shrink-0 text-[#1a9e5c] opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
            strokeWidth={2}
          />
        </div>
      </div>
    </Link>
  );
}

/** Wide card for the newest post at the top of the blog index. */
export function FeaturedBlogCard({ post }: { post: BlogCardPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-border bg-background transition-all duration-200 hover:border-[#1a9e5c]/40 hover:shadow-2xl hover:shadow-[#1a9e5c]/10 lg:grid-cols-[1.3fr_1fr] lg:items-center"
    >
      <div className="overflow-hidden lg:m-4 lg:rounded-2xl">
        <PostImage post={post} className="w-full aspect-[1200/630]" />
      </div>
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:py-8 lg:pl-4 lg:pr-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#1a9e5c] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
            Latest
          </span>
          {post.category && <CategoryBadge category={post.category} />}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-foreground text-balance transition-colors group-hover:text-[#1a9e5c]">
          {post.title}
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        <PostMeta post={post} />
        <span className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#1a9e5c]">
          Read the guide
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            strokeWidth={2}
          />
        </span>
      </div>
    </Link>
  );
}

/** Horizontal category filter. `activeSlug` of "" highlights "All posts". */
export function BlogCategoryChips({
  categories,
  activeSlug,
}: {
  categories: BlogCategoryChip[];
  activeSlug: string;
}) {
  if (categories.length === 0) return null;

  const chipClass =
    "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors";
  const idle =
    "border-border text-muted-foreground hover:border-[#1a9e5c]/40 hover:text-[#1a9e5c]";
  const active = "border-[#1a9e5c] bg-[#1a9e5c] text-white";

  return (
    <nav
      aria-label="Blog categories"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
    >
      <Link
        href="/blog"
        className={cn(chipClass, activeSlug === "" ? active : idle)}
      >
        All posts
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/blog/category/${category.slug}`}
          className={cn(
            chipClass,
            activeSlug === category.slug ? active : idle,
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
