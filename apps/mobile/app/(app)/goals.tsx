import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goals } from "@simple-expenses/api";
import { formatCurrency } from "@simple-expenses/utils";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, shadow } from "../../lib/theme";
import type { SavingsGoal } from "@simple-expenses/types";

const PRESET_COLORS = [
  "#6c47ff",
  "#0ea5e9",
  "#f43f5e",
  "#00b896",
  "#d97706",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
];

// ---------------------------------------------------------------------------
// Create-goal modal
// ---------------------------------------------------------------------------
function CreateGoalModal({
  visible,
  onClose,
  onSubmit,
  isPending,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: { name: string; targetAmount: number; color: string; deadline?: string }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [deadline, setDeadline] = useState("");

  function reset() {
    setName("");
    setTarget("");
    setColor(PRESET_COLORS[0]);
    setDeadline("");
  }

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) { Alert.alert("Validation", "Name is required."); return; }
    const amount = parseFloat(target);
    if (!amount || amount <= 0) { Alert.alert("Validation", "Target amount must be positive."); return; }
    const payload: { name: string; targetAmount: number; color: string; deadline?: string } = {
      name: trimmed,
      targetAmount: amount,
      color,
    };
    if (deadline.trim()) payload.deadline = deadline.trim();
    onSubmit(payload);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.modalOverlay}
      >
        <View style={s.modalCard}>
          {/* Header */}
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>New Goal</Text>
            <TouchableOpacity
              onPress={() => { reset(); onClose(); }}
              hitSlop={12}
            >
              <Ionicons name="close" size={22} color={colors.textSub} />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text style={s.label}>Name</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Emergency Fund"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          {/* Target amount */}
          <Text style={s.label}>Target Amount</Text>
          <TextInput
            style={s.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={target}
            onChangeText={setTarget}
          />

          {/* Color */}
          <Text style={s.label}>Color</Text>
          <View style={s.colorRow}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  s.colorDot,
                  { backgroundColor: c },
                  c === color && s.colorDotActive,
                ]}
              />
            ))}
          </View>

          {/* Deadline */}
          <Text style={s.label}>Deadline (optional)</Text>
          <TextInput
            style={s.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            value={deadline}
            onChangeText={setDeadline}
          />

          {/* Submit */}
          <TouchableOpacity
            style={[s.submitBtn, isPending && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={isPending}
          >
            <LinearGradient colors={[colors.primary, "#4527e0"]} style={s.submitGrad}>
              <Text style={s.submitText}>{isPending ? "Creating…" : "Create Goal"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Contribute modal
// ---------------------------------------------------------------------------
function ContributeModal({
  goal,
  onClose,
  onSubmit,
  isPending,
}: {
  goal: SavingsGoal | null;
  onClose: () => void;
  onSubmit: (id: string, amount: number) => void;
  isPending: boolean;
}) {
  const [amount, setAmount] = useState("");

  function handleSubmit() {
    if (!goal) return;
    const val = parseFloat(amount);
    if (!val || val <= 0) { Alert.alert("Validation", "Amount must be positive."); return; }
    onSubmit(goal.id, val);
  }

  return (
    <Modal visible={!!goal} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.modalOverlay}
      >
        <View style={[s.modalCard, { paddingBottom: 24 }]}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add to "{goal?.name}"</Text>
            <TouchableOpacity onPress={() => { setAmount(""); onClose(); }} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.textSub} />
            </TouchableOpacity>
          </View>

          {goal && (
            <Text style={s.contributeHint}>
              {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)} saved
            </Text>
          )}

          <Text style={s.label}>Amount</Text>
          <TextInput
            style={s.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />

          <TouchableOpacity
            style={[s.submitBtn, isPending && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={isPending}
          >
            <LinearGradient colors={[colors.success, "#007a63"]} style={s.submitGrad}>
              <Text style={s.submitText}>{isPending ? "Saving…" : "Contribute"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Goal card
// ---------------------------------------------------------------------------
function GoalCard({
  goal,
  onContribute,
  onDelete,
}: {
  goal: SavingsGoal;
  onContribute: () => void;
  onDelete: () => void;
}) {
  const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const completed = goal.isCompleted || pct >= 100;

  return (
    <View style={[s.card, completed && s.cardCompleted]}>
      {/* Top row: color dot + name + badge */}
      <View style={s.cardTop}>
        <View style={[s.goalDot, { backgroundColor: goal.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={s.goalName}>{goal.name}</Text>
          {goal.deadline && (
            <Text style={s.goalDeadline}>
              <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />{" "}
              {goal.deadline}
            </Text>
          )}
        </View>
        {completed ? (
          <View style={[s.badge, { backgroundColor: colors.successDim }]}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={[s.badgeText, { color: colors.success }]}>Done</Text>
          </View>
        ) : (
          <Text style={s.pctText}>{Math.round(pct)}%</Text>
        )}
      </View>

      {/* Progress bar */}
      <View style={s.progressTrack}>
        <View
          style={[
            s.progressFill,
            {
              width: `${pct}%` as unknown as number,
              backgroundColor: completed ? colors.success : goal.color,
            },
          ]}
        />
      </View>

      {/* Amounts */}
      <View style={s.amountRow}>
        <Text style={s.amountCurrent}>{formatCurrency(goal.currentAmount)}</Text>
        <Text style={s.amountTarget}>/ {formatCurrency(goal.targetAmount)}</Text>
      </View>

      {/* Actions */}
      <View style={s.actionRow}>
        {!completed && (
          <TouchableOpacity style={s.contributeBtn} onPress={onContribute}>
            <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
            <Text style={s.contributeBtnText}>Contribute</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={s.deleteBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={15} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function GoalsScreen() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);

  useFocusEffect(
    useCallback(() => {
      qc.invalidateQueries({ queryKey: ["goals"] });
    }, [qc]),
  );

  const { data = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => goals.list(),
  });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; targetAmount: number; color: string; deadline?: string }) =>
      goals.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      setShowCreate(false);
    },
    onError: (e: Error) => Alert.alert("Error", e.message),
  });

  const contributeMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => goals.contribute(id, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      setContributeGoal(null);
    },
    onError: (e: Error) => Alert.alert("Error", e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goals.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
    onError: (e: Error) => Alert.alert("Error", e.message),
  });

  function confirmDelete(id: string, name: string) {
    Alert.alert("Delete", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(id) },
    ]);
  }

  const completed = data.filter((g) => g.isCompleted || g.currentAmount >= g.targetAmount);
  const inProgress = data.filter((g) => !g.isCompleted && g.currentAmount < g.targetAmount);
  const sorted = [...inProgress, ...completed];

  return (
    <View style={s.root}>
      {/* Header */}
      <SafeAreaView style={{ backgroundColor: colors.surface }} edges={["top"]}>
        <View style={s.header}>
          <Text style={s.title}>Goals</Text>
          <Text style={s.sub}>
            {data.length} goal{data.length !== 1 ? "s" : ""}
            {completed.length > 0 ? ` · ${completed.length} completed` : ""}
          </Text>
        </View>
      </SafeAreaView>

      {/* List */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="flag-outline" size={40} color={colors.textMuted} />
            <Text style={s.emptyTitle}>No goals yet</Text>
            <Text style={s.emptyText}>Tap + to create your first savings goal</Text>
          </View>
        }
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            onContribute={() => setContributeGoal(item)}
            onDelete={() => confirmDelete(item.id, item.name)}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => setShowCreate(true)}>
        <LinearGradient colors={[colors.primary, "#4527e0"]} style={s.fabGrad}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Create modal */}
      <CreateGoalModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(input) => createMutation.mutate(input)}
        isPending={createMutation.isPending}
      />

      {/* Contribute modal */}
      <ContributeModal
        goal={contributeGoal}
        onClose={() => setContributeGoal(null)}
        onSubmit={(id, amount) => contributeMutation.mutate({ id, amount })}
        isPending={contributeMutation.isPending}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: colors.textSub, marginTop: 2 },

  // List
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardCompleted: { borderColor: colors.success, borderWidth: 1, opacity: 0.85 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  goalDot: { width: 10, height: 10, borderRadius: 5 },
  goalName: { fontSize: 15, fontWeight: "700", color: colors.text },
  goalDeadline: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  pctText: { fontSize: 13, fontWeight: "800", color: colors.primary },

  // Progress bar
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderSubtle,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: 8, borderRadius: 4 },

  // Amounts
  amountRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 10 },
  amountCurrent: { fontSize: 16, fontWeight: "800", color: colors.text },
  amountTarget: { fontSize: 13, fontWeight: "500", color: colors.textSub },

  // Card actions
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  contributeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  contributeBtnText: { fontSize: 13, fontWeight: "600", color: colors.primary },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.dangerDim,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  emptyText: { color: colors.textSub, fontSize: 13 },

  // FAB
  fab: {
    position: "absolute",
    bottom: 80,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    overflow: "hidden",
    ...shadow.glow(colors.primary),
  },
  fabGrad: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Modal shared
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text },

  // Form
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSub,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 4 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: { borderWidth: 3, borderColor: colors.text },
  contributeHint: { fontSize: 13, color: colors.textSub, marginBottom: 4 },

  // Submit button
  submitBtn: { marginTop: 20, borderRadius: 14, overflow: "hidden" },
  submitGrad: { paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
