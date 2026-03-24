import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { creditCards, invoices } from "@simple-expenses/api";
import { formatCurrency, formatMonthYear } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

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
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full bg-white border border-slate-200 items-center justify-center mr-3">
          <Ionicons name="arrow-back" size={18} color="#475569" />
        </TouchableOpacity>
        <Text className="text-slate-900 text-xl font-bold flex-1" numberOfLines={1}>{card.name}</Text>
      </View>

      {/* Card summary */}
      <View className="mx-5 mb-4 bg-blue-600 rounded-3xl p-5">
        <Text className="text-white/70 text-xs mb-1">Available Balance</Text>
        <Text className="text-white font-bold text-3xl mb-4">{formatCurrency(card.availableBalance, card.currency)}</Text>
        <View className="bg-white/20 rounded-full h-1.5 mb-1">
          <View className="bg-white rounded-full h-1.5" style={{ width: `${100 - usedPercent}%` }} />
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-white/70 text-xs">Used: {formatCurrency(card.cardLimit - card.availableBalance, card.currency)}</Text>
          <Text className="text-white/70 text-xs">Limit: {formatCurrency(card.cardLimit, card.currency)}</Text>
        </View>
        <View className="flex-row gap-4">
          <View>
            <Text className="text-white/70 text-xs">Bill Day</Text>
            <Text className="text-white font-semibold">{card.billGenerationDate}</Text>
          </View>
          <View>
            <Text className="text-white/70 text-xs">Due Day</Text>
            <Text className="text-white font-semibold">{card.paymentDate}</Text>
          </View>
          <View>
            <Text className="text-white/70 text-xs">Currency</Text>
            <Text className="text-white font-semibold">{card.currency}</Text>
          </View>
        </View>
      </View>

      {/* Invoice history */}
      <Text className="text-slate-900 font-bold text-base px-5 mb-3">Invoice History</Text>
      <FlatList
        data={cardInvoices}
        keyExtractor={(inv) => inv.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-slate-400">No invoices yet</Text>
          </View>
        }
        renderItem={({ item: inv }) => (
          <View className="bg-white rounded-2xl px-4 py-3 mb-2 flex-row items-center" style={{ elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4 }}>
            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${inv.isPaid ? "bg-green-100" : "bg-amber-100"}`}>
              <Ionicons name={inv.isPaid ? "checkmark-circle" : "time-outline"} size={16} color={inv.isPaid ? "#16a34a" : "#d97706"} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 font-semibold text-sm">{formatMonthYear(inv.billStartDate)}</Text>
              <Text className="text-slate-400 text-xs">{inv.isPaid ? "Paid" : `Due: ${formatCurrency(inv.totalAmount - inv.paidAmount, card.currency)}`}</Text>
            </View>
            <Text className="text-slate-800 font-bold text-sm">{formatCurrency(inv.totalAmount, card.currency)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
