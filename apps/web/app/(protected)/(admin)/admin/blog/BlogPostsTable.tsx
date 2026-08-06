"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteBlogPost, updateBlogPostStatus } from "@/app/api/blog-action";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: Date;
  category: { id: string; name: string; color: string } | null;
  author: { id: string; name: string | null } | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Published",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "#f59e0b",
  published: "#22c55e",
};

export default function BlogPostsTable({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function handleStatusChange(id: string, status: "draft" | "published") {
    setLoadingId(id);
    startTransition(async () => {
      const res = await updateBlogPostStatus(id, status);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status } : p)),
        );
        toast.success(`Marked as ${STATUS_LABELS[status]}`);
      }
      setLoadingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setLoadingId(id);
    startTransition(async () => {
      await deleteBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
      setLoadingId(null);
    });
  }

  if (posts.length === 0) {
    return (
      <div
        className="rounded-xl border py-16 text-center text-sm"
        style={{ borderColor: "#1a2d4a", background: "#0f1e38", color: "#64748b" }}
      >
        No posts found.
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden overflow-x-auto"
      style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
    >
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#1a2d4a" }}>
            {["Title", "Category", "Author", "Status", "Updated", "Actions"].map(
              (h) => (
                <TableHead
                  key={h}
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#3d5a80" }}
                >
                  {h}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((p) => (
            <TableRow key={p.id} style={{ borderColor: "#1a2d4a" }}>
              <TableCell className="font-medium text-white">
                {p.title}
              </TableCell>
              <TableCell className="text-xs" style={{ color: "#94a3b8" }}>
                {p.category?.name ?? "—"}
              </TableCell>
              <TableCell className="text-xs" style={{ color: "#94a3b8" }}>
                {p.author?.name ?? "—"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-[#1a2d4a]"
                      style={{ color: STATUS_COLORS[p.status] }}
                      disabled={loadingId === p.id && pending}
                    >
                      {loadingId === p.id && pending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        STATUS_LABELS[p.status]
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <DropdownMenuItem
                        key={key}
                        disabled={p.status === key}
                        onClick={() =>
                          handleStatusChange(p.id, key as "draft" | "published")
                        }
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell
                className="text-xs whitespace-nowrap"
                style={{ color: "#64748b" }}
              >
                {new Date(p.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/admin/blog/${p.id}/edit`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-[#1a2d4a]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 border-[#1a2d4a] text-destructive"
                    onClick={() => handleDelete(p.id)}
                    disabled={loadingId === p.id && pending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
