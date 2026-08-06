import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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
      className="group flex flex-col bg-background border border-border rounded-2xl overflow-hidden hover:border-[#1a9e5c]/40 hover:shadow-md transition-all"
    >
      {post.featuredImage ? (
        // Featured images are admin-pasted URLs from any host — next/image
        // would require allow-listing every domain, so a plain <img> is used.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-[#1a9e5c]/10" />
      )}
      <div className="flex flex-col gap-2 p-5 flex-1">
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
        <h2 className="font-bold text-foreground group-hover:text-[#1a9e5c] transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        {post.publishedAt && (
          <p className="text-xs text-muted-foreground/70 mt-1">
            {formatDistanceToNow(post.publishedAt, { addSuffix: true })}
          </p>
        )}
      </div>
    </Link>
  );
}
