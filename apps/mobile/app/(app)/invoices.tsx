import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoices, creditCards, bankAccounts } from "@simple-expenses/api";
import { formatCurrency, formatMonthYear } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

export default function InvoicesScreen() {
  const qc = useQueryClient();
  const { data: cards = [] } = useQuery({ queryKey: ["credit-cards"], queryFn: () => creditCards.list() });
  const { data: accounts = [] } = useQuery({ queryKey: ["bank-accounts"], queryFn: () => bankAccounts.list() });

  const { data: allInvoices = [], isLoading } = useQuery({
    queryKey: ["all-invoices"],
    queryFn: async () => {
      const res = await Promise.all(cards.map((c) => invoices.list(c.id)));
      return res.flat().sort((a, b) => {
        if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
        return new Date(b.billStartDate).getTime() - new Date(a.billStartDate).getTime();
      });
    },
    enabled: cards.length > 0,
  });

  const payMutation = useMutation({
    mutationFn: ({ invoiceId, bankAccountId }: { invoiceId: string; bankAccountId: string }) =>
      invoices.pay(invoiceId, bankAccountId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-invoices"] });
      qc.invalidateQueries({ queryKey: ["credit-cards"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
    onError: (e: Error) => Alert.alert("Error", e.message),
  });

  function handlePay(invoiceId: string, remaining: number, currency: string) {
    if (!accounts.length) { Alert.alert("No Bank Accounts", "Add a bank account first."); return; }
    if (accounts.length === 1) {
      Alert.alert("Pay Invoice", `Pay ${formatCurrency(remaining, currency)} from ${accounts[0].name}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Pay", onPress: () => payMutation.mutate({ invoiceId, bankAccountId: accounts[0].id }) },
      ]);
      return;
    }
    Alert.alert("Select Account", `Pay ${formatCurrency(remaining, currency)} from:`, [
      ...accounts.map((a) => ({ text: `${a.name} (${formatCurrency(a.currentBalance, a.currency)})`, onPress: () => payMutation.mutate({ invoiceId, bankAccountId: a.id }) })),
      { text: "Cancel", style: "cancel" as const },
    ]);
  }

  const unpaid = allInvoices.filter((i) => !i.isPaid);
  const totalDue = unpaid.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0);

  return (
    <View style={s.root}>
      <SafeAreaView style={{ backgroundColor: colors.surface }} edges={["top"]}>
        <View style={s.header}>
          <Text style={s.title}>Invoices</Text>
          {unpaid.length > 0 && (
            <View style={s.dueBadge}>
              <Text style={s.dueText}>{unpaid.length} due</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      <FlatList
        data={allInvoices}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        ListHeaderComponent={
          unpaid.length > 0 ? (
            <View style={s.alert}>
              <Ionicons name="warning" size={18} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={s.alertTitle}>Total due: {formatCurrency(totalDue, cards[0]?.currency ?? "AED")}</Text>
                <Text style={s.alertSub}>{unpaid.length} invoice{unpaid.length > 1 ? "s" : ""} pending payment</Text>
              </View>
            </View>
          ) : allInvoices.length > 0 ? (
            <View style={[s.alert, { borderColor: "rgba(0,200,150,0.25)", backgroundColor: colors.successDim }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[s.alertTitle, { color: colors.success }]}>All invoices paid 🎉</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
            <Text style={s.emptyText}>No invoices yet</Text>
          </View>
        }
        renderItem={({ item: inv }) => {
          const remaining = inv.totalAmount - inv.paidAmount;
          const currency = inv.creditCard?.currency ?? cards.find((c) => c.id === inv.creditCardId)?.currency ?? "AED";
          const cardName = inv.creditCard?.name ?? cards.find((c) => c.id === inv.creditCardId)?.name ?? "Card";
          return (
            <View style={[s.card, inv.isPaid && s.cardPaid]}>
              <View style={s.cardTop}>
                <View style={[s.statusDot, { backgroundColor: inv.isPaid ? colors.success : remaining > 0 ? colors.warning : colors.textMuted }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{cardName}</Text>
                  <Text style={s.cardPeriod}>{formatMonthYear(inv.billStartDate)}</Text>
                </View>
                <View style={[s.statusPill, { backgroundColor: inv.isPaid ? colors.successDim : colors.warningDim }]}>
                  <Text style={[s.statusText, { color: inv.isPaid ? colors.success : colors.warning }]}>
                    {inv.isPaid ? "Paid" : "Due"}
                  </Text>
                </View>
              </View>

              <View style={s.amounts}>
                <View>
                  <Text style={s.amtLabel}>Total</Text>
                  <Text style={s.amtVal}>{formatCurrency(inv.totalAmount, currency)}</Text>
                </View>
                {inv.paidAmount > 0 && (
                  <View>
                    <Text style={s.amtLabel}>Paid</Text>
                    <Text style={[s.amtVal, { color: colors.success }]}>{formatCurrency(inv.paidAmount, currency)}</Text>
                  </View>
                )}
                {!inv.isPaid && remaining > 0 && (
                  <View>
                    <Text style={s.amtLabel}>Remaining</Text>
                    <Text style={[s.amtVal, { color: colors.warning }]}>{formatCurrency(remaining, currency)}</Text>
                  </View>
                )}
              </View>

              {!inv.isPaid && remaining > 0 && (
                <TouchableOpacity
                  style={s.payBtn}
                  onPress={() => handlePay(inv.id, remaining, currency)}
                  disabled={payMutation.isPending}
                >
                  <Text style={s.payBtnText}>{payMutation.isPending ? "Processing…" : `Pay ${formatCurrency(remaining, currency)}`}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  dueBadge: { backgroundColor: colors.dangerDim, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  dueText: { color: colors.danger, fontSize: 12, fontWeight: "700" },
  list: { padding: 20, paddingBottom: 40 },
  alert: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.warningDim, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,184,0,0.25)" },
  alertTitle: { fontSize: 13, fontWeight: "700", color: colors.warning },
  alertSub: { fontSize: 11, color: colors.textSub, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  cardPaid: { borderColor: colors.borderSubtle, opacity: 0.7 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  cardPeriod: { fontSize: 11, color: colors.textSub, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  statusText: { fontSize: 11, fontWeight: "700" },
  amounts: { flexDirection: "row", gap: 24, marginBottom: 14 },
  amtLabel: { fontSize: 10, color: colors.textSub, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  amtVal: { fontSize: 16, fontWeight: "800", color: colors.text },
  payBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: "center" },
  payBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: colors.textSub, fontSize: 14 },
});
