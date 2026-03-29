import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactions } from "@simple-expenses/api";
import { ListSkeleton } from "../../../components/ScreenLoader";
import { formatCurrency, formatShortDate } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors, fonts, shadow } from "../../../lib/theme";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TYPE_CFG = {
  income:   { color: colors.success, icon: "arrow-down"        as const, bg: colors.successDim },
  expense:  { color: colors.danger,  icon: "arrow-up"          as const, bg: colors.dangerDim },
  transfer: { color: colors.primary, icon: "swap-horizontal"   as const, bg: colors.primaryDim },
};

export default function TransactionsScreen() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  function goPrev() {
    if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1);
  }
  function goNext() {
    if (isCurrentMonth) return;
    if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1);
  }

  useFocusEffect(
    useCallback(() => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    }, [qc])
  );

  const { data = [], isLoading } = useQuery({
    queryKey: ["transactions", month, year],
    queryFn: () => transactions.list({ month, year }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactions.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const visible = useMemo(() =>
    data
      .filter((t) => t.installmentNumber !== 0)
      .filter((t) => !search.trim()
        || t.name.toLowerCase().includes(search.toLowerCase())
        || (t.category ?? "").toLowerCase().includes(search.toLowerCase()))
  , [data, search]);

  const totals = useMemo(() => {
    let income = 0, expense = 0;
    for (const t of visible) {
      if (t.type === "income") income += Math.abs(t.amount);
      else if (t.type === "expense") expense += Math.abs(t.amount);
    }
    return { income, expense, net: income - expense };
  }, [visible]);

  function handleEdit(tx: (typeof visible)[0]) {
    router.push({
      pathname: "/edit-transaction",
      params: {
        id:       tx.id,
        name:     tx.name,
        amount:   String(Math.abs(tx.amount)),
        date:     tx.date,
        category: tx.category ?? "",
        type:     tx.type,
        notes:    tx.notes ?? "",
      },
    });
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert("Delete", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(id) },
    ]);
  }

  const ListHeader = (
    <>
      {/* Month navigator */}
      <View style={s.monthNav}>
        <TouchableOpacity onPress={goPrev} style={s.monthBtn} activeOpacity={0.6}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={s.monthCenter}>
          <Text style={s.monthText}>{MONTH_NAMES[month - 1]} {year}</Text>
          {isCurrentMonth && <View style={s.currentDot} />}
        </View>
        <TouchableOpacity
          onPress={goNext}
          style={[s.monthBtn, isCurrentMonth && { opacity: 0.3 }]}
          disabled={isCurrentMonth}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary pills */}
      <View style={s.summaryRow}>
        <View style={[s.pill, { backgroundColor: colors.successDim }]}>
          <Text style={[s.pillLabel, { color: colors.success }]}>Income</Text>
          <Text style={[s.pillValue, { color: colors.success }]}>{formatCurrency(totals.income, "AED")}</Text>
        </View>
        <View style={[s.pill, { backgroundColor: colors.dangerDim }]}>
          <Text style={[s.pillLabel, { color: colors.danger }]}>Expense</Text>
          <Text style={[s.pillValue, { color: colors.danger }]}>{formatCurrency(totals.expense, "AED")}</Text>
        </View>
        <View style={[s.pill, { backgroundColor: totals.net >= 0 ? colors.successDim : colors.dangerDim }]}>
          <Text style={[s.pillLabel, { color: totals.net >= 0 ? colors.success : colors.danger }]}>Net</Text>
          <Text style={[s.pillValue, { color: totals.net >= 0 ? colors.success : colors.danger }]}>{formatCurrency(Math.abs(totals.net), "AED")}</Text>
        </View>
      </View>

      {/* Results count */}
      <View style={s.listHeader}>
        <Text style={s.sectionTitle}>Transactions</Text>
        <Text style={s.count}>{visible.length} items</Text>
      </View>
    </>
  );

  return (
    <View style={s.root}>
      <SafeAreaView style={{ backgroundColor: colors.surface }} edges={["top"]}>
        <View style={s.header}>
          <Text style={s.title}>Transactions</Text>
          <View style={s.searchRow}>
            <Ionicons name="search-outline" size={16} color={colors.textSub} />
            <TextInput
              style={s.searchInput}
              placeholder="Search name or category..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={colors.textSub} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      {isLoading && data.length === 0 ? (
        <ListSkeleton count={8} />
      ) : (
      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="swap-horizontal-outline" size={40} color={colors.textMuted} />
            <Text style={s.emptyTitle}>{search ? "No matches" : "No transactions"}</Text>
            <Text style={s.emptyText}>
              {search
                ? `No results for "${search}"`
                : `Nothing recorded in ${MONTH_NAMES[month - 1]} ${year}`
              }
            </Text>
          </View>
        }
        renderItem={({ item: tx }) => {
          const cfg = TYPE_CFG[tx.type as keyof typeof TYPE_CFG] ?? TYPE_CFG.expense;
          return (
            <View style={[s.row, shadow.card]}>
              <View style={[s.icon, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon} size={17} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name} numberOfLines={1}>{tx.name}</Text>
                <Text style={s.meta}>
                  {formatShortDate(tx.date)}
                  {tx.category ? ` · ${tx.category}` : ""}
                  {tx.creditCardName ? ` · ${tx.creditCardName}` : ""}
                  {tx.bankAccountName ? ` · ${tx.bankAccountName}` : ""}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[s.amt, { color: tx.type === "income" ? colors.success : tx.type === "transfer" ? colors.primary : colors.text }]}>
                  {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : ""}{formatCurrency(Math.abs(tx.amount), "AED")}
                </Text>
                {tx.installments > 1 && (
                  <Text style={s.installment}>{tx.installmentNumber}/{tx.installments}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => handleEdit(tx)} style={s.action} hitSlop={8}>
                <Ionicons name="create-outline" size={14} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(tx.id, tx.name)} style={s.action} hitSlop={8}>
                <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          );
        }}
      />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  /* Header */
  header: {
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 26, fontFamily: fonts.extrabold, color: colors.text, letterSpacing: -0.5, marginBottom: 12 },
  searchRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface2, borderRadius: 14, paddingHorizontal: 12, height: 44, gap: 8,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: fonts.regular, color: colors.text },

  /* Month nav */
  monthNav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 20, marginTop: 16, marginBottom: 14,
    backgroundColor: colors.surface, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  monthBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: colors.primaryDim, alignItems: "center", justifyContent: "center",
  },
  monthCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  monthText: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  currentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },

  /* Summary */
  summaryRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  pill: { flex: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10, alignItems: "center" },
  pillLabel: { fontSize: 11, fontFamily: fonts.medium, marginBottom: 3 },
  pillValue: { fontSize: 14, fontFamily: fonts.bold },

  /* List header */
  listHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontFamily: fonts.bold, color: colors.text },
  count: { fontSize: 13, fontFamily: fonts.medium, color: colors.textMuted },

  /* List */
  list: { paddingBottom: 100 },
  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 14, marginHorizontal: 20, marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
  meta: { fontSize: 11, fontFamily: fonts.regular, color: colors.textSub, marginTop: 2 },
  amt: { fontSize: 15, fontFamily: fonts.bold },
  installment: { fontSize: 10, fontFamily: fonts.regular, color: colors.textSub, marginTop: 2 },
  del: { padding: 4 },
  action: { padding: 4 },

  /* Empty */
  empty: { alignItems: "center", paddingVertical: 48, gap: 8, paddingHorizontal: 20 },
  emptyTitle: { fontFamily: fonts.bold, color: colors.text, fontSize: 17 },
  emptyText: { fontFamily: fonts.regular, color: colors.textSub, fontSize: 14, textAlign: "center" },
});
