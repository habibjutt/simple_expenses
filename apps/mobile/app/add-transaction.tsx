import { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import {
  transactions as txApi,
  creditCards,
  bankAccounts,
  categories as categoriesApi,
  type TransferInput,
} from "@simple-expenses/api";
import type { BankAccount, CreditCard, Category, CreateTransactionInput } from "@simple-expenses/types";
import { formatCurrency } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import AuthButton from "../components/AuthButton";
import { colors, fonts, shadow } from "../lib/theme";

type TxType = "expense" | "income" | "transfer";

const TYPE_CONFIG: Record<TxType, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; dim: string }> = {
  expense:  { label: "Expense",  icon: "arrow-up-circle",   color: colors.danger,  dim: colors.dangerDim },
  income:   { label: "Income",   icon: "arrow-down-circle",  color: colors.success, dim: colors.successDim },
  transfer: { label: "Transfer", icon: "swap-horizontal-outline", color: "#0ea5e9", dim: "rgba(14,165,233,0.10)" },
};

/* ── Dropdown Selector Component ─────────────────────────────── */

type DropdownItem = { id: string; name: string; color?: string; subtitle?: string };

function DropdownField({
  label,
  placeholder,
  items,
  selectedId,
  disabledId,
  icon,
  onSelect,
  renderLeft,
}: {
  label: string;
  placeholder: string;
  items: DropdownItem[];
  selectedId: string;
  disabledId?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onSelect: (id: string) => void;
  renderLeft?: (item: DropdownItem) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === selectedId);

  return (
    <>
      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>{label}</Text>
        <TouchableOpacity
          style={[s.dropdown, selected && s.dropdownSelected]}
          onPress={() => setOpen(true)}
          activeOpacity={0.7}
        >
          {selected ? (
            <View style={s.dropdownContent}>
              {renderLeft?.(selected)}
              <Text style={s.dropdownValue} numberOfLines={1}>{selected.name}</Text>
            </View>
          ) : (
            <Text style={s.dropdownPlaceholder}>{placeholder}</Text>
          )}
          <Ionicons name="chevron-down" size={18} color={colors.textSub} />
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>{label}</Text>
            {items.length === 0 ? (
              <Text style={s.emptyText}>No items available</Text>
            ) : (
              <FlatList
                data={items}
                keyExtractor={(i) => i.id}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 340 }}
                renderItem={({ item }) => {
                  const isActive = selectedId === item.id;
                  const isDisabled = disabledId === item.id;
                  return (
                    <TouchableOpacity
                      style={[s.modalItem, isActive && s.modalItemActive, isDisabled && s.modalItemDisabled]}
                      onPress={() => { if (!isDisabled) { onSelect(item.id); setOpen(false); } }}
                      disabled={isDisabled}
                      activeOpacity={0.6}
                    >
                      {icon && (
                        <View style={[s.modalItemIcon, { backgroundColor: isActive ? colors.primaryDim : colors.surface2 }]}>
                          <Ionicons name={icon} size={18} color={isActive ? colors.primary : colors.textSub} />
                        </View>
                      )}
                      {renderLeft && !icon && renderLeft(item)}
                      <View style={{ flex: 1 }}>
                        <Text style={[s.modalItemText, isActive && s.modalItemTextActive]}>{item.name}</Text>
                        {item.subtitle && <Text style={s.modalItemSub}>{item.subtitle}</Text>}
                      </View>
                      {isActive && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

/* ── Main Screen ─────────────────────────────────────────────── */

export default function AddTransactionScreen() {
  const qc = useQueryClient();

  const [txType, setTxType] = useState<TxType>("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [accountType, setAccountType] = useState<"card" | "bank">("card");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [installments, setInstallments] = useState("1");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: cards = [] } = useQuery<CreditCard[]>({
    queryKey: ["credit-cards"],
    queryFn: () => creditCards.list(),
    select: (d) => [...d].sort((a, b) => a.name.localeCompare(b.name)),
  });

  const { data: accounts = [] } = useQuery<BankAccount[]>({
    queryKey: ["bank-accounts"],
    queryFn: () => bankAccounts.list(),
    select: (d) => [...d].sort((a, b) => a.name.localeCompare(b.name)),
  });

  const { data: categoriesList = [], isLoading: catsLoading } = useQuery<Category[]>({
    queryKey: ["categories", txType],
    queryFn: () => categoriesApi.list(txType),
    enabled: txType !== "transfer",
    select: (d) => [...d].sort((a, b) => a.name.localeCompare(b.name)),
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

  const categoryItems = useMemo<DropdownItem[]>(
    () => categoriesList.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    [categoriesList],
  );

  const cardItems = useMemo<DropdownItem[]>(
    () => cards.map((c) => ({ id: c.id, name: c.name, subtitle: `Avail: ${formatCurrency(c.availableBalance, c.currency)}` })),
    [cards],
  );

  const accountItems = useMemo<DropdownItem[]>(
    () => accounts.map((a) => ({ id: a.id, name: a.name, subtitle: `Bal: ${formatCurrency(a.currentBalance, a.currency)}` })),
    [accounts],
  );

  const selectedCategory = categoriesList.find((c) => c.id === selectedCategoryId) ?? null;

  function onTypeChange(type: TxType) {
    setTxType(type);
    setSelectedCategoryId("");
    if (type === "transfer") {
      setFromAccountId(accounts[0]?.id ?? "");
      setToAccountId(accounts[1]?.id ?? "");
    }
  }

  const dateStr = date.toISOString().slice(0, 10);

  function validate(): string | null {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) return "Please enter a valid amount";
    if (txType === "transfer") {
      if (!fromAccountId) return "Please select a source account";
      if (!toAccountId) return "Please select a destination account";
      if (fromAccountId === toAccountId) return "Source and destination must be different";
    } else {
      if (!selectedCategoryId) return "Please select a category";
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
        date: dateStr,
        notes: notes || undefined,
      });
    } else {
      const signedAmount = txType === "income" ? -amt : amt;
      const numInstallments =
        txType === "expense" && accountType === "card" ? Math.max(1, parseInt(installments) || 1) : 1;

      const payload: CreateTransactionInput = {
        name: name.trim() || (txType === "income" ? "Income" : "Expense"),
        amount: signedAmount,
        date: dateStr,
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
              <Ionicons name="arrow-back" size={18} color={colors.primary} />
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
                  activeOpacity={0.7}
                >
                  <Ionicons name={cfg.icon} size={16} color={active ? cfg.color : colors.textMuted} style={{ marginBottom: 2 }} />
                  <Text style={[s.typeTabText, active && { color: cfg.color, fontFamily: fonts.bold }]}>
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
            {/* Date picker */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Date</Text>
              <TouchableOpacity
                style={s.dropdown}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={s.dropdownValue}>
                  {date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.textSub} />
              </TouchableOpacity>
            </View>

            {/* Date picker modal (Android) / inline (iOS) */}
            {showDatePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={date}
                mode="date"
                display="calendar"
                onChange={(_, selected) => {
                  setShowDatePicker(false);
                  if (selected) setDate(selected);
                }}
              />
            )}
            {showDatePicker && Platform.OS === "ios" && (
              <Modal transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
                <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
                  <View style={s.modalSheet}>
                    <View style={s.modalHandle} />
                    <View style={s.datePickerHeader}>
                      <Text style={s.modalTitle}>Select Date</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={s.dateDoneBtn}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="inline"
                      onChange={(_, selected) => { if (selected) setDate(selected); }}
                      style={{ alignSelf: "center" }}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            )}
            {showDatePicker && Platform.OS === "web" && (
              <Modal transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
                  <View style={[s.modalSheet, { alignItems: "center" }]}>
                    <View style={s.modalHandle} />
                    <Text style={s.modalTitle}>Select Date</Text>
                    <input
                      type="date"
                      value={dateStr}
                      onChange={(e) => {
                        const d = new Date(e.target.value + "T00:00:00");
                        if (!isNaN(d.getTime())) setDate(d);
                      }}
                      style={{
                        fontSize: 18, padding: 12, borderRadius: 12,
                        border: `1px solid ${colors.border}`, marginVertical: 16,
                        fontFamily: "Nunito", width: "90%",
                      }}
                    />
                    <TouchableOpacity
                      style={s.webDateDone}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={s.webDateDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            )}

            {/* Description */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Description (optional)</Text>
              <View style={s.inputRow}>
                <Ionicons name="create-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={s.inputField}
                  value={name}
                  onChangeText={setName}
                  placeholder={txType === "transfer" ? "Transfer note…" : "What was this for?"}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {txType === "transfer" ? (
              <>
                <DropdownField
                  label="From Account"
                  placeholder="Select source account"
                  items={accountItems}
                  selectedId={fromAccountId}
                  disabledId={toAccountId}
                  icon="wallet-outline"
                  onSelect={setFromAccountId}
                />
                <DropdownField
                  label="To Account"
                  placeholder="Select destination account"
                  items={accountItems}
                  selectedId={toAccountId}
                  disabledId={fromAccountId}
                  icon="wallet-outline"
                  onSelect={setToAccountId}
                />
              </>
            ) : (
              <>
                {/* Category dropdown */}
                {catsLoading ? (
                  <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
                ) : (
                  <DropdownField
                    label="Category"
                    placeholder="Select a category"
                    items={categoryItems}
                    selectedId={selectedCategoryId}
                    onSelect={setSelectedCategoryId}
                    renderLeft={(item) => (
                      <View style={[s.catDot, { backgroundColor: item.color ?? colors.primary }]} />
                    )}
                  />
                )}

                {/* Account type toggle + dropdown */}
                <View style={s.fieldWrap}>
                  <Text style={s.fieldLabel}>{txType === "income" ? "Receive To" : "Pay With"}</Text>
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
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={key === "card" ? "card-outline" : "wallet-outline"}
                          size={16}
                          color={accountType === key ? "#fff" : colors.textSub}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[s.accountTabText, accountType === key && s.accountTabTextActive]}>
                          {key === "card" ? "Card" : "Bank"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {accountType === "card" ? (
                  <DropdownField
                    label="Credit Card"
                    placeholder="Select a card"
                    items={cardItems}
                    selectedId={selectedCardId}
                    icon="card-outline"
                    onSelect={setSelectedCardId}
                  />
                ) : (
                  <DropdownField
                    label="Bank Account"
                    placeholder="Select an account"
                    items={accountItems}
                    selectedId={selectedAccountId}
                    icon="wallet-outline"
                    onSelect={setSelectedAccountId}
                  />
                )}
              </>
            )}

            {/* Advanced section (collapsible) */}
            <TouchableOpacity
              style={s.advancedToggle}
              onPress={() => setShowAdvanced(!showAdvanced)}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={18} color={colors.textSub} />
              <Text style={s.advancedToggleText}>Advanced Options</Text>
              <Ionicons
                name={showAdvanced ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.textSub}
              />
            </TouchableOpacity>

            {showAdvanced && (
              <View style={s.advancedBody}>
                {showInstallments && (
                  <View style={s.fieldWrap}>
                    <Text style={s.fieldLabel}>Installments</Text>
                    <View style={s.inputRow}>
                      <Ionicons name="layers-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                      <TextInput
                        style={s.inputField}
                        value={installments}
                        onChangeText={setInstallments}
                        placeholder="1"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                )}

                <View style={s.fieldWrap}>
                  <Text style={s.fieldLabel}>Notes (optional)</Text>
                  <View style={[s.inputRow, { minHeight: 80, alignItems: "flex-start", paddingTop: 14 }]}>
                    <Ionicons name="document-text-outline" size={18} color={colors.textMuted} style={{ marginRight: 10, marginTop: 2 }} />
                    <TextInput
                      style={[s.inputField, { minHeight: 60 }]}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Add a note…"
                      placeholderTextColor={colors.textMuted}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={{ marginTop: 24 }}>
              <AuthButton
                label={txType === "transfer" ? "Transfer" : "Add Transaction"}
                loading={isPending}
                onPress={onSubmit}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 20,
    backgroundColor: colors.primaryDim,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontFamily: fonts.bold, color: colors.text },

  /* Type selector */
  typeSelector: {
    flexDirection: "row", marginHorizontal: 20, marginBottom: 16,
    backgroundColor: colors.surface, borderRadius: 18, padding: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  typeTab: {
    flex: 1, paddingVertical: 10, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  typeTabText: { fontSize: 12, fontFamily: fonts.semibold, color: colors.textSub },

  /* Amount */
  amountCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1.5,
    paddingVertical: 20, paddingHorizontal: 16,
  },
  amountSign: { fontSize: 36, fontFamily: fonts.regular, marginRight: 4, lineHeight: 46 },
  amountInput: { fontSize: 40, fontFamily: fonts.bold, flex: 1, minWidth: 80 },

  /* Form */
  form: { paddingHorizontal: 20 },

  /* Field wrapper */
  fieldWrap: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 12, fontFamily: fonts.bold, letterSpacing: 0.5,
    textTransform: "uppercase", color: colors.textSub, marginBottom: 6,
  },

  /* Dropdown selector */
  dropdown: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  dropdownSelected: { borderColor: colors.primary + "44" },
  dropdownContent: { flex: 1, flexDirection: "row", alignItems: "center" },
  dropdownValue: { flex: 1, fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
  dropdownPlaceholder: { flex: 1, fontSize: 14, fontFamily: fonts.regular, color: colors.textMuted },

  /* Input row */
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  inputField: { flex: 1, fontSize: 15, fontFamily: fonts.regular, color: colors.text, padding: 0 },

  /* Category dot */
  catDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },

  /* Account toggle */
  accountToggle: {
    flexDirection: "row", backgroundColor: colors.surface,
    borderRadius: 14, padding: 4, borderWidth: 1, borderColor: colors.border,
  },
  accountTab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: "center", flexDirection: "row", justifyContent: "center",
  },
  accountTabActive: { backgroundColor: colors.primary },
  accountTabText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.textSub },
  accountTabTextActive: { color: "#fff" },

  /* Advanced toggle */
  advancedToggle: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, marginTop: 4,
    borderTopWidth: 1, borderTopColor: colors.border,
    gap: 8,
  },
  advancedToggleText: { flex: 1, fontSize: 14, fontFamily: fonts.semibold, color: colors.textSub },
  advancedBody: { paddingTop: 4 },

  /* Modal / Bottom sheet */
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.textMuted, alignSelf: "center", marginBottom: 16, opacity: 0.4,
  },
  modalTitle: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, marginBottom: 16 },
  modalItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: 14, marginBottom: 4,
  },
  modalItemActive: { backgroundColor: colors.primaryDim },
  modalItemDisabled: { opacity: 0.35 },
  modalItemIcon: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  modalItemText: { fontSize: 15, fontFamily: fonts.medium, color: colors.text },
  modalItemTextActive: { fontFamily: fonts.bold, color: colors.primary },
  modalItemSub: { fontSize: 12, fontFamily: fonts.regular, color: colors.textSub, marginTop: 1 },

  /* Date picker iOS */
  datePickerHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8,
  },
  dateDoneBtn: { fontSize: 16, fontFamily: fonts.bold, color: colors.primary },

  /* Web date fallback */
  webDateDone: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 32, marginBottom: 8,
  },
  webDateDoneText: { color: "#fff", fontSize: 15, fontFamily: fonts.bold },

  emptyText: { color: colors.textMuted, fontSize: 13, fontFamily: fonts.regular, paddingVertical: 12, textAlign: "center" },
});
