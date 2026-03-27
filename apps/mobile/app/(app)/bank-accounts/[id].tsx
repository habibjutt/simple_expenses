import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { bankAccounts, transactions } from "@simple-expenses/api";
import { formatCurrency, formatShortDate } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, shadow } from "../../../lib/theme";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BankAccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  const goNext = () => {
    if (isCurrentMonth) return;
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };
  const goPrev = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const { data: account } = useQuery({
    queryKey: ["bank-accounts", id],
    queryFn: () => bankAccounts.get(id),
    enabled: !!id,
  });

  const { data: txList = [], isFetching } = useQuery({
    queryKey: ["transactions", "account", id, month, year],
    queryFn: () => transactions.list({ bankAccountId: id, month, year }),
    enabled: !!id,
  });

  const filtered = useMemo(
    () => txList.filter((t) => t.installmentNumber !== 0),
    [txList],
  );

  const { income, expense } = useMemo(() => {
    let inc = 0, exp = 0;
    for (const t of filtered) {
      if (t.type === "income") inc += Math.abs(t.amount);
      else if (t.type === "expense") exp += Math.abs(t.amount);
    }
    return { income: inc, expense: exp };
  }, [filtered]);

  if (!account) return null;

  const change = account.currentBalance - account.initialBalance;
  const currency = account.currency;

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={s.header}>
              <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(app)/dashboard")} style={s.backBtn}>
                <Ionicons name="arrow-back" size={18} color={colors.primary} />
              </TouchableOpacity>
              <Text style={s.headerTitle} numberOfLines={1}>{account.name}</Text>
            </View>

            {/* Balance hero */}
            <LinearGradient
              colors={["#34D399", "#1A9E5C", "#15803D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.hero}
            >
              <Text style={s.heroLabel}>Current Balance</Text>
              <Text style={s.heroBalance}>{formatCurrency(account.currentBalance, currency)}</Text>
              <View style={s.heroStats}>
                <View style={s.heroStatBlock}>
                  <Text style={s.heroStatLabel}>Initial</Text>
                  <Text style={s.heroStatValue}>{formatCurrency(account.initialBalance, currency)}</Text>
                </View>
                <View style={s.heroStatBlock}>
                  <Text style={s.heroStatLabel}>Change</Text>
                  <Text style={[s.heroStatValue, { color: change >= 0 ? "#fff" : "#ffcdd2" }]}>
                    {change >= 0 ? "+" : ""}{formatCurrency(change, currency)}
                  </Text>
                </View>
                <View style={s.heroStatBlock}>
                  <Text style={s.heroStatLabel}>Currency</Text>
                  <Text style={s.heroStatValue}>{currency}</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Month navigator */}
            <View style={[s.monthNav, shadow.card]}>
              <TouchableOpacity onPress={goPrev} style={s.monthArrow} activeOpacity={0.6}>
                <Ionicons name="chevron-back" size={20} color={colors.primary} />
              </TouchableOpacity>

              <View style={s.monthCenter}>
                <Text style={s.monthLabel}>{MONTHS[month - 1]}</Text>
                <Text style={s.yearLabel}>{year}</Text>
              </View>

              <TouchableOpacity
                onPress={goNext}
                style={[s.monthArrow, isCurrentMonth && s.monthArrowDisabled]}
                activeOpacity={isCurrentMonth ? 1 : 0.6}
                disabled={isCurrentMonth}
              >
                <Ionicons name="chevron-forward" size={20} color={isCurrentMonth ? colors.textMuted : colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Monthly summary pills */}
            <View style={s.summaryRow}>
              <View style={[s.summaryPill, { backgroundColor: colors.successDim }]}>
                <Ionicons name="arrow-down-circle-outline" size={16} color={colors.success} />
                <Text style={[s.summaryAmount, { color: colors.success }]}>
                  +{formatCurrency(income, currency)}
                </Text>
                <Text style={s.summaryLabel}>Income</Text>
              </View>
              <View style={[s.summaryPill, { backgroundColor: colors.dangerDim }]}>
                <Ionicons name="arrow-up-circle-outline" size={16} color={colors.danger} />
                <Text style={[s.summaryAmount, { color: colors.danger }]}>
                  -{formatCurrency(expense, currency)}
                </Text>
                <Text style={s.summaryLabel}>Expense</Text>
              </View>
              <View style={[s.summaryPill, { backgroundColor: colors.primaryDim }]}>
                <Ionicons name="analytics-outline" size={16} color={colors.primary} />
                <Text style={[s.summaryAmount, { color: income - expense >= 0 ? colors.primary : colors.danger }]}>
                  {formatCurrency(income - expense, currency)}
                </Text>
                <Text style={s.summaryLabel}>Net</Text>
              </View>
            </View>

            {/* Transactions heading */}
            <View style={s.txHeader}>
              <Text style={s.sectionTitle}>Transactions</Text>
              <Text style={s.txCount}>{filtered.length} {filtered.length === 1 ? "item" : "items"}</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Ionicons name="receipt-outline" size={32} color={colors.textMuted} />
            </View>
            <Text style={s.emptyTitle}>
              {isFetching ? "Loading…" : "No transactions"}
            </Text>
            <Text style={s.emptyText}>
              {isFetching ? "" : `Nothing recorded for ${MONTHS[month - 1]} ${year}`}
            </Text>
          </View>
        }
        renderItem={({ item: tx }) => (
          <View style={[s.txRow, shadow.card]}>
            <View style={[
              s.txIcon,
              {
                backgroundColor:
                  tx.type === "income" ? colors.successDim :
                  tx.type === "transfer" ? colors.primaryDim :
                  colors.dangerDim,
              },
            ]}>
              <Ionicons
                name={
                  tx.type === "income" ? "arrow-down-outline" :
                  tx.type === "transfer" ? "swap-horizontal-outline" :
                  "arrow-up-outline"
                }
                size={16}
                color={
                  tx.type === "income" ? colors.success :
                  tx.type === "transfer" ? colors.primary :
                  colors.danger
                }
              />
            </View>
            <View style={s.txBody}>
              <Text style={s.txName} numberOfLines={1}>{tx.name}</Text>
              <Text style={s.txMeta}>{formatShortDate(tx.date)} · {tx.category}</Text>
            </View>
            <Text style={[
              s.txAmt,
              {
                color:
                  tx.type === "income" ? colors.success :
                  tx.type === "transfer" ? colors.primary :
                  colors.danger,
              },
            ]}>
              {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
              {formatCurrency(Math.abs(tx.amount), currency)}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  listContent: { paddingBottom: 40 },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 20,
    backgroundColor: colors.primaryDim,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  headerTitle: { flex: 1, fontSize: 20, fontFamily: fonts.bold, color: colors.text },

  /* Hero card */
  hero: { marginHorizontal: 20, marginBottom: 16, borderRadius: 24, padding: 24 },
  heroLabel: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: fonts.medium, marginBottom: 4 },
  heroBalance: { color: "#fff", fontFamily: fonts.extrabold, fontSize: 32, marginBottom: 20 },
  heroStats: { flexDirection: "row", justifyContent: "space-between" },
  heroStatBlock: { flex: 1 },
  heroStatLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: fonts.regular, marginBottom: 2 },
  heroStatValue: { color: "#fff", fontFamily: fonts.semibold, fontSize: 14 },

  /* Month navigator */
  monthNav: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: colors.surface, borderRadius: 18,
    paddingVertical: 10, paddingHorizontal: 6,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  monthArrow: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: colors.primaryDim,
    alignItems: "center", justifyContent: "center",
  },
  monthArrowDisabled: { backgroundColor: colors.surface2 },
  monthCenter: { flex: 1, alignItems: "center" },
  monthLabel: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  yearLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSub, marginTop: 1 },

  /* Monthly summary */
  summaryRow: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 20, marginBottom: 18,
  },
  summaryPill: {
    flex: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10,
    alignItems: "center", gap: 4,
  },
  summaryAmount: { fontSize: 13, fontFamily: fonts.bold },
  summaryLabel: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSub },

  /* Transactions */
  txHeader: {
    flexDirection: "row", alignItems: "baseline", justifyContent: "space-between",
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  txCount: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSub },

  txRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 18,
    paddingHorizontal: 16, paddingVertical: 14,
    marginHorizontal: 20, marginBottom: 8,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  txIcon: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  txBody: { flex: 1 },
  txName: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
  txMeta: { fontSize: 12, fontFamily: fonts.regular, color: colors.textSub, marginTop: 2 },
  txAmt: { fontSize: 15, fontFamily: fonts.bold },

  /* Empty state */
  empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 32 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 22,
    backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontFamily: fonts.bold, color: colors.text, marginBottom: 4 },
  emptyText: { fontSize: 13, fontFamily: fonts.regular, color: colors.textSub, textAlign: "center" },
});