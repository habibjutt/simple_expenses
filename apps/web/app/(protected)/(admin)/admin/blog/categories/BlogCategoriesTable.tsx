"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { slugify } from "@/lib/slugify";
import {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "@/app/api/blog-category-action";

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
};

const EMPTY_FORM = { name: "", slug: "", description: "", color: "#4f6ef7" };

export default function BlogCategoriesTable({
  categories: initial,
}: {
  categories: BlogCategory[];
}) {
  const [categories, setCategories] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setOpen(true);
  }

  function openEdit(category: BlogCategory) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      color: category.color,
    });
    setSlugTouched(true);
    setOpen(true);
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  }

  function handleSubmit() {
    startTransition(async () => {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        color: form.color,
      };

      if (editingId) {
        const res = await updateBlogCategory(editingId, payload);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c)),
        );
        toast.success("Category updated");
      } else {
        const res = await createBlogCategory(payload);
        if ("error" in res) {
          toast.error(res.error);
          return;
        }
        setCategories((prev) =>
          [...prev, res.category].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
        toast.success("Category created");
      }
      setOpen(false);
    });
  }

  function handleDelete(id: string) {
    if (
      !confirm(
        "Delete this category? Posts in it will become uncategorized.",
      )
    )
      return;
    startTransition(async () => {
      await deleteBlogCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="w-4 h-4" /> New Category
        </Button>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: "#1a2d4a" }}>
              {["Name", "Slug", "Description", "Actions"].map((h) => (
                <TableHead
                  key={h}
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#3d5a80" }}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id} style={{ borderColor: "#1a2d4a" }}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: c.color }}
                    />
                    <span className="text-white">{c.name}</span>
                  </span>
                </TableCell>
                <TableCell className="text-xs" style={{ color: "#94a3b8" }}>
                  {c.slug}
                </TableCell>
                <TableCell className="text-xs" style={{ color: "#64748b" }}>
                  {c.description ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-[#1a2d4a]"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-[#1a2d4a] text-destructive"
                      onClick={() => handleDelete(c.id)}
                      disabled={pending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-sm"
                  style={{ color: "#64748b" }}
                >
                  No categories yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((prev) => ({ ...prev, slug: e.target.value }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-color">Color</Label>
              <Input
                id="cat-color"
                type="color"
                className="h-10 w-16 p-1"
                value={form.color}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, color: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={pending || !form.name || !form.slug}
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
