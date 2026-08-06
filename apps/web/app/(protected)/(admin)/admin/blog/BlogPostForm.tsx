"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/RichTextEditor";
import { slugify } from "@/lib/slugify";
import { createBlogPost, updateBlogPost } from "@/app/api/blog-action";

type BlogCategoryOption = { id: string; name: string };

type BlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  status: string;
  categoryId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
};

export default function BlogPostForm({
  categories,
  post,
}: {
  categories: BlogCategoryOption[];
  post?: BlogPostRecord;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [seoOpen, setSeoOpen] = useState(false);

  const [form, setForm] = useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    featuredImage: post?.featuredImage ?? "",
    categoryId: post?.categoryId ?? "",
    metaTitle: post?.metaTitle ?? "",
    metaDescription: post?.metaDescription ?? "",
    ogImage: post?.ogImage ?? "",
  });

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title),
    }));
  }

  function handleSubmit(status: "draft" | "published") {
    if (!form.title || !form.slug || !form.excerpt || !form.content) {
      toast.error("Title, slug, excerpt, and content are required");
      return;
    }

    startTransition(async () => {
      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        featuredImage: form.featuredImage || null,
        status,
        categoryId: form.categoryId || null,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        ogImage: form.ogImage || null,
      };

      if (post) {
        const res = await updateBlogPost(post.id, payload);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Post updated");
      } else {
        const res = await createBlogPost(payload);
        if ("error" in res) {
          toast.error(res.error);
          return;
        }
        toast.success(
          status === "published" ? "Post published" : "Draft saved",
        );
      }
      router.push("/admin/blog");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-1.5">
        <Label htmlFor="post-title">Title</Label>
        <Input
          id="post-title"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="How to track expenses in the UAE"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-slug">Slug</Label>
        <Input
          id="post-slug"
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setForm((prev) => ({ ...prev, slug: e.target.value }));
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-category">Category</Label>
        <Select
          value={form.categoryId || "none"}
          onValueChange={(value) =>
            setForm((prev) => ({
              ...prev,
              categoryId: value === "none" ? "" : value,
            }))
          }
        >
          <SelectTrigger id="post-category" className="w-full">
            <SelectValue placeholder="No category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No category</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-image">Featured image URL</Label>
        <Input
          id="post-image"
          value={form.featuredImage}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, featuredImage: e.target.value }))
          }
          placeholder="https://…"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-excerpt">Excerpt</Label>
        <Textarea
          id="post-excerpt"
          rows={3}
          value={form.excerpt}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, excerpt: e.target.value }))
          }
          placeholder="A short summary shown on the blog listing and used as the meta description fallback."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Content</Label>
        <RichTextEditor
          content={form.content}
          onChange={(html) =>
            setForm((prev) => ({ ...prev, content: html }))
          }
        />
      </div>

      <div className="rounded-lg border" style={{ borderColor: "#1a2d4a" }}>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white"
          onClick={() => setSeoOpen((v) => !v)}
        >
          SEO
          <span style={{ color: "#64748b" }}>{seoOpen ? "Hide" : "Show"}</span>
        </button>
        {seoOpen && (
          <div className="p-4 pt-0 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="post-meta-title">Meta title</Label>
              <Input
                id="post-meta-title"
                value={form.metaTitle}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, metaTitle: e.target.value }))
                }
                placeholder={form.title || "Falls back to the post title"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-meta-description">Meta description</Label>
              <Textarea
                id="post-meta-description"
                rows={2}
                value={form.metaDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    metaDescription: e.target.value,
                  }))
                }
                placeholder={form.excerpt || "Falls back to the excerpt"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-og-image">OG image URL</Label>
              <Input
                id="post-og-image"
                value={form.ogImage}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ogImage: e.target.value }))
                }
                placeholder={
                  form.featuredImage || "Falls back to the featured image"
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => handleSubmit("draft")}
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Save draft"
          )}
        </Button>
        <Button disabled={pending} onClick={() => handleSubmit("published")}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish"}
        </Button>
      </div>
    </div>
  );
}
