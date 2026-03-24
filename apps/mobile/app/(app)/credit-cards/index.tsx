import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { creditCards } from "@simple-expenses/api";
import { formatCurrency } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "../../../lib/theme";

const CARD_COLORS = colors.cards;

export default function CreditCardsScreen() {
  const { data = [], isLoading } = useQuery({ queryKey: ["credit-cards"], queryFn: () => creditCards.list() });

  return (
    <View style={s.root}>
      <SafeAreaView style={{ backgroundColor: colors.surface }} edges={["top"]}>
        <View style={s.header}>
          <Text style={s.title}>Credit Cards</Text>
          <Text style={s.sub}>{data.length} card{data.length !== 1 ? "s" : ""}</Text>
        </View>
      </SafeAreaView>

      <FlatList
        data={data}
        keyExtractor={(c) => c.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="card-outline" size={40} color={colors.textMuted} />
            <Text style={s.emptyText}>No credit cards yet</Text>
          </View>
        }
        renderItem={({ item: card, index }) => {
          const [c1, c2] = CARD_COLORS[index % CARD_COLORS.length];
          const used = Math.min(100, ((card.cardLimit - card.availableBalance) / card.cardLimit) * 100);
          return (
            <TouchableOpacity onPress={() => router.push(`/(app)/credit-cards/${card.id}` as never)} activeOpacity={0.9}>
              <LinearGradient colors={[c1, c2]} style={s.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {/* Top */}
                <View style={s.cardTop}>
                  <Text style={s.cardName}>{card.name}</Text>
                  <View style={s.chipDots}>
                    <View style={[s.chip, { opacity: 0.6 }]} />
                    <View style={s.chip} />
                  </View>
                </View>

                {/* Balance */}
                <View style={s.balSection}>
                  <View>
                    <Text style={s.balLabel}>Available</Text>
                    <Text style={s.balAmt}>{formatCurrency(card.availableBalance, card.currency)}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={s.balLabel}>Limit</Text>
                    <Text style={s.limitAmt}>{formatCurrency(card.cardLimit, card.currency)}</Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={s.barBg}>
                  <View style={[s.barFill, { width: `${100 - used}%` as any }]} />
                </View>

                {/* Footer */}
                <View style={s.cardFooter}>
                  <View style={s.cardMeta}>
                    <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.5)" />
                    <Text style={s.metaText}>Bill day {card.billGenerationDate} · Due day {card.paymentDate}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: colors.textSub, marginTop: 2 },
  list: { padding: 20, paddingBottom: 40 },
  card: { borderRadius: 24, padding: 22, marginBottom: 16 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#fff" },
  chipDots: { flexDirection: "row", gap: 6 },
  chip: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.5)" },
  balSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  balLabel: { fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 4 },
  balAmt: { fontSize: 28, fontWeight: "800", color: "#fff" },
  limitAmt: { fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  barBg: { height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 99, marginBottom: 16 },
  barFill: { height: 4, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 99 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: colors.textSub, fontSize: 14 },
});
