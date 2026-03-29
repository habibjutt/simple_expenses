import { useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { creditCards, invoices, transactions as txApi } from "@simple-expenses/api";
import type { Invoice, Transaction } from "@simple-expenses/types";
import { formatCurrency, formatDate, formatShortDate } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, shadow } from "../../../lib/theme";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default function CreditCardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  function goPrev() {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function goNext() {
    if (isCurrentMonth) return;
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  }

  /* ── Data queries ── */
  const { data: card } = useQuery({
    queryKey: ["credit-cards", id],
    queryFn: () => creditCards.get(id),
    enabled: !!id,
  });

  const { data: allInvoices = [] } = useQuery({
    queryKey: ["invoices", id],
    queryFn: () => invoices.list(id),
    enabled: !!id,
  });

  const { data: monthTx = [] } = useQuery<Transaction[]>({
    queryKey: ["transactions", "cc", id, month, year],
    queryFn: () => txApi.list({ creditCardId: id, month, year }),
    enabled: !!id,
  });

  /* ── Derived data ── */
  const activeInvoice = useMemo<Invoice | null>(() => {
    return allInvoices.find((inv) => {
      const start = new Date(inv.billStartDate);
      const end = new Date(inv.billEndDate);
      const probe = new Date(year, month - 1, 15);
      return probe >= start && probe <= end;
    }) ?? null;
  }, [allInvoices, month, year]);

  const monthExpenses = useMemo(() => monthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0), [monthTx]);
  const monthPayments = useMemo(() => monthTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0), [monthTx]);

  const deleteMutation = useMutation({
    mutationFn: (txId: string) => txApi.delete(txId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
    onError: (e: Error) => Alert.alert("Error", e.message),
  });

  function confirmDelete(txId: string, txName: string) {
    Alert.alert("Delete", `Delete "${txName}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(txId) },
    ]);
  }

  function handleEdit(tx: Transaction) {
    router.push({
      pathname: "/edit-transaction",
      params: {
        id:       tx.id,
        name:     tx.name,
        amount:   String(Math.abs(tx.amount)),
        date:     tx.date,
        category: tx.category ?? "",
        type:     tx.type,
        notes:    tx.notes ?? "",
      },
    });
  }

  if (!card) return null;

  const usedPercent = Math.min(100, ((card.cardLimit - card.availableBalance) / card.cardLimit) * 100);
  const availPercent = Math.max(0, 100 - usedPercent);

  /* ── Header Component for FlatList ── */
  const ListHeader = (
    <>
      {/* Card summary hero */}
      <LinearGradient
        colors={["#34D399", "#1A9E5C", "#15803D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.hero}
      >
        <Text style={st.heroLabel}>Available Balance</Text>
        <Text style={st.heroBalance}>{formatCurrency(card.availableBalance, card.currency)}</Text>

        <View style={st.progressRow}>
          <View style={st.progressBg}>
            <View style={[st.progressFill, { width: `${availPercent}%` as any }]} />
          </View>
          <Text style={st.progressPct}>{Math.round(availPercent)}%</Text>
        </View>
        <View style={st.heroRow}>
          <Text style={st.heroMeta}>Used: {formatCurrency(card.cardLimit - card.availableBalance, card.currency)}</Text>
          <Text style={st.heroMeta}>Limit: {formatCurrency(card.cardLimit, card.currency)}</Text>
        </View>

        <View style={st.heroStats}>
          <View style={st.heroPill}>
            <Text style={st.heroStatLabel}>Bill Day</Text>
            <Text style={st.heroStatValue}>{card.billGenerationDate}{getOrdinal(card.billGenerationDate)}</Text>
          </View>
          <View style={st.heroPill}>
            <Text style={st.heroStatLabel}>Due Day</Text>
            <Text style={st.heroStatValue}>{card.paymentDate}{getOrdinal(card.paymentDate)}</Text>
          </View>
          <View style={st.heroPill}>
            <Text style={st.heroStatLabel}>Currency</Text>
            <Text style={st.heroStatValue}>{card.currency}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Month navigator ── */}
      <View style={st.monthNav}>
        <TouchableOpacity onPress={goPrev} style={st.monthBtn} activeOpacity={0.6}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={st.monthCenter}>
          <Text style={st.monthText}>{MONTH_NAMES[month - 1]} {year}</Text>
          {isCurrentMonth && <View style={st.currentDot} />}
        </View>
        <TouchableOpacity
          onPress={goNext}
          style={[st.monthBtn, isCurrentMonth && { opacity: 0.3 }]}
          disabled={isCurrentMonth}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Invoice card for selected month ── */}
      {activeInvoice ? (
        <View style={[st.invoiceCard, shadow.card]}>
          <View style={st.invoiceHeader}>
            <View style={[st.invoiceIcon, { backgroundColor: activeInvoice.isPaid ? colors.successDim : colors.warningDim }]}>
              <Ionicons
                name={activeInvoice.isPaid ? "checkmark-circle" : "alert-circle"}
                size={22}
                color={activeInvoice.isPaid ? colors.success : colors.warning}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.invoiceTitle}>
                {activeInvoice.isPaid ? "Paid" : "Current Invoice"}
              </Text>
              <Text style={st.invoicePeriod}>
                {formatShortDate(activeInvoice.billStartDate)} – {formatShortDate(activeInvoice.billEndDate)}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[st.invoiceTotal, !activeInvoice.isPaid && { color: colors.warning }]}>
                {formatCurrency(activeInvoice.totalAmount, card.currency)}
              </Text>
              <Text style={st.invoiceTotalLabel}>Total</Text>
            </View>
          </View>

          <View style={st.invoiceDivider} />

          <View style={st.invoiceGrid}>
            <InvoiceStat
              icon="calendar-outline"
              label="Due Date"
              value={formatDate(activeInvoice.paymentDueDate)}
              color={!activeInvoice.isPaid && new Date(activeInvoice.paymentDueDate) < new Date() ? colors.danger : colors.textSub}
            />
            <InvoiceStat
              icon="cash-outline"
              label="Paid"
              value={formatCurrency(activeInvoice.paidAmount, card.currency)}
              color={activeInvoice.isPaid ? colors.success : colors.textSub}
            />
            <InvoiceStat
              icon="receipt-outline"
              label="Remaining"
              value={formatCurrency(Math.max(0, activeInvoice.totalAmount - activeInvoice.paidAmount), card.currency)}
              color={activeInvoice.isPaid ? colors.textMuted : colors.warning}
            />
            {activeInvoice.creditFromPreviousMonth > 0 && (
              <InvoiceStat
                icon="arrow-undo-outline"
                label="Credit"
                value={formatCurrency(activeInvoice.creditFromPreviousMonth, card.currency)}
                color={colors.primary}
              />
            )}
          </View>
        </View>
      ) : (
        <View style={st.noInvoice}>
          <Ionicons name="document-outline" size={24} color={colors.textMuted} />
          <Text style={st.noInvoiceText}>No invoice for this month</Text>
        </View>
      )}

      {/* ── Monthly summary pills ── */}
      <View style={st.summaryRow}>
        <View style={[st.summaryPill, { backgroundColor: colors.dangerDim }]}>
          <Text style={[st.summaryLabel, { color: colors.danger }]}>Charges</Text>
          <Text style={[st.summaryValue, { color: colors.danger }]}>{formatCurrency(monthExpenses, card.currency)}</Text>
        </View>
        <View style={[st.summaryPill, { backgroundColor: colors.successDim }]}>
          <Text style={[st.summaryLabel, { color: colors.success }]}>Payments</Text>
          <Text style={[st.summaryValue, { color: colors.success }]}>{formatCurrency(monthPayments, card.currency)}</Text>
        </View>
      </View>

      {/* ── Transactions header ── */}
      <View style={st.txHeader}>
        <Text style={st.sectionTitle}>Transactions</Text>
        <Text style={st.txCount}>{monthTx.length} items</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={st.root} edges={["top"]}>
      {/* Header bar */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(app)/credit-cards")} style={st.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={st.headerTitle} numberOfLines={1}>{card.name}</Text>
      </View>

      <FlatList
        data={monthTx}
        keyExtractor={(tx) => tx.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={st.empty}>
            <Ionicons name="card-outline" size={40} color={colors.textMuted} />
            <Text style={st.emptyTitle}>No transactions</Text>
            <Text style={st.emptyText}>
              No charges or payments for {MONTH_NAMES[month - 1]} {year}
            </Text>
          </View>
        }
        renderItem={({ item: tx }) => {
          const isPayment = tx.amount < 0;
          return (
            <View style={[st.txRow, shadow.card]}>
              <View style={[st.txIcon, { backgroundColor: isPayment ? colors.successDim : colors.dangerDim }]}>
                <Ionicons
                  name={isPayment ? "arrow-down-circle" : "arrow-up-circle"}
                  size={18}
                  color={isPayment ? colors.success : colors.danger}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.txName} numberOfLines={1}>{tx.name}</Text>
                <Text style={st.txDate}>
                  {formatShortDate(tx.date)}
                  {tx.category ? ` · ${tx.category}` : ""}
                  {tx.installmentNumber && tx.installments && tx.installments > 1
                    ? ` · ${tx.installmentNumber}/${tx.installments}`
                    : ""}
                </Text>
              </View>
              <Text style={[st.txAmount, { color: isPayment ? colors.success : colors.danger }]}>
                {isPayment ? "+" : "−"}{formatCurrency(Math.abs(tx.amount), card.currency)}
              </Text>
              <TouchableOpacity onPress={() => handleEdit(tx)} style={st.action} hitSlop={8}>
                <Ionicons name="create-outline" size={14} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(tx.id, tx.name)} style={st.action} hitSlop={8}>
                <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

/* ── Small stat component for invoice card ── */
function InvoiceStat({ icon, label, value, color }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={st.invStat}>
      <Ionicons name={icon} size={16} color={color} style={{ marginRight: 6 }} />
      <View>
        <Text style={st.invStatLabel}>{label}</Text>
        <Text style={[st.invStatValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

/* ── Styles ── */
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryDim, alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  headerTitle: { flex: 1, fontSize: 22, fontFamily: fonts.bold, color: colors.text },

  /* Hero */
  hero: { marginHorizontal: 20, marginBottom: 20, borderRadius: 28, padding: 28 },
  heroLabel: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: fonts.medium, marginBottom: 6 },
  heroBalance: { color: "#fff", fontFamily: fonts.extrabold, fontSize: 36, letterSpacing: -0.5, marginBottom: 20 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6 },
  progressBg: { flex: 1, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 99, height: 8 },
  progressFill: { backgroundColor: "#fff", borderRadius: 99, height: 8 },
  progressPct: { fontSize: 13, fontFamily: fonts.bold, color: "rgba(255,255,255,0.85)", minWidth: 36, textAlign: "right" },
  heroRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  heroMeta: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: fonts.medium },
  heroStats: { flexDirection: "row", gap: 10 },
  heroPill: { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10, alignItems: "center" },
  heroStatLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: fonts.medium, marginBottom: 4 },
  heroStatValue: { color: "#fff", fontFamily: fonts.bold, fontSize: 15 },

  /* Month navigator */
  monthNav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: colors.surface, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  monthBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: colors.primaryDim,
    alignItems: "center", justifyContent: "center",
  },
  monthCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  monthText: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  currentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },

  /* Invoice card */
  invoiceCard: {
    marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surface,
    borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.borderSubtle,
  },
  invoiceHeader: { flexDirection: "row", alignItems: "center" },
  invoiceIcon: {
    width: 48, height: 48, borderRadius: 16,
    alignItems: "center", justifyContent: "center", marginRight: 14,
  },
  invoiceTitle: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  invoicePeriod: { fontSize: 12, fontFamily: fonts.regular, color: colors.textSub, marginTop: 2 },
  invoiceTotal: { fontSize: 20, fontFamily: fonts.extrabold, color: colors.text },
  invoiceTotalLabel: { fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted, marginTop: 1 },
  invoiceDivider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  invoiceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  invStat: { flexDirection: "row", alignItems: "center", width: "46%" as any },
  invStatLabel: { fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted },
  invStatValue: { fontSize: 13, fontFamily: fonts.bold, marginTop: 1 },
  noInvoice: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginHorizontal: 20, marginBottom: 16, paddingVertical: 20,
    backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border,
  },
  noInvoiceText: { fontSize: 14, fontFamily: fonts.medium, color: colors.textMuted },

  /* Summary pills */
  summaryRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  summaryPill: { flex: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14 },
  summaryLabel: { fontSize: 12, fontFamily: fonts.medium, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontFamily: fonts.bold },

  /* Transactions */
  txHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontFamily: fonts.bold, color: colors.text },
  txCount: { fontSize: 13, fontFamily: fonts.medium, color: colors.textMuted },
  txRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14,
    marginHorizontal: 20, marginBottom: 8,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  txIcon: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  txName: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
  txDate: { fontSize: 12, fontFamily: fonts.regular, color: colors.textSub, marginTop: 2 },
  txAmount: { fontSize: 15, fontFamily: fonts.bold },
  action: { padding: 4 },

  /* Empty state */
  empty: { alignItems: "center", paddingVertical: 40, gap: 8, paddingHorizontal: 20 },
  emptyTitle: { fontFamily: fonts.bold, color: colors.text, fontSize: 17 },
  emptyText: { fontFamily: fonts.regular, color: colors.textSub, fontSize: 14, textAlign: "center" },
});