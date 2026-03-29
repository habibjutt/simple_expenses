import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactions as txApi, categories as categoriesApi } from "@simple-expenses/api";
import type { Category, UpdateTransactionInput } from "@simple-expenses/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import AuthButton from "../components/AuthButton";
import { colors, fonts } from "../lib/theme";

type TxType = "expense" | "income";

const TYPE_CONFIG: Record<TxType, { label: string; color: string; dim: string }> = {
  expense: { label: "Expense", color: colors.danger,  dim: colors.dangerDim },
  income:  { label: "Income",  color: colors.success, dim: colors.successDim },
};

export default function EditTransactionScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    amount: string;
    date: string;
    category: string;
    type: string;
    notes: string;
  }>();

  const qc = useQueryClient();

  const [txType, setTxType] = useState<TxType>(
    params.type === "income" ? "income" : "expense",
  );
  const [name, setName]     = useState(params.name ?? "");
  const [amount, setAmount] = useState(params.amount ?? "");
  const [date, setDate]     = useState(() => {
    const d = new Date(params.date ?? "");
    return isNaN(d.getTime()) ? new Date() : d;
  });
  const [notes, setNotes]   = useState(params.notes ?? "");

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showDatePicker, setShowDatePicker]          = useState(false);
  const [catModalOpen, setCatModalOpen]              = useState(false);

  const { data: categoriesList = [] } = useQuery<Category[]>({
    queryKey: ["categories", txType],
    queryFn: () => categoriesApi.list(txType),
    select: (d) => [...d].sort((a, b) => a.name.localeCompare(b.name)),
  });

  // Pre-select the matching category once the list loads
  useEffect(() => {
    if (categoriesList.length > 0 && !selectedCategoryId) {
      const match = categoriesList.find((c) => c.name === params.category);
      if (match) setSelectedCategoryId(match.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesList]);

  const selectedCategory = categoriesList.find((c) => c.id === selectedCategoryId);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateTransactionInput) => txApi.update(params.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["credit-cards"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      Alert.alert("Saved", "Transaction updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (e: Error) => Alert.alert("Error", e.message),
  });

  function onSave() {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      Alert.alert("Validation Error", "Please enter a valid amount");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Validation Error", "Please select a category");
      return;
    }
    // income is stored as negative, expense as positive
    const signedAmount = txType === "income" ? -Math.abs(amt) : Math.abs(amt);
    updateMutation.mutate({
      name: name.trim() || (txType === "income" ? "Income" : "Expense"),
      amount: signedAmount,
      date: date.toISOString().slice(0, 10),
      category: selectedCategory.name,
      type: txType,
      notes: notes.trim() || undefined,
    });
  }

  const cfg = TYPE_CONFIG[txType];

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={18} color={colors.primary} />
            </TouchableOpacity>
            <Text style={s.title}>Edit Transaction</Text>
          </View>

          {/* Type selector */}
          <View style={s.section}>
            <Text style={s.label}>Type</Text>
            <View style={s.typeRow}>
              {(["expense", "income"] as TxType[]).map((t) => {
                const active = txType === t;
                const c = TYPE_CONFIG[t];
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      s.typeBtn,
                      active && {
                        backgroundColor: c.dim,
                        borderColor: c.color,
                        borderWidth: 1.5,
                      },
                    ]}
                    onPress={() => { setTxType(t); setSelectedCategoryId(""); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.typeBtnText, active && { color: c.color, fontFamily: fonts.bold }]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Name */}
          <View style={s.section}>
            <Text style={s.label}>Name</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Transaction name"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Amount */}
          <View style={s.section}>
            <Text style={s.label}>Amount</Text>
            <View style={s.amtRow}>
              <View style={[s.amtBadge, { backgroundColor: cfg.dim }]}>
                <Text style={[s.amtSign, { color: cfg.color }]}>
                  {txType === "income" ? "+" : "−"}
                </Text>
              </View>
              <TextInput
                style={[s.input, { flex: 1, marginBottom: 0 }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Date */}
          <View style={s.section}>
            <Text style={s.label}>Date</Text>
            <TouchableOpacity
              style={[s.input, s.rowInput]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={s.inputText}>
                {date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={colors.textSub} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                maximumDate={new Date()}
                onChange={(_, d) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (d) setDate(d);
                }}
              />
            )}
          </View>

          {/* Category */}
          <View style={s.section}>
            <Text style={s.label}>Category</Text>
            <TouchableOpacity
              style={[s.input, s.rowInput]}
              onPress={() => setCatModalOpen(true)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {selectedCategory && (
                  <View style={[s.catDot, { backgroundColor: selectedCategory.color }]} />
                )}
                <Text style={selectedCategory ? s.inputText : s.inputPlaceholder}>
                  {selectedCategory?.name ?? "Select category"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={colors.textSub} />
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={s.section}>
            <Text style={s.label}>Notes (optional)</Text>
            <TextInput
              style={[s.input, { height: 80, textAlignVertical: "top" }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              placeholderTextColor={colors.textMuted}
              multiline
            />
          </View>

          {/* Save */}
          <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
            <AuthButton
              title="Save Changes"
              onPress={onSave}
              loading={updateMutation.isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category picker modal */}
      <Modal
        visible={catModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCatModalOpen(false)}
      >
        <TouchableOpacity
          style={s.overlay}
          activeOpacity={1}
          onPress={() => setCatModalOpen(false)}
        >
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>Category</Text>
            <FlatList
              data={categoriesList}
              keyExtractor={(c) => c.id}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => {
                const active = selectedCategoryId === item.id;
                return (
                  <TouchableOpacity
                    style={[s.catRow, active && s.catRowActive]}
                    onPress={() => { setSelectedCategoryId(item.id); setCatModalOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <View style={[s.catDot, { backgroundColor: item.color }]} />
                    <Text style={[s.catName, active && { color: colors.primary, fontFamily: fonts.semibold }]}>
                      {item.name}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.primaryDim,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  title: { fontSize: 22, fontFamily: fonts.bold, color: colors.text },

  section: { paddingHorizontal: 20, marginTop: 20 },
  label: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSub, marginBottom: 8 },

  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    backgroundColor: colors.surface2, alignItems: "center",
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  typeBtnText: { fontSize: 14, fontFamily: fonts.medium, color: colors.textSub },

  input: {
    backgroundColor: colors.surface, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, fontFamily: fonts.regular, color: colors.text,
    borderWidth: 1, borderColor: colors.borderSubtle,
    marginBottom: 0,
  },
  rowInput: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  inputText: { fontSize: 15, fontFamily: fonts.regular, color: colors.text },
  inputPlaceholder: { fontSize: 15, fontFamily: fonts.regular, color: colors.textMuted },

  amtRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  amtBadge: {
    width: 44, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  amtSign: { fontSize: 22, fontFamily: fonts.bold },

  catDot: { width: 10, height: 10, borderRadius: 5 },

  /* Category modal */
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 12, paddingBottom: 32, paddingHorizontal: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: "center", marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, marginBottom: 12 },
  catRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14,
    marginBottom: 2,
  },
  catRowActive: { backgroundColor: colors.primaryDim },
  catName: { flex: 1, fontSize: 15, fontFamily: fonts.regular, color: colors.text },
});
