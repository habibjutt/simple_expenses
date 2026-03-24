import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { bankAccounts, transactions } from "@simple-expenses/api";
import { formatCurrency, formatShortDate } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

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

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full bg-white border border-slate-200 items-center justify-center mr-3">
          <Ionicons name="arrow-back" size={18} color="#475569" />
        </TouchableOpacity>
        <Text className="text-slate-900 text-xl font-bold flex-1" numberOfLines={1}>{account.name}</Text>
      </View>

      {/* Balance summary */}
      <View className="mx-5 mb-4 bg-emerald-600 rounded-3xl p-5">
        <Text className="text-white/70 text-xs mb-1">Current Balance</Text>
        <Text className="text-white font-bold text-3xl mb-3">{formatCurrency(account.currentBalance, account.currency)}</Text>
        <View className="flex-row gap-4">
          <View>
            <Text className="text-white/70 text-xs">Initial</Text>
            <Text className="text-white font-semibold">{formatCurrency(account.initialBalance, account.currency)}</Text>
          </View>
          <View>
            <Text className="text-white/70 text-xs">Change</Text>
            <Text className={`font-semibold ${account.currentBalance >= account.initialBalance ? "text-white" : "text-red-300"}`}>
              {account.currentBalance >= account.initialBalance ? "+" : ""}{formatCurrency(account.currentBalance - account.initialBalance, account.currency)}
            </Text>
          </View>
          <View>
            <Text className="text-white/70 text-xs">Currency</Text>
            <Text className="text-white font-semibold">{account.currency}</Text>
          </View>
        </View>
      </View>

      {/* Transaction history */}
      <Text className="text-slate-900 font-bold text-base px-5 mb-3">Transactions</Text>
      <FlatList
        data={txList.filter((t) => t.installmentNumber !== 0)}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-slate-400">No transactions yet</Text>
          </View>
        }
        renderItem={({ item: tx }) => (
          <View className="bg-white rounded-2xl px-4 py-3 mb-2 flex-row items-center" style={{ elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4 }}>
            <View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${tx.type === "income" ? "bg-green-100" : "bg-slate-100"}`}>
              <Ionicons name={tx.type === "income" ? "arrow-down-outline" : "arrow-up-outline"} size={16} color={tx.type === "income" ? "#16a34a" : "#64748b"} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 font-medium text-sm" numberOfLines={1}>{tx.name}</Text>
              <Text className="text-slate-400 text-xs">{formatShortDate(tx.date)} · {tx.category}</Text>
            </View>
            <Text className={`font-bold text-sm ${tx.type === "income" ? "text-green-600" : "text-slate-800"}`}>
              {tx.type === "income" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount), account.currency)}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
