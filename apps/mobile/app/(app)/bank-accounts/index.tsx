import { useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bankAccounts } from "@simple-expenses/api";
import { CardSkeleton } from "../../../components/ScreenLoader";
import { formatCurrency } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors, fonts } from "../../../lib/theme";

export default function BankAccountsScreen() {
  const qc = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
    }, [qc])
  );

  const { data = [], isLoading } = useQuery({ queryKey: ["bank-accounts"], queryFn: () => bankAccounts.list(), select: (d) => [...d].sort((a, b) => a.name.localeCompare(b.name)) });

  return (
    <View style={s.root}>
      <SafeAreaView style={{ backgroundColor: colors.surface }} edges={["top"]}>
        <View style={s.header}>
          <Text style={s.title}>Bank Accounts</Text>
          <Text style={s.sub}>{data.length} account{data.length !== 1 ? "s" : ""}</Text>
        </View>
      </SafeAreaView>

      {isLoading && data.length === 0 ? (
        <CardSkeleton count={3} />
      ) : (
      <FlatList
        data={data}
        keyExtractor={(a) => a.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="wallet-outline" size={40} color={colors.textMuted} />
            <Text style={s.emptyText}>No bank accounts yet</Text>
          </View>
        }
        renderItem={({ item: account }) => {
          const growth = account.currentBalance - account.initialBalance;
          const positive = growth >= 0;
          return (
            <TouchableOpacity
              onPress={() => router.push(`/(app)/bank-accounts/${account.id}` as never)}
              style={s.card}
              activeOpacity={0.8}
            >
              <View style={s.cardInner}>
                {/* Left: icon + name */}
                <View style={[s.iconWrap, { backgroundColor: colors.successDim }]}>
                  <Ionicons name="wallet" size={22} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{account.name}</Text>
                  <Text style={s.currency}>{account.currency}</Text>
                </View>

                {/* Right: balance + growth */}
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.balance}>{formatCurrency(account.currentBalance, account.currency)}</Text>
                  <View style={[s.badge, { backgroundColor: positive ? colors.successDim : colors.dangerDim }]}>
                    <Ionicons
                      name={positive ? "trending-up" : "trending-down"}
                      size={10}
                      color={positive ? colors.success : colors.danger}
                    />
                    <Text style={[s.badgeText, { color: positive ? colors.success : colors.danger }]}>
                      {positive ? "+" : ""}{formatCurrency(growth, account.currency)}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: 8 }} />
              </View>

              {/* Initial balance bar */}
              <View style={s.cardFooter}>
                <Text style={s.footerLabel}>Initial balance: {formatCurrency(account.initialBalance, account.currency)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 26, fontFamily: fonts.extrabold, color: colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 13, fontFamily: fonts.regular, color: colors.textSub, marginTop: 2 },
  list: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: colors.surface, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  cardInner: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 15, fontFamily: fonts.bold, color: colors.text },
  currency: { fontSize: 11, fontFamily: fonts.regular, color: colors.textSub, marginTop: 2 },
  balance: { fontSize: 18, fontFamily: fonts.extrabold, color: colors.text },
  badge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, marginTop: 4 },
  badgeText: { fontSize: 10, fontFamily: fonts.bold },
  cardFooter: { borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingHorizontal: 16, paddingVertical: 10 },
  footerLabel: { fontSize: 11, fontFamily: fonts.regular, color: colors.textMuted },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontFamily: fonts.regular, color: colors.textSub, fontSize: 14 },
});
