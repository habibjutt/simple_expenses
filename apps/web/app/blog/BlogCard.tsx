import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Calendar, Wallet } from "lucide-react";

type BlogCardPost = {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  publishedAt: Date | null;
  category: { name: string; slug: string; color: string } | null;
};

export default function BlogCard({ post }: { post: BlogCardPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-background border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[#1a9e5c]/40 hover:shadow-lg"
    >
      {post.featuredImage ? (
        // Featured images are admin-pasted URLs from any host — next/image
        // would require allow-listing every domain, so a plain <img> is used.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex w-full h-44 items-center justify-center bg-[#1a9e5c]/10">
          <Wallet className="h-9 w-9 text-[#1a9e5c]/40" strokeWidth={1.5} />
        </div>
      )}
      <div className="flex flex-col gap-2.5 p-5 flex-1">
        {post.category && (
          <span
            className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
            style={{
              background: `${post.category.color}1a`,
              color: post.category.color,
            }}
          >
            {post.category.name}
          </span>
        )}
        <h2 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-[#1a9e5c] line-clamp-2">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between gap-2 mt-1 pt-3 border-t border-border/60">
          {post.publishedAt ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
              {formatDistanceToNow(post.publishedAt, { addSuffix: true })}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a9e5c] opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
            Read
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
}
