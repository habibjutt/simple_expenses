import { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactions } from "@simple-expenses/api";
import { formatCurrency, formatShortDate } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, shadow } from "../../../lib/theme";

const TYPE = {
  income: { color: colors.success, icon: "arrow-down" as const, bg: colors.successDim },
  expense: { color: colors.danger, icon: "arrow-up" as const, bg: colors.dangerDim },
  transfer: { color: colors.primary, icon: "swap-horizontal" as const, bg: colors.primaryDim },
};

export default function TransactionsScreen() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({ queryKey: ["transactions"], queryFn: () => transactions.list() });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactions.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const visible = data
    .filter((t) => t.installmentNumber !== 0)
    .filter((t) => !search.trim() || t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  function confirmDelete(id: string, name: string) {
    Alert.alert("Delete", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(id) },
    ]);
  }

  return (
    <View style={s.root}>
      <SafeAreaView style={{ backgroundColor: colors.surface }} edges={["top"]}>
        <View style={s.header}>
          <Text style={s.title}>Transactions</Text>
          <View style={s.searchRow}>
            <Ionicons name="search-outline" size={16} color={colors.textSub} />
            <TextInput style={s.searchInput} placeholder="Search..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={16} color={colors.textSub} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="swap-horizontal-outline" size={40} color={colors.textMuted} />
            <Text style={s.emptyText}>{search ? "No matches" : "No transactions yet"}</Text>
          </View>
        }
        renderItem={({ item: tx }) => {
          const cfg = TYPE[tx.type as keyof typeof TYPE] ?? TYPE.expense;
          return (
            <View style={s.row}>
              <View style={[s.icon, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon} size={17} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name} numberOfLines={1}>{tx.name}</Text>
                <Text style={s.meta}>{formatShortDate(tx.date)} · {tx.category}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[s.amt, { color: tx.type === "income" ? colors.success : colors.text }]}>
                  {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}{formatCurrency(Math.abs(tx.amount), "AED")}
                </Text>
                {tx.installments > 1 && (
                  <Text style={s.installment}>{tx.installmentNumber}/{tx.installments}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => confirmDelete(tx.id, tx.name)} style={s.del} hitSlop={8}>
                <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity style={s.fab} onPress={() => router.push("/(app)/transactions/add")}>
        <LinearGradient colors={["#5B96FF", "#2B5EDD"]} style={s.fabGrad}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: -0.5, marginBottom: 12 },
  searchRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface2, borderRadius: 12, paddingHorizontal: 12, height: 42, gap: 8, borderWidth: 1, borderColor: colors.borderSubtle },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: colors.borderSubtle },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 14, fontWeight: "600", color: colors.text },
  meta: { fontSize: 11, color: colors.textSub, marginTop: 2 },
  amt: { fontSize: 14, fontWeight: "700" },
  installment: { fontSize: 10, color: colors.textSub, marginTop: 2 },
  del: { padding: 4 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: colors.textSub, fontSize: 14 },
  fab: { position: "absolute", bottom: 80, right: 24, width: 56, height: 56, borderRadius: 18, overflow: "hidden", ...shadow.glow(colors.primary) },
  fabGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
});
