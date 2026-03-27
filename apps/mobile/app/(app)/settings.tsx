import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { tokenManager } from "../../lib/auth-token";
import { logoutRevenueCat } from "../../lib/revenuecat";
import { colors, fonts, shadow } from "../../lib/theme";
import { auth, categories as categoriesApi } from "@simple-expenses/api";
import { SUPPORTED_CURRENCIES } from "@simple-expenses/types";
import type { User, Category } from "@simple-expenses/types";

// ---------------------------------------------------------------------------
// Shared Components
// ---------------------------------------------------------------------------

function SettingsRow({
  icon, iconBg, iconColor, label, sublabel, onPress, danger, rightEl,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  danger?: boolean;
  rightEl?: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
        {sublabel && <Text style={s.rowSub}>{sublabel}</Text>}
      </View>
      {rightEl ?? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
    </TouchableOpacity>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.sectionWrap}>
      <Text style={s.sectionLabel}>{title}</Text>
      <View style={[s.sectionCard, shadow.card]}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={s.divider} />;
}

// ---------------------------------------------------------------------------
// Edit Name Modal
// ---------------------------------------------------------------------------

function EditNameModal({
  visible, currentName, onClose, onSave,
}: {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setName(currentName); }, [currentName]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return Alert.alert("Error", "Name cannot be empty");
    setSaving(true);
    try {
      await auth.updateProfile({ name: trimmed });
      onSave(trimmed);
      onClose();
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to update name");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={[s.modalCard, shadow.md]}>
          <Text style={s.modalTitle}>Edit Display Name</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoFocus
            maxLength={100}
          />
          <View style={s.modalButtons}>
            <TouchableOpacity style={s.btnCancel} onPress={onClose}>
              <Text style={s.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnPrimary} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.btnPrimaryText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Change Password Modal
// ---------------------------------------------------------------------------

function ChangePasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() { setCurrent(""); setNewPw(""); setConfirm(""); }

  async function handleSave() {
    if (!current || !newPw) return Alert.alert("Error", "All fields are required");
    if (newPw.length < 8) return Alert.alert("Error", "Password must be at least 8 characters");
    if (newPw !== confirm) return Alert.alert("Error", "Passwords don't match");
    setSaving(true);
    try {
      await auth.changePassword({ currentPassword: current, newPassword: newPw });
      Alert.alert("Success", "Password changed successfully");
      reset();
      onClose();
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { reset(); onClose(); }}>
      <View style={s.modalOverlay}>
        <View style={[s.modalCard, shadow.md]}>
          <Text style={s.modalTitle}>Change Password</Text>
          <TextInput style={s.input} value={current} onChangeText={setCurrent} placeholder="Current password" secureTextEntry autoFocus />
          <TextInput style={[s.input, { marginTop: 10 }]} value={newPw} onChangeText={setNewPw} placeholder="New password" secureTextEntry />
          <TextInput style={[s.input, { marginTop: 10 }]} value={confirm} onChangeText={setConfirm} placeholder="Confirm new password" secureTextEntry />
          <View style={s.modalButtons}>
            <TouchableOpacity style={s.btnCancel} onPress={() => { reset(); onClose(); }}>
              <Text style={s.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnPrimary} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.btnPrimaryText}>Change</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Currency Picker Modal
// ---------------------------------------------------------------------------

function CurrencyPickerModal({
  visible, current, onClose, onSelect,
}: {
  visible: boolean;
  current: string;
  onClose: () => void;
  onSelect: (code: string) => void;
}) {
  const [saving, setSaving] = useState<string | null>(null);

  async function handleSelect(code: string) {
    if (code === current) return onClose();
    setSaving(code);
    try {
      await auth.updateCurrency(code);
      onSelect(code);
      onClose();
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to update currency");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={[s.currencyCard, shadow.md]}>
          <View style={s.currencyHeader}>
            <Text style={s.modalTitle}>Preferred Currency</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.textSub} /></TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            {SUPPORTED_CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[s.currencyRow, c.code === current && s.currencyRowActive]}
                onPress={() => handleSelect(c.code)}
              >
                <Text style={[s.currencyCode, c.code === current && { color: colors.primary }]}>{c.code}</Text>
                <Text style={[s.currencyName, c.code === current && { color: colors.primary }]}>{c.name}</Text>
                {saving === c.code ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : c.code === current ? (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main Settings Screen
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<User | null>(null);
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [nameModal, setNameModal] = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const [currencyModal, setCurrencyModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [me, cats] = await Promise.all([auth.me(), categoriesApi.list()]);
      setUser(me);
      setUserCategories([...cats].sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      // ignore — will show fallbacks
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logoutRevenueCat();
          await tokenManager.deleteToken();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  async function handleDeleteCategory(cat: Category) {
    Alert.alert("Delete Category", `Delete "${cat.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await categoriesApi.delete(cat.id);
            setUserCategories((prev) => prev.filter((c) => c.id !== cat.id));
          } catch (e: unknown) {
            Alert.alert("Error", e instanceof Error ? e.message : "Failed to delete category");
          }
        },
      },
    ]);
  }

  const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    food: "restaurant-outline", transport: "car-outline", shopping: "bag-outline",
    housing: "home-outline", health: "medical-outline", entertainment: "film-outline",
    education: "school-outline", salary: "cash-outline", transfer: "swap-horizontal-outline",
  };

  function getCategoryIcon(name: string): keyof typeof Ionicons.glyphMap {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
      if (lower.includes(key)) return icon;
    }
    return "pricetag-outline";
  }

  const currencyLabel = SUPPORTED_CURRENCIES.find((c) => c.code === user?.preferredCurrency)?.name ?? user?.preferredCurrency ?? "AED";

  return (
    <View style={s.root}>
      {/* Header */}
      <LinearGradient
        colors={["#34D399", colors.primary, "#15803D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={s.headerBubble} />
        <Text style={s.headerTitle}>Settings</Text>
        <Text style={s.headerSub}>Manage your account & preferences</Text>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <SectionCard title="PROFILE">
          <SettingsRow
            icon="person-outline"
            iconBg={colors.primaryDim}
            iconColor={colors.primary}
            label={user?.name ?? "Set your name"}
            sublabel={user?.email ?? "Loading..."}
            onPress={() => setNameModal(true)}
            rightEl={<Ionicons name="create-outline" size={18} color={colors.textMuted} />}
          />
          <Divider />
          <SettingsRow
            icon="lock-closed-outline"
            iconBg="rgba(99,102,241,0.10)"
            iconColor="#6366f1"
            label="Change Password"
            sublabel="Update your account password"
            onPress={() => setPwModal(true)}
          />
        </SectionCard>

        {/* Preferences */}
        <SectionCard title="PREFERENCES">
          <SettingsRow
            icon="star-outline"
            iconBg={colors.warningDim}
            iconColor={colors.warning}
            label="Subscription"
            sublabel="Manage your plan"
            onPress={() => router.push("/(app)/subscription")}
          />
          <Divider />
          <SettingsRow
            icon="cash-outline"
            iconBg={colors.successDim}
            iconColor={colors.success}
            label="Preferred Currency"
            sublabel={`${user?.preferredCurrency ?? "AED"} — ${currencyLabel}`}
            onPress={() => setCurrencyModal(true)}
            rightEl={<Text style={s.versionBadge}>{user?.preferredCurrency ?? "AED"}</Text>}
          />
        </SectionCard>

        {/* Manage */}
        <SectionCard title="MANAGE">
          <SettingsRow
            icon="card-outline"
            iconBg={colors.primaryDim}
            iconColor={colors.primary}
            label="Credit Cards"
            sublabel="View and manage your cards"
            onPress={() => router.push("/(app)/credit-cards")}
          />
          <Divider />
          <SettingsRow
            icon="wallet-outline"
            iconBg={colors.successDim}
            iconColor={colors.success}
            label="Bank Accounts"
            sublabel="View and manage accounts"
            onPress={() => router.push("/(app)/bank-accounts")}
          />
          <Divider />
          <SettingsRow
            icon="receipt-outline"
            iconBg={colors.warningDim}
            iconColor={colors.warning}
            label="Invoices & Bills"
            sublabel="View and pay outstanding bills"
            onPress={() => router.push("/(app)/invoices")}
          />
          <Divider />
          <SettingsRow
            icon="swap-horizontal-outline"
            iconBg="rgba(99,102,241,0.10)"
            iconColor="#6366f1"
            label="Transactions"
            sublabel="Browse all transactions"
            onPress={() => router.push("/(app)/transactions")}
          />
        </SectionCard>

        {/* Categories */}
        <SectionCard title="CATEGORIES">
          {loading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : userCategories.length === 0 ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={s.rowSub}>No categories yet</Text>
            </View>
          ) : (
            userCategories.map((cat, idx) => (
              <View key={cat.id}>
                {idx > 0 && <Divider />}
                <SettingsRow
                  icon={getCategoryIcon(cat.name)}
                  iconBg={`${cat.color}18`}
                  iconColor={cat.color}
                  label={cat.name}
                  sublabel={cat.type}
                  onPress={() => handleDeleteCategory(cat)}
                  rightEl={<View style={[s.catDot, { backgroundColor: cat.color }]} />}
                />
              </View>
            ))
          )}
        </SectionCard>

        {/* App */}
        <SectionCard title="APP">
          <SettingsRow
            icon="information-circle-outline"
            iconBg="rgba(99,102,241,0.10)"
            iconColor="#6366f1"
            label="About Fixpenses"
            sublabel="Version 1.0.0"
            rightEl={<Text style={s.versionBadge}>v1.0</Text>}
          />
        </SectionCard>

        {/* Account */}
        <SectionCard title="ACCOUNT">
          <SettingsRow
            icon="log-out-outline"
            iconBg={colors.dangerDim}
            iconColor={colors.danger}
            label="Sign Out"
            sublabel="You will be returned to the login screen"
            onPress={handleLogout}
            danger
          />
        </SectionCard>
      </ScrollView>

      {/* Modals */}
      <EditNameModal
        visible={nameModal}
        currentName={user?.name ?? ""}
        onClose={() => setNameModal(false)}
        onSave={(n) => setUser((prev) => prev ? { ...prev, name: n } : prev)}
      />
      <ChangePasswordModal visible={pwModal} onClose={() => setPwModal(false)} />
      <CurrencyPickerModal
        visible={currencyModal}
        current={user?.preferredCurrency ?? "AED"}
        onClose={() => setCurrencyModal(false)}
        onSelect={(c) => setUser((prev) => prev ? { ...prev, preferredCurrency: c } : prev)}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    overflow: "hidden",
  },
  headerBubble: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.07)", top: -40, right: -30 },
  headerTitle: { fontSize: 32, fontFamily: fonts.extrabold, color: "#fff", letterSpacing: -1, marginBottom: 4 },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.70)", fontFamily: fonts.medium },

  scroll: { flex: 1 },

  sectionWrap: { marginTop: 28, paddingHorizontal: 20 },
  sectionLabel: { fontSize: 11, fontFamily: fonts.bold, color: colors.textSub, letterSpacing: 1.2, marginBottom: 10, paddingLeft: 4 },
  sectionCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },

  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 14, fontFamily: fonts.semibold, color: colors.text },
  rowSub: { fontSize: 11, fontFamily: fonts.regular, color: colors.textSub, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.borderSubtle, marginLeft: 64 },

  catDot: { width: 10, height: 10, borderRadius: 5 },
  versionBadge: { fontSize: 12, fontFamily: fonts.bold, color: colors.primary, backgroundColor: colors.primaryDim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: colors.surface, borderRadius: 26, padding: 24, width: "85%", maxWidth: 360 },
  modalTitle: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, marginBottom: 16 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20 },

  input: {
    backgroundColor: colors.bg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },

  btnCancel: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: colors.bg },
  btnCancelText: { fontSize: 15, fontFamily: fonts.semibold, color: colors.textSub },
  btnPrimary: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: colors.primary },
  btnPrimaryText: { fontSize: 15, fontFamily: fonts.semibold, color: "#fff" },

  // Currency picker
  currencyCard: { backgroundColor: colors.surface, borderRadius: 26, padding: 20, width: "90%", maxWidth: 400, maxHeight: "70%" },
  currencyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  currencyRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14, gap: 12 },
  currencyRowActive: { backgroundColor: colors.primaryDim },
  currencyCode: { fontSize: 15, fontFamily: fonts.bold, color: colors.text, width: 40 },
  currencyName: { flex: 1, fontSize: 14, fontFamily: fonts.regular, color: colors.textSub },
});

