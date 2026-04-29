"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addContribution,
  type SavingsGoal,
} from "@/app/api/savings-goal-action";
import { getUserProfile } from "@/app/api/user-action";
import { formatCurrency } from "@/lib/utils";
import {
  Target,
  Plus,
  Trash2,
  Pencil,
  Check,
  Trophy,
  Calendar,
  PiggyBank,
  TrendingUp,
  X,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";

const GOAL_COLORS = [
  "#1a9e5c",
  "#3b82f6",
  "#f97316",
  "#ef4444",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f59e0b",
  "#14b8a6",
];

function GoalCard({
  goal,
  currency,
  onContribute,
  onEdit,
  onDelete,
}: {
  goal: SavingsGoal;
  currency: string;
  onContribute: (g: SavingsGoal) => void;
  onEdit: (g: SavingsGoal) => void;
  onDelete: (id: string) => void;
}) {
  const pct =
    goal.targetAmount > 0
      ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
      : 0;
  const remaining = goal.targetAmount - goal.currentAmount;
  const [now] = useState(() => Date.now());
  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline).getTime() - now) / 86400000)
    : null;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${goal.isCompleted ? "border-emerald-200" : "border-slate-200/60"}`}
    >
      {/* Top accent bar */}
      <div className="h-1.5" style={{ backgroundColor: goal.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: goal.color + "20" }}
            >
              {goal.isCompleted ? (
                <Trophy className="h-5 w-5" style={{ color: goal.color }} />
              ) : (
                <Target className="h-5 w-5" style={{ color: goal.color }} />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">
                {goal.name}
              </h3>
              {goal.isCompleted ? (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" /> Goal achieved!
                </span>
              ) : daysLeft !== null ? (
                <span
                  className={`text-xs flex items-center gap-1 ${daysLeft <= 7 ? "text-red-500" : daysLeft <= 30 ? "text-amber-500" : "text-slate-400"}`}
                >
                  <Calendar className="h-3 w-3" />
                  {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                </span>
              ) : (
                <span className="text-xs text-slate-400">No deadline</span>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500">
              <span className="font-semibold text-slate-800">
                {formatCurrency(goal.currentAmount, currency)}
              </span>{" "}
              saved
            </span>
            <span className="text-slate-400">
              Target: {formatCurrency(goal.targetAmount, currency)}
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: goal.color }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span
              className="text-xs font-semibold"
              style={{ color: goal.color }}
            >
              {pct.toFixed(0)}%
            </span>
            {!goal.isCompleted && remaining > 0 && (
              <span className="text-xs text-slate-400">
                {formatCurrency(remaining, currency)} to go
              </span>
            )}
          </div>
        </div>

        {!goal.isCompleted && (
          <button
            onClick={() => onContribute(goal)}
            className="mt-4 w-full py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: goal.color }}
          >
            <Plus className="h-4 w-4" />
            Add Contribution
          </button>
        )}
      </div>
    </div>
  );
}

type ModalMode = "create" | "edit" | "contribute";

export default function GoalsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formColor, setFormColor] = useState(GOAL_COLORS[0]);
  const [formDeadline, setFormDeadline] = useState("");
  const [contribAmount, setContribAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setGoals(await getSavingsGoals());
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setFormName("");
    setFormTarget("");
    setFormColor(GOAL_COLORS[0]);
    setFormDeadline("");
    setActiveGoal(null);
    setError(null);
    setModalMode("create");
  };

  const openEdit = (g: SavingsGoal) => {
    setFormName(g.name);
    setFormTarget(String(g.targetAmount));
    setFormColor(g.color);
    setFormDeadline(
      g.deadline ? new Date(g.deadline).toISOString().split("T")[0] : "",
    );
    setActiveGoal(g);
    setError(null);
    setModalMode("edit");
  };

  const openContribute = (g: SavingsGoal) => {
    setContribAmount("");
    setActiveGoal(g);
    setError(null);
    setModalMode("contribute");
  };

  const handleSave = async () => {
    const target = parseFloat(formTarget);
    if (!formName.trim()) return setError("Name is required");
    if (isNaN(target) || target <= 0)
      return setError("Enter a valid target amount");
    setSaving(true);
    setError(null);
    try {
      const deadline = formDeadline ? new Date(formDeadline) : null;
      let result;
      if (modalMode === "create") {
        result = await createSavingsGoal({
          name: formName.trim(),
          targetAmount: target,
          color: formColor,
          deadline,
        });
      } else if (modalMode === "edit" && activeGoal) {
        result = await updateSavingsGoal(activeGoal.id, {
          name: formName.trim(),
          targetAmount: target,
          color: formColor,
          deadline,
        });
      }
      if (result?.error) {
        setError(result.error);
        return;
      }
      await load();
      setModalMode(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleContribute = async () => {
    const amt = parseFloat(contribAmount);
    if (isNaN(amt) || amt <= 0) return setError("Enter a valid amount");
    if (!activeGoal) return;
    setSaving(true);
    setError(null);
    try {
      const result = await addContribution(activeGoal.id, amt);
      if (result?.error) {
        setError(result.error);
        return;
      }
      await load();
      setModalMode(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await deleteSavingsGoal(id);
      await load();
    } catch (e) {
      alert((e as Error).message || "Failed to delete goal");
    }
  };

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5]">
        <div className="w-8 h-8 border-[3px] border-[#1a9e5c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const completed = goals.filter((g) => g.isCompleted).length;
  const active = goals.filter((g) => !g.isCompleted);
  const done = goals.filter((g) => g.isCompleted);

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />
      <main className="pb-24 lg:pb-8">
        {/* Hero */}
        <div className="bg-[#1a9e5c] text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">Savings Goals</h1>
                <p className="text-white/60 text-sm mt-0.5">
                  Track and reach your financial targets
                </p>
              </div>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-white text-[#1a9e5c] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Goal
              </button>
            </div>

            {/* Stats row */}
            {goals.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <PiggyBank className="h-4 w-4 mx-auto mb-1 text-white/70" />
                  <p className="text-sm font-bold">
                    {formatCurrency(totalSaved, preferredCurrency)}
                  </p>
                  <p className="text-xs text-white/60">Total saved</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Target className="h-4 w-4 mx-auto mb-1 text-white/70" />
                  <p className="text-sm font-bold">
                    {formatCurrency(totalTarget, preferredCurrency)}
                  </p>
                  <p className="text-xs text-white/60">Total target</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Trophy className="h-4 w-4 mx-auto mb-1 text-white/70" />
                  <p className="text-sm font-bold">
                    {completed}/{goals.length}
                  </p>
                  <p className="text-xs text-white/60">Completed</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-[3px] border-[#1a9e5c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : goals.length === 0 ? (
            <EmptyState
              icon={PiggyBank}
              title="No savings goals yet"
              description="Create a savings goal to start tracking your progress"
              actionLabel="Create your first goal"
              onAction={openCreate}
            />
          ) : (
            <>
              {/* Active goals */}
              {active.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-[#1a9e5c]" />
                    <h2 className="text-sm font-semibold text-slate-700">
                      In Progress ({active.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {active.map((g) => (
                      <GoalCard
                        key={g.id}
                        goal={g}
                        currency={preferredCurrency}
                        onContribute={openContribute}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Completed goals */}
              {done.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <h2 className="text-sm font-semibold text-slate-700">
                      Completed ({done.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {done.map((g) => (
                      <GoalCard
                        key={g.id}
                        goal={g}
                        currency={preferredCurrency}
                        onContribute={openContribute}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create / Edit Modal */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">
                {modalMode === "create" ? "New Savings Goal" : "Edit Goal"}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Goal Name
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Emergency Fund, Vacation..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c]/30 focus:border-[#1a9e5c]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Target Amount ({preferredCurrency})
                </label>
                <input
                  type="number"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c]/30 focus:border-[#1a9e5c]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Deadline (optional)
                </label>
                <input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c]/30 focus:border-[#1a9e5c]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFormColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${formColor === c ? "border-slate-700 scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={() => setModalMode(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#1a9e5c] text-white text-sm font-semibold hover:bg-[#158a4f] disabled:opacity-60 transition-colors"
              >
                {saving
                  ? "Saving…"
                  : modalMode === "create"
                    ? "Create Goal"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {modalMode === "contribute" && activeGoal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-800">Add Contribution</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeGoal.name}
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-slate-50 rounded-xl p-3 flex justify-between text-sm">
                <span className="text-slate-500">Current</span>
                <span className="font-semibold">
                  {formatCurrency(activeGoal.currentAmount, preferredCurrency)}
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex justify-between text-sm">
                <span className="text-slate-500">Remaining</span>
                <span className="font-semibold text-[#1a9e5c]">
                  {formatCurrency(
                    activeGoal.targetAmount - activeGoal.currentAmount,
                    preferredCurrency,
                  )}
                </span>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Amount to add ({preferredCurrency})
                </label>
                <input
                  type="number"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  autoFocus
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e5c]/30 focus:border-[#1a9e5c]"
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={() => setModalMode(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContribute}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#1a9e5c] text-white text-sm font-semibold hover:bg-[#158a4f] disabled:opacity-60 transition-colors"
              >
                {saving ? "Adding…" : "Add Contribution"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
