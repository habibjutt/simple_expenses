import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { creditCards, invoices } from "@simple-expenses/api";
import { formatCurrency, formatMonthYear } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, shadow } from "../../../lib/theme";

export default function CreditCardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: card } = useQuery({
    queryKey: ["credit-cards", id],
    queryFn: () => creditCards.get(id),
    enabled: !!id,
  });

  const { data: cardInvoices = [] } = useQuery({
    queryKey: ["invoices", id],
    queryFn: () => invoices.list(id),
    enabled: !!id,
  });

  if (!card) return null;

  const usedPercent = Math.min(100, ((card.cardLimit - card.availableBalance) / card.cardLimit) * 100);

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{card.name}</Text>
      </View>

      {/* Card summary hero */}
      <LinearGradient
        colors={["#8b67ff", "#6c47ff", "#4527e0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <Text style={s.heroLabel}>Available Balance</Text>
        <Text style={s.heroBalance}>{formatCurrency(card.availableBalance, card.currency)}</Text>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${100 - usedPercent}%` as any }]} />
        </View>
        <View style={s.heroRow}>
          <Text style={s.heroMeta}>Used: {formatCurrency(card.cardLimit - card.availableBalance, card.currency)}</Text>
          <Text style={s.heroMeta}>Limit: {formatCurrency(card.cardLimit, card.currency)}</Text>
        </View>
        <View style={s.heroStats}>
          <View>
            <Text style={s.heroStatLabel}>Bill Day</Text>
            <Text style={s.heroStatValue}>{card.billGenerationDate}</Text>
          </View>
          <View>
            <Text style={s.heroStatLabel}>Due Day</Text>
            <Text style={s.heroStatValue}>{card.paymentDate}</Text>
          </View>
          <View>
            <Text style={s.heroStatLabel}>Currency</Text>
            <Text style={s.heroStatValue}>{card.currency}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Invoice history */}
      <Text style={s.sectionTitle}>Invoice History</Text>
      <FlatList
        data={cardInvoices}
        keyExtractor={(inv) => inv.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyText}>No invoices yet</Text>
          </View>
        }
        renderItem={({ item: inv }) => (
          <View style={[s.invoiceRow, shadow.card]}>
            <View style={[s.invIcon, { backgroundColor: inv.isPaid ? colors.successDim : colors.warningDim }]}>
              <Ionicons
                name={inv.isPaid ? "checkmark-circle" : "time-outline"}
                size={16}
                color={inv.isPaid ? colors.success : colors.warning}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.invMonth}>{formatMonthYear(inv.billStartDate)}</Text>
              <Text style={s.invSub}>
                {inv.isPaid ? "Paid" : `Due: ${formatCurrency(inv.totalAmount - inv.paidAmount, card.currency)}`}
              </Text>
            </View>
            <Text style={s.invAmount}>{formatCurrency(inv.totalAmount, card.currency)}</Text>
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
  progressBg: { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 99, height: 6, marginBottom: 4 },
  progressFill: { backgroundColor: "#ffffff", borderRadius: 99, height: 6 },
  heroRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  heroMeta: { color: "rgba(255,255,255,0.75)", fontSize: 11 },
  heroStats: { flexDirection: "row", gap: 24 },
  heroStatLabel: { color: "rgba(255,255,255,0.70)", fontSize: 11 },
  heroStatValue: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, paddingHorizontal: 20, marginBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  invoiceRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  invIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: 12 },
  invMonth: { fontSize: 14, fontWeight: "600", color: colors.text },
  invSub: { fontSize: 11, color: colors.textSub, marginTop: 2 },
  invAmount: { fontSize: 14, fontWeight: "700", color: colors.text },
  empty: { alignItems: "center", paddingVertical: 32 },
  emptyText: { color: colors.textSub, fontSize: 14 },
});