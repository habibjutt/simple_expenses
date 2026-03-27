import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { reports } from "@simple-expenses/api";
import { formatCurrency } from "@simple-expenses/utils";
import type {
  ReportSummary,
  ReportTrend,
  ReportBudget,
} from "@simple-expenses/types";
import { colors, fonts, shadow } from "../../lib/theme";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type Tab = "summary" | "trend" | "budget";

export default function ReportsScreen() {
  const now = new Date();
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const qc = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      qc.invalidateQueries({ queryKey: ["reports-summary"] });
      qc.invalidateQueries({ queryKey: ["reports-trend"] });
      qc.invalidateQueries({ queryKey: ["reports-budget"] });
    }, [qc]),
  );

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["reports-summary", month, year],
    queryFn: () => reports.summary(month, year),
  });

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ["reports-trend", year],
    queryFn: () => reports.trend(year),
  });

  const { data: budgetData, isLoading: budgetLoading } = useQuery({
    queryKey: ["reports-budget", month, year],
    queryFn: () => reports.budget(month, year),
  });

  const prevPeriod = () => {
    if (activeTab === "trend") {
      setYear((y) => y - 1);
    } else if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextPeriod = () => {
    if (activeTab === "trend") {
      setYear((y) => y + 1);
    } else if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const isLoading =
    (activeTab === "summary" && summaryLoading) ||
    (activeTab === "trend" && trendLoading) ||
    (activeTab === "budget" && budgetLoading);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.title}>Reports</Text>
      </View>

      {/* Tab selector */}
      <View style={s.tabs}>
        {(["summary", "trend", "budget"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[s.tabText, activeTab === tab && s.tabTextActive]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date navigator */}
      <View style={s.dateNav}>
        <TouchableOpacity onPress={prevPeriod} style={s.dateArrow}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={s.datePeriod}>
          {activeTab === "trend"
            ? `${year}`
            : `${monthNames[month - 1]} ${year}`}
        </Text>
        <TouchableOpacity onPress={nextPeriod} style={s.dateArrow}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : activeTab === "summary" ? (
          <SummaryTab data={summaryData} />
        ) : activeTab === "trend" ? (
          <TrendTab data={trendData} />
        ) : (
          <BudgetTab data={budgetData} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Summary Tab ──────────────────────────────────────────── */

function SummaryTab({ data }: { data?: ReportSummary }) {
  if (!data || data.summary.length === 0) {
    return (
      <EmptyState icon="bar-chart-outline" message="No data for this period" />
    );
  }

  const maxAmount = Math.max(
    ...data.summary.map((c) => Math.max(c.expense, c.income)),
    1,
  );

  return (
    <View>
      {/* Totals */}
      <View style={s.totalsRow}>
        <View style={[s.totalCard, { backgroundColor: colors.dangerDim }]}>
          <Text style={[s.totalLabel, { color: colors.danger }]}>
            Expenses
          </Text>
          <Text style={[s.totalAmount, { color: colors.danger }]}>
            {formatCurrency(data.totalExpense)}
          </Text>
        </View>
        <View style={[s.totalCard, { backgroundColor: colors.successDim }]}>
          <Text style={[s.totalLabel, { color: colors.success }]}>
            Income
          </Text>
          <Text style={[s.totalAmount, { color: colors.success }]}>
            {formatCurrency(data.totalIncome)}
          </Text>
        </View>
      </View>

      {/* Category breakdown */}
      <View style={[s.card, shadow.card]}>
        <Text style={s.sectionTitle}>By Category</Text>
        {data.summary.map((item, i) => (
          <View
            key={item.category}
            style={[
              s.catRow,
              i < data.summary.length - 1 && s.catRowBorder,
            ]}
          >
            <Text style={s.catName} numberOfLines={1}>
              {item.category}
            </Text>
            <View style={s.barContainer}>
              <View
                style={[
                  s.bar,
                  {
                    width: `${(item.expense / maxAmount) * 100}%`,
                    backgroundColor: colors.danger,
                  },
                ]}
              />
            </View>
            <Text style={s.catAmount}>{formatCurrency(item.expense)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ── Trend Tab ────────────────────────────────────────────── */

function TrendTab({ data }: { data?: ReportTrend }) {
  if (!data || data.trend.length === 0) {
    return (
      <EmptyState
        icon="trending-up-outline"
        message="No trend data for this year"
      />
    );
  }

  const maxVal = Math.max(
    ...data.trend.map((t) => Math.max(t.expense, t.income)),
    1,
  );

  return (
    <View style={[s.card, shadow.card]}>
      <Text style={s.sectionTitle}>Monthly Overview</Text>
      {data.trend.map((item, i) => (
        <View
          key={`${item.year}-${item.month}`}
          style={[s.trendRow, i < data.trend.length - 1 && s.catRowBorder]}
        >
          <Text style={s.trendMonth}>{monthNames[item.month - 1]}</Text>
          <View style={s.trendBars}>
            <View style={s.trendBarRow}>
              <View
                style={[
                  s.bar,
                  {
                    width: `${(item.expense / maxVal) * 100}%`,
                    backgroundColor: colors.danger,
                  },
                ]}
              />
            </View>
            <View style={s.trendBarRow}>
              <View
                style={[
                  s.bar,
                  {
                    width: `${(item.income / maxVal) * 100}%`,
                    backgroundColor: colors.success,
                  },
                ]}
              />
            </View>
          </View>
          <View style={s.trendAmounts}>
            <Text style={[s.trendAmt, { color: colors.danger }]}>
              {formatCurrency(item.expense)}
            </Text>
            <Text style={[s.trendAmt, { color: colors.success }]}>
              {formatCurrency(item.income)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/* ── Budget Tab ───────────────────────────────────────────── */

function BudgetTab({ data }: { data?: ReportBudget }) {
  if (!data || data.budget.length === 0) {
    return (
      <EmptyState
        icon="wallet-outline"
        message="No budget data for this period"
      />
    );
  }

  return (
    <View style={[s.card, shadow.card]}>
      <Text style={s.sectionTitle}>Budget vs Actual</Text>
      {data.budget.map((item, i) => {
        const pct = Math.min(item.percentage, 100);
        const barColor =
          item.percentage > 100
            ? colors.danger
            : item.percentage >= 80
              ? colors.warning
              : colors.success;

        return (
          <View
            key={item.category}
            style={[
              s.budgetRow,
              i < data.budget.length - 1 && s.catRowBorder,
            ]}
          >
            <View style={s.budgetHeader}>
              <Text style={s.catName} numberOfLines={1}>
                {item.category}
              </Text>
              <Text style={[s.budgetPct, { color: barColor }]}>
                {Math.round(item.percentage)}%
              </Text>
            </View>
            <View style={s.progressBg}>
              <View
                style={[
                  s.progressFill,
                  { width: `${pct}%`, backgroundColor: barColor },
                ]}
              />
            </View>
            <View style={s.budgetFooter}>
              <Text style={s.budgetSub}>
                {formatCurrency(item.actual)} / {formatCurrency(item.limit)}
              </Text>
              <Text
                style={[
                  s.budgetRemaining,
                  {
                    color:
                      item.remaining >= 0 ? colors.success : colors.danger,
                  },
                ]}
              >
                {item.remaining >= 0 ? "Remaining: " : "Over by: "}
                {formatCurrency(Math.abs(item.remaining))}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ── Empty State ──────────────────────────────────────────── */

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <View style={s.empty}>
      <Ionicons name={icon as any} size={48} color={colors.textMuted} />
      <Text style={s.emptyText}>{message}</Text>
    </View>
  );
}

/* ── Styles ───────────────────────────────────────────────── */

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.extrabold,
    color: colors.text,
    letterSpacing: -0.5,
  },

  /* Tabs */
  tabs: {
    flexDirection: "row",
    marginHorizontal: 24,
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 13,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textSub,
  },
  tabTextActive: {
    color: "#fff",
  },

  /* Date Nav */
  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 16,
  },
  dateArrow: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  datePeriod: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.text,
    minWidth: 120,
    textAlign: "center",
  },

  /* Scroll */
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },

  /* Loading */
  center: {
    paddingTop: 80,
    alignItems: "center",
  },

  /* Totals (Summary) */
  totalsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  totalCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: fonts.extrabold,
  },

  /* Card */
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 16,
  },

  /* Category Rows (Summary) */
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  catRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  catName: {
    width: 80,
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.bg,
    borderRadius: 4,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 4,
  },
  catAmount: {
    width: 80,
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textSub,
    textAlign: "right",
  },

  /* Trend Rows */
  trendRow: {
    paddingVertical: 12,
  },
  trendMonth: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 6,
  },
  trendBars: {
    gap: 4,
    marginBottom: 4,
  },
  trendBarRow: {
    height: 8,
    backgroundColor: colors.bg,
    borderRadius: 4,
    overflow: "hidden",
  },
  trendAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  trendAmt: {
    fontSize: 11,
    fontFamily: fonts.semibold,
  },

  /* Budget Rows */
  budgetRow: {
    paddingVertical: 14,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  budgetPct: {
    fontSize: 14,
    fontFamily: fonts.extrabold,
  },
  progressBg: {
    height: 10,
    backgroundColor: colors.bg,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  budgetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  budgetSub: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },
  budgetRemaining: {
    fontSize: 11,
    fontFamily: fonts.semibold,
  },

  /* Empty State */
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});
