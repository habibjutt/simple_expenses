import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { creditCards, bankAccounts, invoices } from "@simple-expenses/api";
import { formatCurrency } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors, shadow } from "../../lib/theme";

const CARD_COLORS = colors.cards;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning ☀️";
  if (hour < 17) return "Good afternoon 🌤️";
  return "Good evening 🌙";
}

function getNextBillDate(billDay: number): string {
  const today = new Date();
  let d = new Date(today.getFullYear(), today.getMonth(), billDay);
  if (d.getTime() <= today.getTime()) d = new Date(today.getFullYear(), today.getMonth() + 1, billDay);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  // Refetch balances whenever this tab gains focus (e.g. after adding a transaction)
  useFocusEffect(
    useCallback(() => {
      qc.invalidateQueries({ queryKey: ["credit-cards"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      qc.invalidateQueries({ queryKey: ["all-invoices-dash"] });
    }, [qc])
  );

  const { data: cards = [] } = useQuery({ queryKey: ["credit-cards"], queryFn: () => creditCards.list() });
  const { data: accounts = [] } = useQuery({ queryKey: ["bank-accounts"], queryFn: () => bankAccounts.list() });
  const { data: allInvoices = [] } = useQuery({
    queryKey: ["all-invoices-dash"],
    queryFn: async () => {
      if (!cards.length) return [];
      const res = await Promise.all(cards.map((c) => invoices.list(c.id)));
      return res.flat();
    },
    enabled: cards.length > 0,
  });

  const totalCredit = cards.reduce((s, c) => s + c.availableBalance, 0);
  const totalBank = accounts.reduce((s, a) => s + a.currentBalance, 0);
  const unpaidInvoices = allInvoices.filter((i) => !i.isPaid);
  const currency = cards[0]?.currency ?? accounts[0]?.currency ?? "AED";

  const cardDueMap: Record<string, number> = {};
  unpaidInvoices.forEach((inv) => {
    const due = inv.totalAmount - inv.paidAmount;
    if (due > 0) cardDueMap[inv.creditCardId] = (cardDueMap[inv.creditCardId] ?? 0) + due;
  });

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        bounces={false}
      >
        {/* Hero gradient header — scrolls with content */}
        <LinearGradient
          colors={["#8b67ff", "#6c47ff", "#4e2ee0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.heroGrad, { paddingTop: insets.top + 16 }]}
        >
          <View style={s.heroBubble1} />
          <View style={s.heroBubble2} />
          <View style={s.heroTop}>
            <Text style={s.greeting}>{getGreeting()}</Text>
            <TouchableOpacity
              style={s.notifBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => router.push("/(app)/invoices")}
            >
              <Ionicons name="notifications-outline" size={20} color="rgba(255,255,255,0.9)" />
              {unpaidInvoices.length > 0 && <View style={s.notifDot} />}
            </TouchableOpacity>
          </View>
          <Text style={s.netWorth}>{formatCurrency(totalBank, currency)}</Text>
          <View style={s.netLabelRow}>
            <View style={s.netLabelDot} />
            <Text style={s.netLabel}>Net Worth</Text>
          </View>
          <View style={s.pills}>
            <View style={s.pill}>
              <View style={s.pillIcon}><Ionicons name="card-outline" size={13} color="#fff" /></View>
              <View>
                <Text style={s.pillLabel}>Credit Available</Text>
                <Text style={s.pillAmt}>{formatCurrency(totalCredit, currency)}</Text>
              </View>
            </View>
            <View style={s.pillSep} />
            <View style={s.pill}>
              <View style={s.pillIcon}><Ionicons name="wallet-outline" size={13} color="#fff" /></View>
              <View>
                <Text style={s.pillLabel}>Bank Balance</Text>
                <Text style={s.pillAmt}>{formatCurrency(totalBank, currency)}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Body */}
        <View style={s.body}>
          {/* Unpaid alert */}
          {unpaidInvoices.length > 0 && (
            <TouchableOpacity onPress={() => router.push("/(app)/invoices")} style={s.alert} activeOpacity={0.8}>
              <View style={s.alertIconWrap}>
                <Ionicons name="warning" size={16} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.alertTitle}>{unpaidInvoices.length} unpaid bill{unpaidInvoices.length > 1 ? "s" : ""}</Text>
                <Text style={s.alertSub}>Tap to view and pay</Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color={colors.warning} />
            </TouchableOpacity>
          )}

          {/* Bank Accounts */}
          {accounts.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={s.sectionIconWrap}>
                  <Ionicons name="wallet" size={15} color={colors.success} />
                </View>
                <Text style={s.sectionTitle}>Bank Accounts</Text>
              </View>
              <View style={[s.card, shadow.card]}>
                {accounts.map((account, i) => {
                  const growth = account.currentBalance - account.initialBalance;
                  const isPositive = growth >= 0;
                  return (
                    <TouchableOpacity
                      key={account.id}
                      onPress={() => router.push(`/(app)/bank-accounts/${account.id}` as never)}
                      style={[s.accountRow, i < accounts.length - 1 && s.accountBorder]}
                      activeOpacity={0.7}
                    >
                      <View style={s.accountIcon}>
                        <Ionicons name="wallet-outline" size={22} color={colors.success} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.accountName} numberOfLines={1}>{account.name}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={s.accountBal}>{formatCurrency(account.currentBalance, account.currency)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity style={[s.manageBtn, s.manageBtnTeal, shadow.card]} onPress={() => router.push("/(app)/bank-accounts")} activeOpacity={0.85}>
                <Ionicons name="wallet-outline" size={16} color="#fff" />
                <Text style={s.manageBtnText}>Manage Accounts</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Credit Cards */}
          {cards.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={[s.sectionIconWrap, { backgroundColor: colors.primaryDim }]}>
                  <Ionicons name="card" size={15} color={colors.primary} />
                </View>
                <Text style={s.sectionTitle}>My Cards</Text>
              </View>
              <View style={[s.card, shadow.card]}>
                {cards.map((card, i) => {
                  const [c1, c2] = CARD_COLORS[i % CARD_COLORS.length];
                  const usedPct = Math.min(100, ((card.cardLimit - card.availableBalance) / card.cardLimit) * 100);
                  const availPct = Math.max(0, 100 - usedPct);
                  const nextBill = getNextBillDate(card.billGenerationDate);
                  const due = cardDueMap[card.id];
                  return (
                    <TouchableOpacity
                      key={card.id}
                      onPress={() => router.push(`/(app)/credit-cards/${card.id}` as never)}
                      style={[s.cardListRow, i < cards.length - 1 && s.cardListBorder]}
                      activeOpacity={0.7}
                    >
                      {/* Row 1: icon + name */}
                      <View style={s.cardListTop}>
                        <LinearGradient colors={[c1, c2]} style={s.cardListBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                          <Ionicons name="card" size={13} color="rgba(255,255,255,0.9)" />
                        </LinearGradient>
                        <Text style={s.cardListName} numberOfLines={1}>{card.name}</Text>
                        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                      </View>

                      {/* Row 2: progress + balance + next bill */}
                      <View style={s.cardListBottom}>
                        <View style={s.cardListBarBg}>
                          <View style={[s.cardListBarFill, { width: `${availPct}%` as any }]} />
                        </View>
                        <View style={s.cardListMetaRow}>
                          <View>
                            <Text style={s.cardListBal}>{formatCurrency(card.availableBalance, card.currency)}</Text>
                            <Text style={s.cardListAvail}>of {formatCurrency(card.cardLimit, card.currency)}</Text>
                          </View>
                          <View style={{ alignItems: "flex-end", gap: 3 }}>
                            <Text style={s.cardListBillText}>Next bill {nextBill}</Text>
                            {due ? (
                              <View style={s.duePill}>
                                <Text style={s.dueAmt}>{formatCurrency(due, card.currency)} due</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity style={[s.manageBtn, s.manageBtnViolet, shadow.card]} onPress={() => router.push("/(app)/credit-cards")} activeOpacity={0.85}>
                <Ionicons name="card-outline" size={16} color="#fff" />
                <Text style={s.manageBtnText}>Manage Cards</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100, backgroundColor: colors.bg },

  heroGrad: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    overflow: "hidden",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  heroBubble1: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.07)", top: -60, right: -50 },
  heroBubble2: { position: "absolute", width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.05)", bottom: 10, left: -30 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  greeting: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.80)", letterSpacing: 0.2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", position: "relative" },
  notifDot: { position: "absolute", top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: "#ff4060", borderWidth: 1.5, borderColor: "#6c47ff" },
  netWorth: { fontSize: 40, fontWeight: "800", color: "#fff", letterSpacing: -1.5 },
  netLabelRow: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 20, gap: 6 },
  netLabelDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.6)" },
  netLabel: { fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: "500" },
  pills: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", overflow: "hidden" },
  pill: { flex: 1, flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, gap: 8 },
  pillIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  pillSep: { width: 1, backgroundColor: "rgba(255,255,255,0.18)", marginVertical: 10 },
  pillLabel: { fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: "500" },
  pillAmt: { fontSize: 13, color: "#fff", fontWeight: "700", marginTop: 1 },

  body: { backgroundColor: colors.bg, paddingTop: 4 },

  alert: { marginHorizontal: 20, marginTop: 18, backgroundColor: colors.warningDim, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,159,10,0.25)", gap: 10 },
  alertIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,159,10,0.15)", alignItems: "center", justifyContent: "center" },
  alertTitle: { fontSize: 13, fontWeight: "700", color: colors.warning },
  alertSub: { fontSize: 11, color: colors.textSub, marginTop: 1 },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  sectionIconWrap: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.successDim, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },

  card: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },

  accountRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  accountBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  accountIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.successDim, alignItems: "center", justifyContent: "center" },
  accountName: { fontSize: 14, fontWeight: "700", color: colors.text },
  accountCurrency: { fontSize: 11, color: colors.textSub, marginTop: 1 },
  accountBal: { fontSize: 16, fontWeight: "800", color: colors.text },
  growthBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, marginTop: 3 },
  growthText: { fontSize: 10, fontWeight: "700" },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface2 },
  totalLabel: { flex: 1, fontSize: 14, fontWeight: "800", color: colors.primary },
  totalAmt: { fontSize: 18, fontWeight: "800", color: colors.primary },

  manageBtn: { flexDirection: "row", alignItems: "center", marginTop: 12, paddingVertical: 15, paddingHorizontal: 22, borderRadius: 18, gap: 8 },
  manageBtnTeal: { backgroundColor: colors.success },
  manageBtnViolet: { backgroundColor: colors.primary },
  manageBtnText: { flex: 1, fontSize: 15, fontWeight: "700", color: "#fff", textAlign: "center" },

  cardListRow: { flexDirection: "column", paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  cardListBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  cardListTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardListBottom: { gap: 8 },
  cardListMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardListBadge: { width: 46, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardListName: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.text },
  cardListBarBg: { height: 4, backgroundColor: colors.border, borderRadius: 99, overflow: "hidden" },
  cardListBarFill: { height: 4, borderRadius: 99, backgroundColor: colors.primary },
  cardListBillText: { fontSize: 11, color: colors.textSub },
  cardListBal: { fontSize: 18, fontWeight: "800", color: colors.text },
  cardListAvail: { fontSize: 11, color: colors.textMuted, fontWeight: "500" },
  cardListLimit: { fontSize: 11, color: colors.textMuted },
  duePill: { backgroundColor: colors.warningDim, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  dueAmt: { fontSize: 10, fontWeight: "700", color: colors.warning },
  sm: { elevation: 2, shadowColor: "#a0aec0", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 6 },
});
