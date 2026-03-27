import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { creditCards } from "@simple-expenses/api";
import { CreditCardSkeleton } from "../../../components/ScreenLoader";
import { formatCurrency } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, fonts } from "../../../lib/theme";

const CARD_COLORS = colors.cards;

export default function CreditCardsScreen() {
  const { data = [], isLoading } = useQuery({ queryKey: ["credit-cards"], queryFn: () => creditCards.list(), select: (d) => [...d].sort((a, b) => a.name.localeCompare(b.name)) });

  return (
    <View style={s.root}>
      <SafeAreaView style={{ backgroundColor: colors.surface }} edges={["top"]}>
        <View style={s.header}>
          <Text style={s.title}>Credit Cards</Text>
          <Text style={s.sub}>{data.length} card{data.length !== 1 ? "s" : ""}</Text>
        </View>
      </SafeAreaView>

      {isLoading && data.length === 0 ? (
        <CreditCardSkeleton count={2} />
      ) : (
      <FlatList
        data={data}
        keyExtractor={(c) => c.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="card-outline" size={48} color={colors.textMuted} />
            <Text style={s.emptyTitle}>No credit cards yet</Text>
            <Text style={s.emptyText}>Add a card to start tracking expenses</Text>
          </View>
        }
        renderItem={({ item: card, index }) => {
          const [c1, c2] = CARD_COLORS[index % CARD_COLORS.length];
          const availPct = Math.max(0, Math.min(100, (card.availableBalance / card.cardLimit) * 100));
          return (
            <TouchableOpacity onPress={() => router.push(`/(app)/credit-cards/${card.id}` as never)} activeOpacity={0.9}>
              <LinearGradient colors={[c1, c2]} style={s.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {/* Card Name & Chevron */}
                <View style={s.cardTop}>
                  <View style={s.cardIcon}>
                    <Ionicons name="card" size={16} color="rgba(255,255,255,0.9)" />
                  </View>
                  <Text style={s.cardName} numberOfLines={1}>{card.name}</Text>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
                </View>

                {/* Available Balance */}
                <View style={s.balSection}>
                  <Text style={s.balLabel}>Available Balance</Text>
                  <Text style={s.balAmt}>{formatCurrency(card.availableBalance, card.currency)}</Text>
                </View>

                {/* Progress Bar */}
                <View style={s.barRow}>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${availPct}%` as any }]} />
                  </View>
                  <Text style={s.barPct}>{Math.round(availPct)}%</Text>
                </View>

                {/* Stats Row */}
                <View style={s.statsRow}>
                  <View style={s.statPill}>
                    <Text style={s.statLabel}>Limit</Text>
                    <Text style={s.statValue}>{formatCurrency(card.cardLimit, card.currency)}</Text>
                  </View>
                  <View style={s.statPill}>
                    <Text style={s.statLabel}>Bill Day</Text>
                    <Text style={s.statValue}>{card.billGenerationDate}{getOrdinal(card.billGenerationDate)}</Text>
                  </View>
                  <View style={s.statPill}>
                    <Text style={s.statLabel}>Due Day</Text>
                    <Text style={s.statValue}>{card.paymentDate}{getOrdinal(card.paymentDate)}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />
      )}
    </View>
  );
}

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 28, fontFamily: fonts.extrabold, color: colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 14, fontFamily: fonts.medium, color: colors.textSub, marginTop: 4 },
  list: { padding: 20, paddingBottom: 40, gap: 20 },

  card: { borderRadius: 28, padding: 28 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 28 },
  cardIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  cardName: { flex: 1, fontSize: 18, fontFamily: fonts.bold, color: "#fff" },

  balSection: { marginBottom: 20 },
  balLabel: { fontSize: 13, fontFamily: fonts.medium, color: "rgba(255,255,255,0.7)", marginBottom: 6 },
  balAmt: { fontSize: 34, fontFamily: fonts.extrabold, color: "#fff", letterSpacing: -0.5 },

  barRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  barBg: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 99 },
  barFill: { height: 8, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 99 },
  barPct: { fontSize: 13, fontFamily: fonts.bold, color: "rgba(255,255,255,0.85)", minWidth: 36, textAlign: "right" },

  statsRow: { flexDirection: "row", gap: 10 },
  statPill: { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, alignItems: "center" },
  statLabel: { fontSize: 11, fontFamily: fonts.medium, color: "rgba(255,255,255,0.65)", marginBottom: 4 },
  statValue: { fontSize: 14, fontFamily: fonts.bold, color: "#fff" },

  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontFamily: fonts.bold, color: colors.text, fontSize: 18 },
  emptyText: { fontFamily: fonts.regular, color: colors.textSub, fontSize: 14 },
});
