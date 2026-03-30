"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  getSpendingLimits,
  upsertSpendingLimit,
  deleteSpendingLimit,
  type SpendingLimit,
} from "@/app/api/spending-limit-action";
import { getCategories, type Category } from "@/app/api/category-action";
import { getReportData } from "@/app/api/reports-action";
import { getUserProfile } from "@/app/api/user-action";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus, Target, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import EmptyState from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FormCombobox } from "@/components/ui/form-combobox";

type CategoryStat = { category: string; amount: number; color: string };

export default function SpendingLimitsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [limits, setLimits] = useState<SpendingLimit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenseStats, setExpenseStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState("AED");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    if (session) {
      getUserProfile().then((p) => {
        if (p?.preferredCurrency) setPreferredCurrency(p.preferredCurrency);
      });
    }
  }, [session, isPending, router]);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [lims, cats, report] = await Promise.all([
        getSpendingLimits(month, year),
        getCategories(),
        getReportData(month, year),
      ]);
      setLimits(lims);
      setCategories(cats);
      setExpenseStats(report.expenseStats);
    } finally {
      setLoading(false);
    }
  }, [session, month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  const handleAdd = async () => {
    if (!newCat || !newAmount) return;
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) return;
    setFormError("");
    const result = await upsertSpendingLimit({
      categoryName: newCat,
      amount,
      month,
      year,
    });
    if (result?.error) {
      setFormError(result.error);
      return;
    }
    setShowAdd(false);
    setNewCat("");
    setNewAmount("");
    load();
  };

  const handleEdit = async (id: string) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;
    const limit = limits.find((l) => l.id === id);
    if (!limit) return;
    setFormError("");
    const result = await upsertSpendingLimit({
      categoryName: limit.categoryName,
      amount,
      month,
      year,
    });
    if (result?.error) {
      setFormError(result.error);
      return;
    }
    setEditingId(null);
    setEditAmount("");
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSpendingLimit(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const getSpent = (categoryName: string) => {
    const stat = expenseStats.find((s) => s.category === categoryName);
    return stat?.amount ?? 0;
  };

  const getCategoryColor = (name: string) => {
    const cat = categories.find((c) => c.name === name);
    return cat?.color ?? "#64748b";
  };

  const categoriesWithoutLimit = categories
    .filter((c) => c.type === "expense" || c.type === "both")
    .filter((c) => !limits.find((l) => l.categoryName === c.name));

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5]">
        <div className="w-8 h-8 border-[3px] border-[#1a9e5c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalBudget = limits.reduce((s, l) => s + l.amount, 0);
  const totalSpent = limits.reduce((s, l) => s + getSpent(l.categoryName), 0);

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />
      <main className="pb-24 lg:pb-8">
        {/* Page header */}
        <div className="bg-[#1a9e5c] text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">Spending Limits</h1>
                <p className="text-white/60 text-sm mt-0.5">
                  Set and track monthly budgets per category
                </p>
              </div>
              {!showAdd && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 bg-white text-[#1a9e5c] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-5 space-y-4">
          {/* Month nav */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-3 shadow-sm border border-slate-200/60">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <span className="font-semibold text-slate-800">{monthLabel}</span>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Overall progress */}
          {limits.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Total Budget
                  </p>
                  <p className="text-lg font-bold text-slate-800 tabular-nums">
                    {formatCurrency(totalBudget, preferredCurrency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Spent</p>
                  <p
                    className={`text-lg font-bold tabular-nums ${totalSpent > totalBudget ? "text-red-600" : "text-slate-800"}`}
                  >
                    {formatCurrency(totalSpent, preferredCurrency)}
                  </p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${totalSpent > totalBudget ? "bg-red-500" : totalSpent / totalBudget > 0.8 ? "bg-amber-500" : "bg-[#1a9e5c]"}`}
                  style={{
                    width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5 text-right">
                {totalBudget > 0
                  ? `${Math.round((totalSpent / totalBudget) * 100)}% used`
                  : ""}
                {totalSpent < totalBudget
                  ? ` · ${formatCurrency(totalBudget - totalSpent, preferredCurrency)} remaining`
                  : " · Over budget"}
              </p>
            </div>
          )}

          {/* Add form */}
          {showAdd && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                Add Budget Limit
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Category
                </label>
                <FormCombobox
                  value={newCat}
                  onValueChange={(v) => setNewCat(v)}
                  options={categoriesWithoutLimit.map((c) => ({
                    value: c.name,
                    label: c.name,
                  }))}
                  placeholder="Select category…"
                  searchPlaceholder="Search category…"
                  emptyText="No categories available."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Monthly Budget ({preferredCurrency})
                </label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAdd}
                  className="bg-[#1a9e5c] hover:bg-[#158a4f]"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAdd(false);
                    setNewCat("");
                    setNewAmount("");
                    setFormError("");
                  }}
                >
                  Cancel
                </Button>
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </div>
          )}

          {/* Limits list */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-white rounded-2xl animate-pulse border border-slate-200"
                />
              ))}
            </div>
          ) : limits.length === 0 && !showAdd ? (
            <EmptyState
              icon={Target}
              title={`No spending limits set for ${monthLabel}`}
              description="Set a monthly budget per category to stay on track"
              actionLabel="+ Set your first budget"
              onAction={() => setShowAdd(true)}
              actionStyle="link"
            />
          ) : (
            <div className="space-y-3">
              {limits.map((limit) => {
                const spent = getSpent(limit.categoryName);
                const color = getCategoryColor(limit.categoryName);
                const pct =
                  limit.amount > 0
                    ? Math.min((spent / limit.amount) * 100, 100)
                    : 0;
                const over = spent > limit.amount;
                const warn = !over && pct >= 80;

                return (
                  <div
                    key={limit.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: color + "22" }}
                        >
                          <CategoryIcon
                            icon={categories.find(c => c.name === limit.categoryName)?.icon ?? "tag"}
                            className="h-4 w-4"
                            color={color}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {limit.categoryName}
                          </p>
                          {over && (
                            <p className="text-xs text-red-500 font-medium">
                              Over budget!
                            </p>
                          )}
                          {warn && (
                            <p className="text-xs text-amber-500 font-medium">
                              Almost at limit
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingId(limit.id);
                            setEditAmount(String(limit.amount));
                          }}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteId(limit.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {editingId === limit.id ? (
                      <div className="flex gap-2 mb-3">
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleEdit(limit.id)}
                          className="bg-[#1a9e5c] hover:bg-[#158a4f] h-8 px-3"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                          className="h-8 px-3"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : null}

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${over ? "bg-red-500" : warn ? "bg-amber-500" : "bg-[#1a9e5c]"}`}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: over ? undefined : color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={
                          over ? "text-red-600 font-semibold" : "text-slate-500"
                        }
                      >
                        Spent: {formatCurrency(spent, preferredCurrency)}
                      </span>
                      <span className="text-slate-400">
                        Budget: {formatCurrency(limit.amount, preferredCurrency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove spending limit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the budget limit for this category this month.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
