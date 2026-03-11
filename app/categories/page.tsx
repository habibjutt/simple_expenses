"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  seedDefaultCategories, type Category,
} from "@/app/api/category-action";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PRESET_COLORS = [
  "#ef4444","#f97316","#f59e0b","#84cc16","#22c55e","#14b8a6",
  "#06b6d4","#3b82f6","#6366f1","#a855f7","#ec4899","#f43f5e",
  "#64748b","#78716c","#0ea5e9","#10b981","#d946ef","#dc2626",
];

const PRESET_ICONS = [
  "utensils","shopping-cart","car","heart-pulse","tv","graduation-cap",
  "home","plane","sparkles","repeat","fuel","zap","users","gift",
  "trending-up","landmark","tag","banknote","briefcase","arrow-left-right",
];

function CategoryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Category>;
  onSave: (data: { name: string; color: string; icon: string; type: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? "#3b82f6");
  const [type, setType] = useState(initial?.type ?? "expense");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError("");
    try {
      await onSave({ name: name.trim(), color, icon: "tag", type });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category Name</label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Food & Dining"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Color</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? "border-slate-800 scale-110" : "border-transparent"}`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-7 h-7 rounded-full border-2 border-slate-300 cursor-pointer overflow-hidden"
            title="Custom color"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type</label>
        <div className="flex gap-2">
          {["expense","income","both"].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                type === t ? "bg-[#1a9e5c] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={loading} className="bg-[#1a9e5c] hover:bg-[#158a4f]">
          {loading ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      await seedDefaultCategories();
      const cats = await getCategories();
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: { name: string; color: string; icon: string; type: string }) => {
    await createCategory(data);
    setShowForm(false);
    load();
  };

  const handleUpdate = async (data: { name: string; color: string; icon: string; type: string }) => {
    if (!editId) return;
    await updateCategory(editId, data);
    setEditId(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCategory(deleteId);
    setDeleteId(null);
    load();
  };

  const filtered = filterType === "all" ? categories : categories.filter(c => c.type === filterType || c.type === "both");
  const editCat = categories.find(c => c.id === editId);

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5]">
        <div className="w-8 h-8 border-[3px] border-[#1a9e5c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />
      <main className="pb-24 lg:pb-8">
        {/* Page header */}
        <div className="bg-[#1a9e5c] text-white">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">Categories</h1>
                <p className="text-white/60 text-sm mt-0.5">Organize your transactions</p>
              </div>
              {!showForm && !editId && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-white text-[#1a9e5c] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mt-4">
              {["all","expense","income"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f as "all" | "expense" | "income")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                    filterType === f ? "bg-white text-[#1a9e5c]" : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-6 mt-5 space-y-4">
          {/* Add form */}
          {showForm && (
            <CategoryForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
          )}

          {/* Edit form */}
          {editId && editCat && (
            <CategoryForm
              initial={editCat}
              onSave={handleUpdate}
              onCancel={() => setEditId(null)}
            />
          )}

          {/* List */}
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-white rounded-2xl animate-pulse border border-slate-200" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-200/60">
              <Tag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No categories yet</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-[#1a9e5c] font-semibold hover:underline">
                + Create your first category
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="divide-y divide-slate-50">
                {filtered.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + "22" }}>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{cat.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{cat.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditId(cat.id); setShowForm(false); }}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-2.5 bg-slate-50 text-xs text-slate-400 border-t border-slate-100">
                {filtered.length} categor{filtered.length !== 1 ? "ies" : "y"}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the category. Existing transactions using this name will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
