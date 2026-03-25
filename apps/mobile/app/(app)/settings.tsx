import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { tokenManager } from "../../lib/auth-token";
import { colors, shadow } from "../../lib/theme";

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

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await tokenManager.deleteToken();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <LinearGradient
        colors={["#8b67ff", "#6c47ff", "#4e2ee0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={s.headerBubble} />
        <Text style={s.headerTitle}>Settings</Text>
        <Text style={s.headerSub}>Manage your account & preferences</Text>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
          <View style={s.divider} />
          <SettingsRow
            icon="wallet-outline"
            iconBg={colors.successDim}
            iconColor={colors.success}
            label="Bank Accounts"
            sublabel="View and manage accounts"
            onPress={() => router.push("/(app)/bank-accounts")}
          />
          <View style={s.divider} />
          <SettingsRow
            icon="receipt-outline"
            iconBg={colors.warningDim}
            iconColor={colors.warning}
            label="Invoices & Bills"
            sublabel="View and pay outstanding bills"
            onPress={() => router.push("/(app)/invoices")}
          />
          <View style={s.divider} />
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
          <SettingsRow
            icon="pricetag-outline"
            iconBg="rgba(245,158,11,0.12)"
            iconColor="#f59e0b"
            label="Food & Dining"
            rightEl={<View style={[s.catDot, { backgroundColor: "#f59e0b" }]} />}
          />
          <View style={s.divider} />
          <SettingsRow
            icon="car-outline"
            iconBg="rgba(59,130,246,0.10)"
            iconColor="#3b82f6"
            label="Transport"
            rightEl={<View style={[s.catDot, { backgroundColor: "#3b82f6" }]} />}
          />
          <View style={s.divider} />
          <SettingsRow
            icon="bag-outline"
            iconBg="rgba(236,72,153,0.10)"
            iconColor="#ec4899"
            label="Shopping"
            rightEl={<View style={[s.catDot, { backgroundColor: "#ec4899" }]} />}
          />
          <View style={s.divider} />
          <SettingsRow
            icon="home-outline"
            iconBg="rgba(16,185,129,0.10)"
            iconColor="#10b981"
            label="Housing & Utilities"
            rightEl={<View style={[s.catDot, { backgroundColor: "#10b981" }]} />}
          />
          <View style={s.divider} />
          <SettingsRow
            icon="medical-outline"
            iconBg="rgba(239,68,68,0.10)"
            iconColor="#ef4444"
            label="Health & Medical"
            rightEl={<View style={[s.catDot, { backgroundColor: "#ef4444" }]} />}
          />
          <View style={s.divider} />
          <SettingsRow
            icon="add-circle-outline"
            iconBg={colors.primaryDim}
            iconColor={colors.primary}
            label="Add Category"
            rightEl={<Ionicons name="add" size={20} color={colors.primary} />}
          />
        </SectionCard>

        {/* App */}
        <SectionCard title="APP">
          <SettingsRow
            icon="information-circle-outline"
            iconBg="rgba(99,102,241,0.10)"
            iconColor="#6366f1"
            label="About Simple Expenses"
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
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
  },
  headerBubble: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.07)", top: -40, right: -30 },
  headerTitle: { fontSize: 32, fontWeight: "800", color: "#fff", letterSpacing: -1, marginBottom: 4 },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.70)", fontWeight: "500" },

  scroll: { flex: 1 },

  sectionWrap: { marginTop: 28, paddingHorizontal: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: colors.textSub, letterSpacing: 1.2, marginBottom: 10, paddingLeft: 4 },
  sectionCard: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },

  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 14, fontWeight: "600", color: colors.text },
  rowSub: { fontSize: 11, color: colors.textSub, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.borderSubtle, marginLeft: 64 },

  catDot: { width: 10, height: 10, borderRadius: 5 },
  versionBadge: { fontSize: 12, fontWeight: "700", color: colors.primary, backgroundColor: colors.primaryDim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
});
