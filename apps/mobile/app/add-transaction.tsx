import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import {
  transactions as txApi,
  creditCards,
  bankAccounts,
  categories as categoriesApi,
  type TransferInput,
} from "@simple-expenses/api";
import type { BankAccount, CreditCard, Category, CreateTransactionInput } from "@simple-expenses/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import { colors } from "../lib/theme";

type TxType = "expense" | "income" | "transfer";

const TYPE_CONFIG: Record<TxType, { label: string; color: string; dim: string }> = {
  expense:  { label: "Expense",  color: colors.danger,  dim: colors.dangerDim },
  income:   { label: "Income",   color: colors.success, dim: colors.successDim },
  transfer: { label: "Transfer", color: "#0ea5e9",      dim: "rgba(14,165,233,0.10)" },
};

function AccountPills({
  items,
  selectedId,
  disabledId,
  icon,
  onSelect,
}: {
  items: Array<{ id: string; name: string }>;
  selectedId: string;
  disabledId?: string;
  icon: "card-outline" | "wallet-outline";
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) {
    return <Text style={s.emptyText}>No accounts found</Text>;
  }
  return (
    <>
      {items.map((item) => {
        const active = selectedId === item.id;
        const disabled = disabledId === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[s.pill, active && s.pillActive, disabled && s.pillDisabled]}
            onPress={() => { if (!disabled) onSelect(item.id); }}
            disabled={disabled}
          >
            <Ionicons name={icon} size={16} color={active ? colors.primary : colors.textSub} />
            <Text style={[s.pillText, active && s.pillTextActive]}>{item.name}</Text>
          </TouchableOpacity>
        );
      })}
    </>
  );
}

export default function AddTransactionScreen() {
  const qc = useQueryClient();

  const [txType, setTxType] = useState<TxType>("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [accountType, setAccountType] = useState<"card" | "bank">("card");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [installments, setInstallments] = useState("1");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");

  const { data: cards = [] } = useQuery<CreditCard[]>({
    queryKey: ["credit-cards"],
    queryFn: () => creditCards.list(),
  });

  const { data: accounts = [] } = useQuery<BankAccount[]>({
    queryKey: ["bank-accounts"],
    queryFn: () => bankAccounts.list(),
  });

  const { data: categoriesList = [], isLoading: catsLoading } = useQuery<Category[]>({
    queryKey: ["categories", txType],
    queryFn: () => categoriesApi.list(txType),
    enabled: txType !== "transfer",
  });

  const txMutation = useMutation({
    mutationFn: (payload: CreateTransactionInput) => txApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["credit-cards"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      Alert.alert("Success", "Transaction added!", [{ text: "OK", onPress: () => router.back() }]);
    },
    onError: (e: Error) => Alert.alert("Error", e.message),
  });

  const transferMutation = useMutation({
    mutationFn: (payload: TransferInput) => txApi.transfer(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      Alert.alert("Success", "Transfer completed!", [{ text: "OK", onPress: () => router.back() }]);
    },
    onError: (e: Error) => Alert.alert("Error", e.message),
  });

  function onTypeChange(type: TxType) {
    setTxType(type);
    setSelectedCategory(null);
    if (type === "transfer") {
      setFromAccountId(accounts[0]?.id ?? "");
      setToAccountId(accounts[1]?.id ?? "");
    }
  }

  function validate(): string | null {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) return "Please enter a valid amount";
    if (!date) return "Please enter a date (YYYY-MM-DD)";
    if (txType === "transfer") {
      if (!fromAccountId) return "Please select a source account";
      if (!toAccountId) return "Please select a destination account";
      if (fromAccountId === toAccountId) return "Source and destination must be different";
    } else {
      if (!selectedCategory) return "Please select a category";
      if (accountType === "card" && !selectedCardId) return "Please select a credit card";
      if (accountType === "bank" && !selectedAccountId) return "Please select a bank account";
    }
    return null;
  }

  function onSubmit() {
    const err = validate();
    if (err) { Alert.alert("Validation Error", err); return; }

    const amt = parseFloat(amount);

    if (txType === "transfer") {
      transferMutation.mutate({
        fromBankAccountId: fromAccountId,
        toBankAccountId: toAccountId,
        amount: amt,
        date,
        notes: notes || undefined,
      });
    } else {
      const signedAmount = txType === "income" ? -amt : amt;
      const numInstallments =
        txType === "expense" && accountType === "card" ? Math.max(1, parseInt(installments) || 1) : 1;

      const payload: CreateTransactionInput = {
        name: name.trim() || (txType === "income" ? "Income" : "Expense"),
        amount: signedAmount,
        date,
        category: selectedCategory!.name,
        type: txType,
        notes: notes || undefined,
        installments: numInstallments,
        ...(accountType === "card"
          ? { creditCardId: selectedCardId }
          : { bankAccountId: selectedAccountId }),
      };

      txMutation.mutate(payload);
    }
  }

  const isPending = txMutation.isPending || transferMutation.isPending;
  const showInstallments = txType === "expense" && accountType === "card";
  const activeColor = TYPE_CONFIG[txType].color;

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="arrow-back" size={18} color={colors.textSub} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Add Transaction</Text>
          </View>

          {/* Type selector */}
          <View style={s.typeSelector}>
            {(["expense", "income", "transfer"] as TxType[]).map((t) => {
              const cfg = TYPE_CONFIG[t];
              const active = txType === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    s.typeTab,
                    active && { backgroundColor: cfg.dim, borderColor: cfg.color, borderWidth: 1.5 },
                  ]}
                  onPress={() => onTypeChange(t)}
                >
                  <Text style={[s.typeTabText, active && { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Amount hero */}
          <View style={[s.amountCard, { borderColor: activeColor + "33" }]}>
            <Text style={[s.amountSign, { color: activeColor }]}>
              {txType === "income" ? "+" : txType === "expense" ? "−" : ""}
            </Text>
            <TextInput
              style={[s.amountInput, { color: activeColor }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={s.form}>
            <AuthInput
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
            />

            <AuthInput
              label="Description (optional)"
              value={name}
              onChangeText={setName}
              placeholder={txType === "transfer" ? "Transfer note…" : "What was this for?"}
            />

            {txType === "transfer" ? (
              <>
                <View style={s.section}>
                  <Text style={s.sectionLabel}>From Account</Text>
                  <AccountPills
                    items={accounts}
                    selectedId={fromAccountId}
                    disabledId={toAccountId}
                    icon="wallet-outline"
                    onSelect={setFromAccountId}
                  />
                </View>
                <View style={s.section}>
                  <Text style={s.sectionLabel}>To Account</Text>
                  <AccountPills
                    items={accounts}
                    selectedId={toAccountId}
                    disabledId={fromAccountId}
                    icon="wallet-outline"
                    onSelect={setToAccountId}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={s.section}>
                  <Text style={s.sectionLabel}>Category</Text>
                  {catsLoading ? (
                    <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
                  ) : categoriesList.length === 0 ? (
                    <Text style={s.emptyText}>No categories yet — add some in Settings.</Text>
                  ) : (
                    <View style={s.chipGrid}>
                      {categoriesList.map((cat) => {
                        const active = selectedCategory?.id === cat.id;
                        return (
                          <TouchableOpacity
                            key={cat.id}
                            style={[
                              s.categoryChip,
                              active && { borderColor: cat.color, backgroundColor: cat.color + "1a" },
                            ]}
                            onPress={() => setSelectedCategory(active ? null : cat)}
                          >
                            <View style={[s.categoryDot, { backgroundColor: cat.color }]} />
                            <Text style={[s.categoryChipText, active && { color: cat.color, fontWeight: "700" }]}>
                              {cat.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                <View style={s.section}>
                  <Text style={s.sectionLabel}>
                    {txType === "income" ? "Receive To" : "Pay With"}
                  </Text>
                  <View style={s.accountToggle}>
                    {(["card", "bank"] as const).map((key) => (
                      <TouchableOpacity
                        key={key}
                        style={[s.accountTab, accountType === key && s.accountTabActive]}
                        onPress={() => {
                          setAccountType(key);
                          if (key === "card") {
                            setSelectedCardId(cards[0]?.id ?? "");
                            setSelectedAccountId("");
                          } else {
                            setSelectedAccountId(accounts[0]?.id ?? "");
                            setSelectedCardId("");
                          }
                        }}
                      >
                        <Text style={[s.accountTabText, accountType === key && s.accountTabTextActive]}>
                          {key === "card" ? "Credit Card" : "Bank Account"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {accountType === "card" ? (
                    <AccountPills
                      items={cards}
                      selectedId={selectedCardId}
                      icon="card-outline"
                      onSelect={setSelectedCardId}
                    />
                  ) : (
                    <AccountPills
                      items={accounts}
                      selectedId={selectedAccountId}
                      icon="wallet-outline"
                      onSelect={setSelectedAccountId}
                    />
                  )}
                </View>

                {showInstallments && (
                  <AuthInput
                    label="Installments"
                    value={installments}
                    onChangeText={setInstallments}
                    placeholder="1"
                    keyboardType="number-pad"
                  />
                )}
              </>
            )}

            <AuthInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add a note…"
            />

            <AuthButton
              label={txType === "transfer" ? "Transfer" : "Add Transaction"}
              loading={isPending}
              onPress={onSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  typeSelector: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeTab: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: "center" },
  typeTabText: { fontSize: 13, fontWeight: "600", color: colors.textSub },
  amountCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  amountSign: { fontSize: 36, fontWeight: "300", marginRight: 4, lineHeight: 46 },
  amountInput: { fontSize: 40, fontWeight: "700", flex: 1, minWidth: 80 },
  form: { paddingHorizontal: 20 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSub,
    marginBottom: 8,
  },
  chipGrid: { flexDirection: "row", flexWrap: "wrap" },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  categoryChipText: { fontSize: 13, fontWeight: "500", color: colors.text },
  accountToggle: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  accountTab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  accountTabActive: { backgroundColor: colors.primary },
  accountTabText: { fontSize: 13, fontWeight: "500", color: colors.textSub },
  accountTabTextActive: { color: "#ffffff" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: { borderColor: colors.primary, backgroundColor: colors.primaryDim },
  pillDisabled: { opacity: 0.4 },
  pillText: { marginLeft: 8, fontSize: 13, fontWeight: "500", color: colors.text },
  pillTextActive: { color: colors.primary },
  emptyText: { color: colors.textMuted, fontSize: 13, paddingVertical: 8 },
});
