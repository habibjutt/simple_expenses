"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { getReportData, getMonthlyTrend, getBudgetVsActual } from "@/app/api/reports-action";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PieChart as PieIcon, Target } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  type PieLabelRenderProps,
} from "recharts";
import ErrorBoundary from "@/components/ErrorBoundary";

type CategoryStat = { category: string; amount: number; color: string; icon: string };
type MonthlyData = { month: string; income: number; expenses: number };
type BudgetItem = { category: string; budget: number; actual: number; color: string; icon: string };

const RADIAN = Math.PI / 180;
const renderLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if ((percent ?? 0) < 0.04) return null;
  const ir = Number(innerRadius ?? 0);
  const or = Number(outerRadius ?? 0);
  const r = ir + (or - ir) * 0.6;
  const angle = Number(midAngle ?? 0);
  const x = Number(cx ?? 0) + r * Math.cos(-angle * RADIAN);
  const y = Number(cy ?? 0) + r * Math.sin(-angle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ReportsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState<"categories" | "trend" | "budget">("categories");
  const [loading, setLoading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expenseStats, setExpenseStats] = useState<CategoryStat[]>([]);
  const [incomeStats, setIncomeStats] = useState<CategoryStat[]>([]);
  const [trendData, setTrendData] = useState<MonthlyData[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  const loadReport = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const data = await getReportData(month, year);
      setTotalIncome(data.totalIncome);
      setTotalExpenses(data.totalExpenses);
      setExpenseStats(data.expenseStats);
      setIncomeStats(data.incomeStats);
    } finally {
      setLoading(false);
    }
  }, [session, month, year]);

  const loadTrend = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const data = await getMonthlyTrend(year);
      setTrendData(data);
    } finally {
      setLoading(false);
    }
  }, [session, year]);

  const loadBudget = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const data = await getBudgetVsActual(month, year);
      setBudgetData(data);
    } finally {
      setLoading(false);
    }
  }, [session, month, year]);

  useEffect(() => {
    if (tab === "categories") loadReport();
    else if (tab === "trend") loadTrend();
    else loadBudget();
  }, [tab, loadReport, loadTrend, loadBudget]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5]">
        <div className="w-8 h-8 border-[3px] border-[#1a9e5c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const net = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />
      <main className="pb-24 lg:pb-8">
        {/* Page header */}
        <div className="bg-[#1a9e5c] text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
            <h1 className="text-lg font-bold">Reports</h1>
            <p className="text-white/60 text-sm mt-0.5">Understand where your money goes</p>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              {[
                { id: "categories", label: "By Category" },
                { id: "trend", label: "Monthly Trend" },
                { id: "budget", label: "Budget vs Actual" },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as "categories" | "trend" | "budget")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    tab === t.id ? "bg-white text-[#1a9e5c]" : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-5">
          {/* Month nav (for categories + budget tabs) */}
          {(tab === "categories" || tab === "budget") && (
            <div className="flex items-center justify-between mb-5 bg-white rounded-2xl p-3 shadow-sm border border-slate-200/60">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>
              <span className="font-semibold text-slate-800">{monthLabel}</span>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 transition-colors" disabled={month === now.getMonth() + 1 && year === now.getFullYear()}>
                <ChevronRight className="h-5 w-5 text-slate-600 disabled:opacity-30" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-[3px] border-[#1a9e5c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tab === "categories" ? (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs text-slate-500 font-medium">Income</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 tabular-nums">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs text-slate-500 font-medium">Expenses</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 tabular-nums">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className={`rounded-2xl p-4 shadow-sm border text-center ${net >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                  <span className="text-xs font-medium text-slate-500 block mb-1">Net</span>
                  <p className={`text-sm font-bold tabular-nums ${net >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(net)}</p>
                </div>
              </div>

              {/* Expense donut + list */}
              {expenseStats.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-5">
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                    <div className="w-1.5 h-5 rounded-full bg-red-500" />
                    <h2 className="text-sm font-bold text-slate-800">Expenses by Category</h2>
                  </div>
                  <div className="md:flex">
                    <div className="flex items-center justify-center py-4 md:w-56 md:shrink-0">
                      <ErrorBoundary>
                        <PieChart width={180} height={180}>
                          <Pie data={expenseStats} cx={85} cy={85} innerRadius={45} outerRadius={80} dataKey="amount" labelLine={false} label={renderLabel}>
                            {expenseStats.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                        </PieChart>
                      </ErrorBoundary>
                    </div>
                    <div className="flex-1 divide-y divide-slate-50">
                      {expenseStats.map((cat, i) => {
                        const pct = totalExpenses > 0 ? ((cat.amount / totalExpenses) * 100).toFixed(1) : "0";
                        return (
                          <div key={i} className="flex items-center gap-3 px-5 py-3">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + "22" }}>
                              <CategoryIcon icon={cat.icon} className="h-3.5 w-3.5" color={cat.color} />
                            </div>
                            <span className="flex-1 text-sm text-slate-700 truncate">{cat.category}</span>
                            <span className="text-xs text-slate-400">{pct}%</span>
                            <span className="text-sm font-semibold text-slate-800 tabular-nums">{formatCurrency(cat.amount)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-200/60 mb-5">
                  <PieIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No expense data for {monthLabel}</p>
                </div>
              )}

              {/* Income list */}
              {incomeStats.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                    <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
                    <h2 className="text-sm font-bold text-slate-800">Income by Category</h2>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {incomeStats.map((cat, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + "22" }}>
                          <CategoryIcon icon={cat.icon} className="h-3.5 w-3.5" color={cat.color} />
                        </div>
                        <span className="flex-1 text-sm text-slate-700">{cat.category}</span>
                        <span className="text-sm font-semibold text-emerald-700 tabular-nums">+{formatCurrency(cat.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : tab === "trend" ? (
            /* Monthly trend bar chart */
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <div className="w-1.5 h-5 rounded-full bg-indigo-500" />
                <h2 className="text-sm font-bold text-slate-800">Income vs Expenses — {year}</h2>
              </div>
              <div className="p-4">
                {trendData.length > 0 ? (
                  <ErrorBoundary>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }} barSize={14} barGap={2}>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#1a9e5c" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ErrorBoundary>
                ) : (
                  <p className="text-center text-sm text-slate-400 py-16">No data for {year}</p>
                )}
              </div>
            </div>
          ) : (
            /* Budget vs Actual */
            budgetData.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-200/60">
                <Target className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-1">No budget set for {monthLabel}</p>
                <p className="text-xs text-slate-400">Set spending limits in the <a href="/spending-limits" className="text-[#1a9e5c] underline">Spending Limits</a> page</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                  <div className="w-1.5 h-5 rounded-full bg-violet-500" />
                  <h2 className="text-sm font-bold text-slate-800">Budget vs Actual — {monthLabel}</h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {budgetData.map((item, i) => {
                    const pct = item.budget > 0 ? Math.min((item.actual / item.budget) * 100, 100) : 0;
                    const over = item.actual > item.budget;
                    return (
                      <div key={i} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + "22" }}>
                              <CategoryIcon icon={item.icon} className="h-3.5 w-3.5" color={item.color} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{item.category}</span>
                            {over && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Over budget</span>}
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-semibold tabular-nums ${over ? "text-red-600" : "text-slate-800"}`}>{formatCurrency(item.actual)}</span>
                            <span className="text-xs text-slate-400 ml-1">/ {formatCurrency(item.budget)}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-[#1a9e5c]"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-slate-400">{pct.toFixed(0)}% used</span>
                          {over ? (
                            <span className="text-xs text-red-500 font-medium">+{formatCurrency(item.actual - item.budget)} over</span>
                          ) : (
                            <span className="text-xs text-emerald-600 font-medium">{formatCurrency(item.budget - item.actual)} left</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Summary */}
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Total Budget</span>
                    <span className="font-semibold text-slate-800 tabular-nums">{formatCurrency(budgetData.reduce((s, i) => s + i.budget, 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-500 font-medium">Total Actual</span>
                    <span className={`font-semibold tabular-nums ${budgetData.reduce((s, i) => s + i.actual, 0) > budgetData.reduce((s, i) => s + i.budget, 0) ? "text-red-600" : "text-[#1a9e5c]"}`}>
                      {formatCurrency(budgetData.reduce((s, i) => s + i.actual, 0))}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}