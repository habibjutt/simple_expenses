import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { spendingLimits, categories as categoriesApi, reports } from "@simple-expenses/api";
import { formatCurrency } from "@simple-expenses/utils";
import type { SpendingLimit, Category, ReportBudget, ReportBudgetItem } from "@simple-expenses/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { colors, fonts, shadow } from "../../lib/theme";
import { BudgetSkeleton } from "../../components/ScreenLoader";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SpendingLimitsScreen() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");

  const qc = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      qc.invalidateQueries({ queryKey: ["budget", month, year] });
      qc.invalidateQueries({ queryKey: ["spending-limits", month, year] });
    }, [qc, month, year]),
  );

  const { data: budget, isLoading: budgetLoading } = useQuery<ReportBudget>({
    queryKey: ["budget", month, year],
    queryFn: () => reports.budget(month, year),
  });

  const { data: limits = [], isLoading: limitsLoading } = useQuery<SpendingLimit[]>({
    queryKey: ["spending-limits", month, year],
    queryFn: () => spendingLimits.list(month, year),
  });

  const { data: expenseCategories = [] } = useQuery<Category[]>({
    queryKey: ["categories-expense"],
    queryFn: () => categoriesApi.list("expense"),
    select: (d) => [...d].sort((a, b) => a.name.localeCompare(b.name)),
  });

  const isInitialLoad = budgetLoading || limitsLoading;

  const createMutation = useMutation({
    mutationFn: (input: { categoryName: string; amount: number; month: number; year: number }) =>
      spendingLimits.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spending-limits", month, year] });
      qc.invalidateQueries({ queryKey: ["budget", month, year] });
      closeModal();
    },
    onError: (e: Error) => Alert.alert("Error", e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => spendingLimits.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spending-limits", month, year] });
      qc.invalidateQueries({ queryKey: ["budget", month, year] });
    },
  });

  function closeModal() {
    setShowCreate(false);
    setSelectedCategory("");
    setAmount("");
  }

  function handleSave() {
    if (!selectedCategory) { Alert.alert("Missing category", "Please select a category."); return; }
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) { Alert.alert("Invalid amount", "Please enter a valid amount."); return; }
    createMutation.mutate({ categoryName: selectedCategory, amount: parsed, month, year });
  }

  function confirmDelete(limit: SpendingLimit) {
    Alert.alert("Delete Limit", `Remove spending limit for "${limit.categoryName}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(limit.id) },
    ]);
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function getBarColor(pct: number): string {
    if (pct > 100) return colors.danger;
    if (pct >= 80) return colors.warning;
    return colors.success;
  }

  function getBarBg(pct: number): string {
    if (pct > 100) return colors.dangerDim;
    if (pct >= 80) return colors.warningDim;
    return colors.successDim;
  }

  const budgetItems: ReportBudgetItem[] = budget?.budget ?? [];

  // Categories already used this month (for filtering in the picker)
  const usedCategories = new Set(limits.map((l) => l.categoryName));

  // For edit: allow selecting existing categories too
  function handleEditLimit(item: ReportBudgetItem) {
    setSelectedCategory(item.category);
    setAmount(String(item.limit));
    setShowCreate(true);
  }

  return (
    <View style={s.root}>
      <SafeAreaView style={{ backgroundColor: colors.surface }} edges={["top"]}>
        <View style={s.header}>
          <Text style={s.title}>Spending Limits</Text>
          <View style={s.navRow}>
            <TouchableOpacity onPress={prevMonth} style={s.navBtn} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={s.navLabel}>{monthNames[month - 1]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={s.navBtn} hitSlop={8}>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {isInitialLoad ? (
        <BudgetSkeleton count={4} />
      ) : (
      <FlatList
        data={budgetItems}
        keyExtractor={(item) => item.category}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="pie-chart-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={s.emptyTitle}>No limits set</Text>
            <Text style={s.emptyText}>Tap + to add a spending limit for {monthNames[month - 1]}.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const pct = item.percentage;
          const barWidth = Math.min(pct, 100);
          const barColor = getBarColor(pct);
          const barBg = getBarBg(pct);
          const limit = limits.find((l) => l.categoryName === item.category);
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={[s.catDot, { backgroundColor: barColor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.catName}>{item.category}</Text>
                  <Text style={s.catSub}>
                    {formatCurrency(item.actual)} / {formatCurrency(item.limit)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleEditLimit(item)} style={s.editBtn} hitSlop={8}>
                  <Ionicons name="pencil-outline" size={14} color={colors.textSub} />
                </TouchableOpacity>
                {limit && (
                  <TouchableOpacity onPress={() => confirmDelete(limit)} style={s.delBtn} hitSlop={8}>
                    <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={[s.barBg, { backgroundColor: barBg }]}>
                <View style={[s.barFill, { width: `${barWidth}%` as any, backgroundColor: barColor }]} />
              </View>
              <View style={s.cardBottom}>
                <Text style={[s.pctText, { color: barColor }]}>{pct}%</Text>
                <Text style={s.remainText}>
                  {item.remaining >= 0
                    ? `${formatCurrency(item.remaining)} remaining`
                    : `${formatCurrency(Math.abs(item.remaining))} over budget`}
                </Text>
              </View>
            </View>
          );
        }}
      />
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => setShowCreate(true)}>
        <LinearGradient colors={[colors.primary, "#15803D"]} style={s.fabGrad}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Create / Edit Modal */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.modalOverlay}>
          <TouchableOpacity style={s.modalBg} activeOpacity={1} onPress={closeModal} />
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>
              {selectedCategory && usedCategories.has(selectedCategory) ? "Update Limit" : "Set Spending Limit"}
            </Text>
            <Text style={s.modalSubtitle}>{monthNames[month - 1]} {year}</Text>

            {/* Category picker */}
            <Text style={s.fieldLabel}>CATEGORY</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.pillRow}
              style={s.pillScroll}
            >
              {expenseCategories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.name)}
                    style={[s.pill, isSelected && s.pillActive]}
                  >
                    <Text style={[s.pillText, isSelected && s.pillTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Amount input */}
            <Text style={s.fieldLabel}>AMOUNT (AED)</Text>
            <View style={s.inputRow}>
              <Text style={s.inputPrefix}>AED</Text>
              <TextInput
                style={s.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Save button */}
            <TouchableOpacity
              style={[s.saveBtn, (!selectedCategory || !amount) && s.saveBtnDisabled]}
              onPress={handleSave}
              disabled={createMutation.isPending}
            >
              <LinearGradient
                colors={selectedCategory && amount ? [colors.primary, "#15803D"] : [colors.textMuted, colors.textMuted]}
                style={s.saveBtnGrad}
              >
                <Text style={s.saveBtnText}>
                  {createMutation.isPending ? "Saving…" : "Save Limit"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity onPress={closeModal} style={s.cancelBtn}>
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 26, fontFamily: fonts.extrabold, color: colors.text, letterSpacing: -0.5, marginBottom: 12 },

  // Month navigation
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: { fontSize: 16, fontFamily: fonts.bold, color: colors.text, minWidth: 140, textAlign: "center" },

  // List
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },

  // Budget item card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { fontSize: 14, fontFamily: fonts.bold, color: colors.text },
  catSub: { fontSize: 12, fontFamily: fonts.regular, color: colors.textSub, marginTop: 2 },
  editBtn: { padding: 6 },
  delBtn: { padding: 6 },

  // Progress bar
  barBg: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 10 },
  barFill: { height: 8, borderRadius: 4 },

  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pctText: { fontSize: 13, fontFamily: fonts.bold },
  remainText: { fontSize: 12, fontFamily: fonts.regular, color: colors.textSub },

  // Empty state
  empty: { alignItems: "center", paddingTop: 100, gap: 8 },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontFamily: fonts.bold, color: colors.text },
  emptyText: { fontSize: 14, fontFamily: fonts.regular, color: colors.textSub, textAlign: "center", paddingHorizontal: 40 },

  // FAB
  fab: {
    position: "absolute",
    bottom: 80,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 20,
    overflow: "hidden",
    ...shadow.glow(colors.primary),
  },
  fabGrad: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingTop: 12,
    ...shadow.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontFamily: fonts.extrabold, color: colors.text, letterSpacing: -0.5, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, fontFamily: fonts.regular, color: colors.textSub, marginBottom: 24 },

  // Field label
  fieldLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.textSub,
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // Category pills
  pillScroll: { marginBottom: 24, maxHeight: 46 },
  pillRow: { gap: 8, paddingRight: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.text },
  pillTextActive: { color: "#fff" },

  // Amount input
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 24,
    gap: 8,
  },
  inputPrefix: { fontSize: 14, fontFamily: fonts.bold, color: colors.textSub },
  input: { flex: 1, fontSize: 18, fontFamily: fonts.bold, color: colors.text },

  // Save button
  saveBtn: { borderRadius: 18, overflow: "hidden", marginBottom: 12 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnGrad: { paddingVertical: 16, alignItems: "center" },
  saveBtnText: { fontSize: 16, fontFamily: fonts.bold, color: "#fff" },

  // Cancel
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelBtnText: { fontSize: 14, fontFamily: fonts.semibold, color: colors.textSub },
});
