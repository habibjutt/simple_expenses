import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { creditCards, bankAccounts, transactions, invoices } from "@simple-expenses/api";
import { formatCurrency, formatShortDate } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, shadow } from "../../lib/theme";

const CARD_COLORS = colors.cards;

export default function DashboardScreen() {
  const { data: cards = [] } = useQuery({ queryKey: ["credit-cards"], queryFn: () => creditCards.list() });
  const { data: accounts = [] } = useQuery({ queryKey: ["bank-accounts"], queryFn: () => bankAccounts.list() });
  const { data: recentTx = [] } = useQuery({ queryKey: ["transactions"], queryFn: () => transactions.list() });
  const { data: allInvoices = [] } = useQuery({ queryKey: ["all-invoices-dash"], queryFn: async () => {
    if (!cards.length) return [];
    const res = await Promise.all(cards.map((c) => invoices.list(c.id)));
    return res.flat();
  }, enabled: cards.length > 0 });

  const totalCredit = cards.reduce((s, c) => s + c.availableBalance, 0);
  const totalBank = accounts.reduce((s, a) => s + a.currentBalance, 0);
  const netWorth = totalBank;
  const unpaidInvoices = allInvoices.filter((i) => !i.isPaid);
  const currency = cards[0]?.currency ?? accounts[0]?.currency ?? "AED";
  const recent5 = recentTx.filter((t) => t.installmentNumber !== 0).slice(0, 5);

  const txTypeConfig = {
    income: { color: colors.success, icon: "arrow-down" as const, sign: "+" },
    expense: { color: colors.danger, icon: "arrow-up" as const, sign: "-" },
    transfer: { color: colors.primary, icon: "swap-horizontal" as const, sign: "" },
  };

  return (
    <View style={s.root}>
      <SafeAreaView style={{ backgroundColor: colors.surface }} edges={["top"]}>
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Overview</Text>
            <Text style={s.netWorth}>{formatCurrency(netWorth, currency)}</Text>
            <Text style={s.netLabel}>Net Worth</Text>
          </View>
          <TouchableOpacity style={s.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.textSub} />
            {unpaidInvoices.length > 0 && <View style={s.notifDot} />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Summary tiles */}
        <View style={s.tiles}>
          <View style={[s.tile, { backgroundColor: colors.primaryDim, borderColor: colors.border }]}>
            <Ionicons name="card-outline" size={18} color={colors.primary} />
            <Text style={[s.tileAmt, { color: colors.primary }]}>{formatCurrency(totalCredit, currency)}</Text>
            <Text style={s.tileLabel}>Credit Available</Text>
          </View>
          <View style={[s.tile, { backgroundColor: colors.successDim, borderColor: "rgba(0,200,150,0.2)" }]}>
            <Ionicons name="wallet-outline" size={18} color={colors.success} />
            <Text style={[s.tileAmt, { color: colors.success }]}>{formatCurrency(totalBank, currency)}</Text>
            <Text style={s.tileLabel}>Bank Balance</Text>
          </View>
        </View>

        {/* Unpaid invoices alert */}
        {unpaidInvoices.length > 0 && (
          <TouchableOpacity onPress={() => router.push("/(app)/invoices")} style={s.alert}>
            <View style={s.alertIcon}>
              <Ionicons name="warning" size={16} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>{unpaidInvoices.length} unpaid bill{unpaidInvoices.length > 1 ? "s" : ""}</Text>
              <Text style={s.alertSub}>Tap to view and pay</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.warning} />
          </TouchableOpacity>
        )}

        {/* Quick actions */}
        <View style={s.actions}>
          {[
            { icon: "add-circle" as const, label: "Add", color: colors.primary, bg: colors.primaryDim, route: "/(app)/transactions/add" },
            { icon: "card" as const, label: "Cards", color: "#A78BFA", bg: "rgba(167,139,250,0.15)", route: "/(app)/credit-cards" },
            { icon: "wallet" as const, label: "Accounts", color: colors.success, bg: colors.successDim, route: "/(app)/bank-accounts" },
            { icon: "receipt" as const, label: "Invoices", color: colors.danger, bg: colors.dangerDim, route: "/(app)/invoices" },
          ].map((a) => (
            <TouchableOpacity key={a.label} onPress={() => router.push(a.route as never)} style={[s.action, { backgroundColor: a.bg }]}>
              <Ionicons name={a.icon} size={24} color={a.color} />
              <Text style={[s.actionLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Credit cards */}
        {cards.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>My Cards</Text>
              <TouchableOpacity onPress={() => router.push("/(app)/credit-cards")}>
                <Text style={s.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}>
              {cards.map((card, i) => {
                const [c1, c2] = CARD_COLORS[i % CARD_COLORS.length];
                const used = ((card.cardLimit - card.availableBalance) / card.cardLimit) * 100;
                return (
                  <TouchableOpacity key={card.id} onPress={() => router.push(`/(app)/credit-cards/${card.id}` as never)} style={s.cardWrap}>
                    <LinearGradient colors={[c1, c2]} style={s.cardTile} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <View style={s.cardTop}>
                        <Text style={s.cardName}>{card.name}</Text>
                        <Ionicons name="card" size={20} color="rgba(255,255,255,0.5)" />
                      </View>
                      <Text style={s.cardBalance}>{formatCurrency(card.availableBalance, card.currency)}</Text>
                      <Text style={s.cardBalLabel}>Available</Text>
                      <View style={s.cardBar}>
                        <View style={[s.cardBarFill, { width: `${100 - used}%` }]} />
                      </View>
                      <Text style={s.cardLimit}>Limit {formatCurrency(card.cardLimit, card.currency)}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Bank accounts */}
        {accounts.length > 0 && (
          <View style={[s.section, { paddingHorizontal: 20 }]}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Bank Accounts</Text>
              <TouchableOpacity onPress={() => router.push("/(app)/bank-accounts")}>
                <Text style={s.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={s.card}>
              {accounts.map((account, i) => (
                <TouchableOpacity
                  key={account.id}
                  onPress={() => router.push(`/(app)/bank-accounts/${account.id}` as never)}
                  style={[s.accountRow, i < accounts.length - 1 && s.accountBorder]}
                >
                  <View style={s.accountIcon}>
                    <Ionicons name="wallet-outline" size={16} color={colors.success} />
                  </View>
                  <Text style={s.accountName} numberOfLines={1}>{account.name}</Text>
                  <Text style={s.accountBal}>{formatCurrency(account.currentBalance, account.currency)}</Text>
                </TouchableOpacity>
              ))}
              {/* Total row */}
              <View style={[s.accountRow, s.totalRow]}>
                <View style={[s.accountIcon, { backgroundColor: colors.successDim }]}>
                  <Ionicons name="calculator-outline" size={16} color={colors.success} />
                </View>
                <Text style={s.totalLabel}>Total</Text>
                <Text style={s.totalAmt}>{formatCurrency(totalBank, currency)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent transactions */}
        <View style={[s.section, { paddingHorizontal: 20 }]}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Recent</Text>
            <TouchableOpacity onPress={() => router.push("/(app)/transactions")}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.card, { paddingVertical: 4 }]}>
            {recent5.length === 0 ? (
              <View style={s.empty}>
                <Text style={{ color: colors.textSub, fontSize: 13 }}>No transactions yet</Text>
              </View>
            ) : recent5.map((tx, i) => {
              const cfg = txTypeConfig[tx.type as keyof typeof txTypeConfig] ?? txTypeConfig.expense;
              return (
                <View key={tx.id} style={[s.txRow, i < recent5.length - 1 && s.txBorder]}>
                  <View style={[s.txIcon, { backgroundColor: cfg.color + "20" }]}>
                    <Ionicons name={cfg.icon} size={16} color={cfg.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.txName} numberOfLines={1}>{tx.name}</Text>
                    <Text style={s.txSub}>{formatShortDate(tx.date)}</Text>
                  </View>
                  <Text style={[s.txAmt, { color: tx.type === "income" ? colors.success : colors.text }]}>
                    {cfg.sign}{formatCurrency(Math.abs(tx.amount), currency)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
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
  scroll: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  greeting: { fontSize: 11, fontWeight: "600", letterSpacing: 1.5, textTransform: "uppercase", color: colors.textSub, marginBottom: 8 },
  netWorth: { fontSize: 36, fontWeight: "800", color: colors.text, letterSpacing: -1 },
  netLabel: { fontSize: 12, color: colors.textSub, marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center", position: "relative" },
  notifDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  tiles: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  tile: { flex: 1, borderRadius: 20, padding: 16, borderWidth: 1 },
  tileAmt: { fontSize: 18, fontWeight: "800", marginTop: 10, marginBottom: 2 },
  tileLabel: { fontSize: 11, color: colors.textSub, fontWeight: "500" },
  alert: { marginHorizontal: 20, marginTop: 16, backgroundColor: colors.warningDim, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,184,0,0.25)", gap: 10 },
  alertIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.warningDim, alignItems: "center", justifyContent: "center" },
  alertTitle: { fontSize: 13, fontWeight: "700", color: colors.warning },
  alertSub: { fontSize: 11, color: colors.textSub, marginTop: 1 },
  actions: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 20, gap: 10 },
  action: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 16 },
  actionLabel: { fontSize: 10, fontWeight: "700", marginTop: 6, letterSpacing: 0.5 },
  section: { marginTop: 28 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.text, letterSpacing: -0.3 },
  seeAll: { fontSize: 12, color: colors.primary, fontWeight: "600" },
  card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  cardWrap: { marginRight: 12 },
  cardTile: { width: 220, borderRadius: 20, padding: 20, height: 160 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardName: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.9)" },
  cardBalance: { fontSize: 26, fontWeight: "800", color: "#fff" },
  cardBalLabel: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2, marginBottom: 12 },
  cardBar: { height: 3, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 99, marginBottom: 6 },
  cardBarFill: { height: 3, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 99 },
  cardLimit: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  accountRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 10 },
  accountBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  accountIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" },
  accountName: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.text },
  accountBal: { fontSize: 14, fontWeight: "700", color: colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface2 },
  totalLabel: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.success },
  totalAmt: { fontSize: 15, fontWeight: "800", color: colors.success },
  txRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  txBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  txIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txName: { fontSize: 13, fontWeight: "600", color: colors.text },
  txSub: { fontSize: 11, color: colors.textSub, marginTop: 2 },
  txAmt: { fontSize: 13, fontWeight: "700" },
  empty: { alignItems: "center", padding: 24 },
  fab: { position: "absolute", bottom: 80, right: 24, width: 56, height: 56, borderRadius: 18, overflow: "hidden", ...shadow.glow(colors.primary) },
  fabGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
});
