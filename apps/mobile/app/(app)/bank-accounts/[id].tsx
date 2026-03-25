import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { bankAccounts, transactions } from "@simple-expenses/api";
import { formatCurrency, formatShortDate } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, shadow } from "../../../lib/theme";

export default function BankAccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: account } = useQuery({
    queryKey: ["bank-accounts", id],
    queryFn: () => bankAccounts.get(id),
    enabled: !!id,
  });

  const { data: txList = [] } = useQuery({
    queryKey: ["transactions", "account", id],
    queryFn: () => transactions.list({ bankAccountId: id }),
    enabled: !!id,
  });

  if (!account) return null;

  const change = account.currentBalance - account.initialBalance;

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{account.name}</Text>
      </View>

      {/* Balance hero */}
      <LinearGradient
        colors={["#00c9a7", "#00b896", "#009688"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <Text style={s.heroLabel}>Current Balance</Text>
        <Text style={s.heroBalance}>{formatCurrency(account.currentBalance, account.currency)}</Text>
        <View style={s.heroStats}>
          <View>
            <Text style={s.heroStatLabel}>Initial</Text>
            <Text style={s.heroStatValue}>{formatCurrency(account.initialBalance, account.currency)}</Text>
          </View>
          <View>
            <Text style={s.heroStatLabel}>Change</Text>
            <Text style={[s.heroStatValue, { color: change >= 0 ? "#ffffff" : "#ffcdd2" }]}>
              {change >= 0 ? "+" : ""}{formatCurrency(change, account.currency)}
            </Text>
          </View>
          <View>
            <Text style={s.heroStatLabel}>Currency</Text>
            <Text style={s.heroStatValue}>{account.currency}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Transaction history */}
      <Text style={s.sectionTitle}>Transactions</Text>
      <FlatList
        data={txList.filter((t) => t.installmentNumber !== 0)}
        keyExtractor={(t) => t.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyText}>No transactions yet</Text>
          </View>
        }
        renderItem={({ item: tx }) => (
          <View style={[s.txRow, shadow.card]}>
            <View style={[s.txIcon, { backgroundColor: tx.type === "income" ? colors.successDim : colors.dangerDim }]}>
              <Ionicons
                name={tx.type === "income" ? "arrow-down-outline" : "arrow-up-outline"}
                size={16}
                color={tx.type === "income" ? colors.success : colors.danger}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.txName} numberOfLines={1}>{tx.name}</Text>
              <Text style={s.txMeta}>{formatShortDate(tx.date)} · {tx.category}</Text>
            </View>
            <Text style={[s.txAmt, { color: tx.type === "income" ? colors.success : colors.danger }]}>
              {tx.type === "income" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount), account.currency)}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryDim, alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "700", color: colors.text },
  hero: { marginHorizontal: 20, marginBottom: 16, borderRadius: 24, padding: 20 },
  heroLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 4 },
  heroBalance: { color: "#ffffff", fontWeight: "800", fontSize: 30, marginBottom: 16 },
  heroStats: { flexDirection: "row", gap: 24 },
  heroStatLabel: { color: "rgba(255,255,255,0.70)", fontSize: 11 },
  heroStatValue: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, paddingHorizontal: 20, marginBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  txRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: 12 },
  txName: { fontSize: 14, fontWeight: "600", color: colors.text },
  txMeta: { fontSize: 11, color: colors.textSub, marginTop: 2 },
  txAmt: { fontSize: 14, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 32 },
  emptyText: { color: colors.textSub, fontSize: 14 },
});