import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { creditCards, bankAccounts, invoices } from "@simple-expenses/api";
import { formatCurrency } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { DashboardBodySkeleton, Bone } from "../../components/ScreenLoader";
import { router, useFocusEffect } from "expo-router";
import { colors, fonts, shadow } from "../../lib/theme";
import { useSubscription } from "../../hooks/useSubscription";

const CARD_COLORS = colors.cards;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getNextDueDate(paymentDay: number): string {
  const today = new Date();
  let d = new Date(today.getFullYear(), today.getMonth(), paymentDay);
  if (d.getTime() <= today.getTime()) d = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { data: subscription } = useSubscription();

  useFocusEffect(
    useCallback(() => {
      qc.invalidateQueries({ queryKey: ["credit-cards"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      qc.invalidateQueries({ queryKey: ["all-invoices-dash"] });
    }, [qc])
  );

  const { data: cards = [], isLoading: cardsLoading } = useQuery({ queryKey: ["credit-cards"], queryFn: () => creditCards.list(), select: (d) => [...d].sort((a, b) => a.name.localeCompare(b.name)) });
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({ queryKey: ["bank-accounts"], queryFn: () => bankAccounts.list(), select: (d) => [...d].sort((a, b) => a.name.localeCompare(b.name)) });
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
  const isDashLoading = cardsLoading && accountsLoading;

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
        {/* Hero gradient header */}
        <LinearGradient
          colors={["#34D399", "#1A9E5C", "#15803D"]}
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
          {isDashLoading ? (
            <Bone width={160} height={36} borderRadius={10} style={{ alignSelf: "center" }} />
          ) : (
            <Text style={s.netWorth}>{formatCurrency(totalBank, currency)}</Text>
          )}
          <View style={s.netLabelRow}>
            <View style={s.netLabelDot} />
            <Text style={s.netLabel}>Net Worth</Text>
          </View>

          {/* Stat cards — two standalone frosted tiles */}
          <View style={s.statRow}>
            <View style={s.statCard}>
              <View style={s.statIconWrap}>
                <Ionicons name="card-outline" size={16} color="#fff" />
              </View>
              <Text style={s.statLabel}>Credit Available</Text>
              <Text style={s.statAmt}>{formatCurrency(totalCredit, currency)}</Text>
            </View>
            <View style={s.statCard}>
              <View style={s.statIconWrap}>
                <Ionicons name="wallet-outline" size={16} color="#fff" />
              </View>
              <Text style={s.statLabel}>Bank Balance</Text>
              <Text style={s.statAmt}>{formatCurrency(totalBank, currency)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Body */}
        {isDashLoading ? (
          <DashboardBodySkeleton />
        ) : (
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

          {/* Trial banner — gentle nudge to upgrade */}
          {subscription?.planTier === "trial" && (
            <TouchableOpacity
              onPress={() => router.push("/(app)/subscription")}
              style={s.trialBanner}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.trialBannerGrad}
              >
                <View style={s.trialBannerLeft}>
                  <View style={s.trialIconWrap}>
                    <Ionicons name="sparkles" size={18} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.trialBannerTitle}>
                      {subscription.trialDaysRemaining != null && subscription.trialDaysRemaining > 0
                        ? `${subscription.trialDaysRemaining} day${subscription.trialDaysRemaining === 1 ? "" : "s"} left in your free trial`
                        : "Your free trial is ending soon"}
                    </Text>
                    <Text style={s.trialBannerSub}>Upgrade to Pro for unlimited access</Text>
                  </View>
                </View>
                <View style={s.trialBannerArrow}>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Free plan nudge — trial expired */}
          {subscription?.planTier === "free" && (
            <TouchableOpacity
              onPress={() => router.push("/(app)/subscription")}
              style={s.freeBanner}
              activeOpacity={0.85}
            >
              <View style={s.freeIconWrap}>
                <Ionicons name="lock-closed" size={16} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.freeBannerTitle}>Trial expired</Text>
                <Text style={s.freeBannerSub}>Upgrade to unlock all features</Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color={colors.warning} />
            </TouchableOpacity>
          )}

          {/* Quick Actions — horizontal row */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionIconWrap, { backgroundColor: colors.primaryDim }]}>
                <Ionicons name="apps" size={15} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={s.quickRow}>
              {([
                { icon: "flag" as const, label: "Goals", color: "#10B981", bg: "#ECFDF5" },
                { icon: "bar-chart" as const, label: "Reports", color: "#1A9E5C", bg: "#ECFDF5" },
                { icon: "speedometer" as const, label: "Budgets", color: "#F59E0B", bg: "#FFFBEB" },
                { icon: "swap-horizontal" as const, label: "Transactions", color: "#06B6D4", bg: "#ECFEFF" },
              ] as const).map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={s.quickChip}
                  onPress={() => router.push(
                    item.label === "Goals" ? "/(app)/goals" as never :
                    item.label === "Reports" ? "/(app)/reports" as never :
                    item.label === "Budgets" ? "/(app)/spending-limits" as never :
                    "/(app)/transactions" as never
                  )}
                  activeOpacity={0.7}
                >
                  <View style={[s.quickChipIcon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={s.quickChipLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bank Accounts — standalone cards */}
          {accounts.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={[s.sectionIconWrap, { backgroundColor: colors.successDim }]}>
                  <Ionicons name="wallet" size={15} color={colors.success} />
                </View>
                <Text style={s.sectionTitle}>Bank Accounts</Text>
              </View>
              <View style={{ gap: 12 }}>
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    onPress={() => router.push(`/(app)/bank-accounts/${account.id}` as never)}
                    style={[s.bankCard, shadow.card]}
                    activeOpacity={0.7}
                  >
                    <View style={s.bankCardIcon}>
                      <Ionicons name="wallet-outline" size={20} color={colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.bankCardName} numberOfLines={1}>{account.name}</Text>
                      <Text style={s.bankCardCurrency}>{account.currency}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={s.bankCardBal}>{formatCurrency(account.currentBalance, account.currency)}</Text>
                      <Text style={s.bankCardLabel}>Balance</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ))}
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
              <View style={{ gap: 14 }}>
                {cards.map((card, i) => {
                  const [c1, c2] = CARD_COLORS[i % CARD_COLORS.length];
                  const availPct = Math.max(0, Math.min(100, (card.availableBalance / card.cardLimit) * 100));
                  const due = cardDueMap[card.id];
                  return (
                    <TouchableOpacity
                      key={card.id}
                      onPress={() => router.push(`/(app)/credit-cards/${card.id}` as never)}
                      style={[s.cardItem, shadow.card]}
                      activeOpacity={0.7}
                    >
                      {/* Card header */}
                      <View style={s.cardItemTop}>
                        <LinearGradient colors={[c1, c2]} style={s.cardItemBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                          <Ionicons name="card" size={16} color="rgba(255,255,255,0.9)" />
                        </LinearGradient>
                        <View style={{ flex: 1 }}>
                          <Text style={s.cardItemName} numberOfLines={1}>{card.name}</Text>
                          <Text style={s.cardItemLimit}>Limit: {formatCurrency(card.cardLimit, card.currency)}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                      </View>

                      {/* Balance */}
                      <Text style={s.cardItemBal}>{formatCurrency(card.availableBalance, card.currency)}</Text>
                      <Text style={s.cardItemAvailLabel}>available</Text>

                      {/* Progress */}
                      <View style={s.cardItemBarRow}>
                        <View style={s.cardItemBarBg}>
                          <LinearGradient colors={[c1, c2]} style={[s.cardItemBarFill, { width: `${availPct}%` as any }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                        </View>
                        <Text style={s.cardItemPct}>{Math.round(availPct)}%</Text>
                      </View>

                      {/* Footer */}
                      <View style={s.cardItemFooter}>
                        <View style={s.cardItemFooterLeft}>
                          <Ionicons name="calendar-outline" size={13} color={colors.textSub} />
                          <Text style={s.cardItemBillText}>Due {getNextDueDate(card.paymentDate)}</Text>
                        </View>
                        {due ? (
                          <View style={s.duePill}>
                            <Text style={s.dueAmt}>{formatCurrency(due, card.currency)} due</Text>
                          </View>
                        ) : null}
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
        )}
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
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroBubble1: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.07)", top: -60, right: -50 },
  heroBubble2: { position: "absolute", width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.05)", bottom: 10, left: -30 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  greeting: { fontSize: 15, fontFamily: fonts.semibold, color: "rgba(255,255,255,0.80)", letterSpacing: 0.2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", position: "relative" },
  notifDot: { position: "absolute", top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: colors.primary },
  netWorth: { fontSize: 40, fontFamily: fonts.extrabold, color: "#fff", letterSpacing: -1.5 },
  netLabelRow: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 20, gap: 6 },
  netLabelDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.6)" },
  netLabel: { fontSize: 12, fontFamily: fonts.medium, color: "rgba(255,255,255,0.65)" },
  // Hero stat cards
  statRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  statIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  statLabel: { fontSize: 12, fontFamily: fonts.medium, color: "rgba(255,255,255,0.65)", marginBottom: 4 },
  statAmt: { fontSize: 18, fontFamily: fonts.bold, color: "#fff" },

  body: { backgroundColor: colors.bg, paddingTop: 4 },

  alert: { marginHorizontal: 20, marginTop: 18, backgroundColor: colors.warningDim, borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(245,158,11,0.20)", gap: 10 },
  alertIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(245,158,11,0.15)", alignItems: "center", justifyContent: "center" },
  alertTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.warning },
  alertSub: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSub, marginTop: 1 },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.successDim, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 20, fontFamily: fonts.extrabold, color: colors.text, letterSpacing: -0.3 },

  card: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },

  // Bank account cards
  bankCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: 20, paddingHorizontal: 18, paddingVertical: 18, gap: 14,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  bankCardIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.successDim, alignItems: "center", justifyContent: "center" },
  bankCardName: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  bankCardCurrency: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSub, marginTop: 2 },
  bankCardBal: { fontSize: 18, fontFamily: fonts.extrabold, color: colors.text },
  bankCardLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSub, marginTop: 2 },

  manageBtn: { flexDirection: "row", alignItems: "center", marginTop: 12, paddingVertical: 15, paddingHorizontal: 22, borderRadius: 20, gap: 8 },
  manageBtnTeal: { backgroundColor: colors.success },
  manageBtnViolet: { backgroundColor: colors.primary },
  manageBtnText: { flex: 1, fontSize: 15, fontFamily: fonts.bold, color: "#fff", textAlign: "center" },

  cardItem: {
    backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.borderSubtle,
    paddingHorizontal: 20, paddingVertical: 20,
  },
  cardItemTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  cardItemBadge: { width: 48, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardItemName: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  cardItemLimit: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSub, marginTop: 2 },
  cardItemBal: { fontSize: 24, fontFamily: fonts.extrabold, color: colors.text, letterSpacing: -0.3 },
  cardItemAvailLabel: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSub, marginTop: 2, marginBottom: 14 },
  cardItemBarRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  cardItemBarBg: { flex: 1, height: 7, backgroundColor: colors.border, borderRadius: 99, overflow: "hidden" },
  cardItemBarFill: { height: 7, borderRadius: 99 },
  cardItemPct: { fontSize: 13, fontFamily: fonts.bold, color: colors.textSub, minWidth: 34, textAlign: "right" },
  cardItemFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardItemFooterLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardItemBillText: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSub },
  cardListLimit: { fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted },
  duePill: { backgroundColor: colors.warningDim, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  dueAmt: { fontSize: 12, fontFamily: fonts.bold, color: colors.warning },

  // Quick actions — horizontal row
  quickRow: { flexDirection: "row", justifyContent: "space-between", paddingBottom: 4 },
  quickChip: { alignItems: "center", gap: 8, flex: 1 },
  quickChipIcon: { width: 56, height: 56, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  quickChipLabel: { fontSize: 13, fontFamily: fonts.semibold, color: colors.text, textAlign: "center" },

  // Trial banner
  trialBanner: { marginHorizontal: 20, marginTop: 18, borderRadius: 18, overflow: "hidden" },
  trialBannerGrad: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  trialBannerLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  trialIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.20)", alignItems: "center", justifyContent: "center" },
  trialBannerTitle: { fontSize: 13, fontFamily: fonts.bold, color: "#fff" },
  trialBannerSub: { fontSize: 11, fontFamily: fonts.medium, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  trialBannerArrow: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },

  // Free plan expired banner
  freeBanner: { marginHorizontal: 20, marginTop: 18, backgroundColor: colors.warningDim, borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(245,158,11,0.20)", gap: 10 },
  freeIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(245,158,11,0.15)", alignItems: "center", justifyContent: "center" },
  freeBannerTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.warning },
  freeBannerSub: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSub, marginTop: 1 },
});
