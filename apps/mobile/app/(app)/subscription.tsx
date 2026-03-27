import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import RevenueCatUI from "react-native-purchases-ui";

import { colors, fonts, shadow } from "../../lib/theme";
import { useSubscription, usePresentPaywall, useRestorePurchases } from "../../hooks/useSubscription";

const PLAN_DISPLAY: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  free: { label: "Free", color: colors.textMuted, icon: "lock-closed-outline" },
  trial: { label: "Free Trial", color: colors.warning, icon: "time-outline" },
  pro: { label: "Pro", color: colors.primary, icon: "star" },
  premium: { label: "Premium", color: "#8B5CF6", icon: "diamond" },
};

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { data: subscription, isLoading, refetch } = useSubscription();
  const presentPaywall = usePresentPaywall();
  const restorePurchases = useRestorePurchases();

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const plan = PLAN_DISPLAY[subscription?.planTier ?? "free"] ?? PLAN_DISPLAY.free;
  const isSubscribedViaStripe = subscription?.provider === "stripe";
  const isSubscribedViaStore = subscription?.provider === "apple" || subscription?.provider === "google";
  const hasActivePlan = subscription?.planTier === "pro" || subscription?.planTier === "premium";

  async function handleSubscribe() {
    try {
      await presentPaywall.mutateAsync();
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  }

  async function handleRestore() {
    try {
      const restored = await restorePurchases.mutateAsync();
      if (restored) {
        Alert.alert("Restored", "Your purchases have been restored successfully.");
      } else {
        Alert.alert("Nothing to Restore", "No previous purchases were found for this account.");
      }
    } catch {
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    }
  }

  async function handleManageSubscription() {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch {
      Alert.alert("Error", "Could not open subscription management.");
    }
  }

  if (isLoading) {
    return (
      <View style={[s.root, { paddingTop: insets.top }]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <LinearGradient
        colors={["#34D399", colors.primary, "#15803D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={s.headerBubble} />
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Subscription</Text>
        <Text style={s.headerSub}>Manage your plan</Text>
      </LinearGradient>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Card */}
        <View style={s.section}>
          <View style={[s.card, shadow.md]}>
            <View style={s.planRow}>
              <View style={[s.planIconWrap, { backgroundColor: `${plan.color}18` }]}>
                <Ionicons name={plan.icon} size={24} color={plan.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.planLabel}>Current Plan</Text>
                <Text style={[s.planValue, { color: plan.color }]}>{plan.label}</Text>
              </View>
              {hasActivePlan && (
                <View style={[s.badge, { backgroundColor: `${plan.color}18` }]}>
                  <Text style={[s.badgeText, { color: plan.color }]}>Active</Text>
                </View>
              )}
            </View>

            {/* Trial info */}
            {subscription?.planTier === "trial" && subscription.trialDaysRemaining !== null && (
              <View style={s.infoRow}>
                <Ionicons name="time-outline" size={16} color={colors.warning} />
                <Text style={s.infoText}>
                  {subscription.trialDaysRemaining} day{subscription.trialDaysRemaining !== 1 ? "s" : ""} remaining in your free trial
                </Text>
              </View>
            )}

            {/* Renewal info */}
            {hasActivePlan && subscription?.currentPeriodEnd && (
              <View style={s.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSub} />
                <Text style={s.infoText}>
                  {subscription.cancelAtPeriodEnd ? "Expires" : "Renews"} on{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </Text>
              </View>
            )}

            {/* Provider info */}
            {subscription?.provider && (
              <View style={s.infoRow}>
                <Ionicons
                  name={subscription.provider === "apple" ? "logo-apple" : subscription.provider === "google" ? "logo-google" : "globe-outline"}
                  size={16}
                  color={colors.textSub}
                />
                <Text style={s.infoText}>
                  Managed via {subscription.provider === "apple" ? "App Store" : subscription.provider === "google" ? "Google Play" : "Web (Stripe)"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Managed on Web notice (Stripe subscribers) */}
        {isSubscribedViaStripe && hasActivePlan && (
          <View style={s.section}>
            <View style={[s.card, s.noticeCard, shadow.sm]}>
              <Ionicons name="globe-outline" size={22} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.noticeTitle}>Managed on Web</Text>
                <Text style={s.noticeBody}>
                  Your subscription is managed through our website. Visit the web app to change or cancel your plan.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Subscribe button (only for non-subscribers) */}
        {!hasActivePlan && (
          <View style={s.section}>
            <TouchableOpacity
              style={s.subscribeBtn}
              onPress={handleSubscribe}
              disabled={presentPaywall.isPending}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primary, "#15803D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.subscribeBtnGrad}
              >
                {presentPaywall.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="star" size={20} color="#fff" />
                    <Text style={s.subscribeBtnText}>Upgrade to Pro</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Manage subscription (store subscribers) */}
        {isSubscribedViaStore && hasActivePlan && (
          <View style={s.section}>
            <TouchableOpacity
              style={[s.card, s.manageBtn, shadow.sm]}
              onPress={handleManageSubscription}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color={colors.primary} />
              <Text style={s.manageBtnText}>Manage Subscription</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Features */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>WHAT'S INCLUDED</Text>
          <View style={[s.card, shadow.sm]}>
            {[
              { icon: "card-outline" as const, label: "Unlimited credit cards", pro: true },
              { icon: "wallet-outline" as const, label: "Unlimited bank accounts", pro: true },
              { icon: "swap-horizontal-outline" as const, label: "Unlimited transactions", pro: true },
              { icon: "stats-chart-outline" as const, label: "Advanced reports & insights", pro: true },
              { icon: "notifications-outline" as const, label: "Bill reminders", pro: true },
              { icon: "download-outline" as const, label: "CSV & PDF exports", pro: true },
            ].map((feature, idx) => (
              <View key={idx} style={[s.featureRow, idx > 0 && s.featureBorder]}>
                <Ionicons
                  name={hasActivePlan || subscription?.planTier === "trial" ? "checkmark-circle" : feature.pro ? "lock-closed" : "checkmark-circle"}
                  size={18}
                  color={hasActivePlan || subscription?.planTier === "trial" ? colors.success : colors.textMuted}
                />
                <Text style={s.featureLabel}>{feature.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Restore Purchases */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.restoreBtn}
            onPress={handleRestore}
            disabled={restorePurchases.isPending}
          >
            {restorePurchases.isPending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={s.restoreBtnText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Legal Links */}
        <View style={s.section}>
          <Text style={s.legalText}>
            Subscriptions auto-renew unless canceled at least 24 hours before the end of the current period. Manage subscriptions in your device settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    overflow: "hidden",
  },
  headerBubble: {
    position: "absolute", width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.07)", top: -40, right: -30,
  },
  backBtn: { marginBottom: 12, width: 36 },
  headerTitle: { fontSize: 28, fontFamily: fonts.extrabold, color: "#fff", letterSpacing: -0.5, marginBottom: 4 },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.70)", fontFamily: fonts.medium },

  scroll: { flex: 1 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 12, fontFamily: fonts.semibold, color: colors.textMuted,
    letterSpacing: 0.8, marginBottom: 10, marginLeft: 4,
  },

  card: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 18,
  },
  planRow: { flexDirection: "row", alignItems: "center" },
  planIconWrap: {
    width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  planLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSub },
  planValue: { fontSize: 22, fontFamily: fonts.bold, marginTop: 2 },

  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 12, fontFamily: fonts.semibold },

  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 14, gap: 8 },
  infoText: { fontSize: 13, fontFamily: fonts.regular, color: colors.textSub, flex: 1 },

  noticeCard: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 16 },
  noticeTitle: { fontSize: 14, fontFamily: fonts.semibold, color: colors.text, marginBottom: 4 },
  noticeBody: { fontSize: 13, fontFamily: fonts.regular, color: colors.textSub, lineHeight: 18 },

  subscribeBtn: { borderRadius: 16, overflow: "hidden" },
  subscribeBtnGrad: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 16, gap: 10, borderRadius: 16,
  },
  subscribeBtnText: { fontSize: 17, fontFamily: fonts.bold, color: "#fff" },

  manageBtn: { flexDirection: "row", alignItems: "center", gap: 10 },
  manageBtnText: { flex: 1, fontSize: 15, fontFamily: fonts.semibold, color: colors.primary },

  featureRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  featureBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  featureLabel: { fontSize: 14, fontFamily: fonts.medium, color: colors.text, flex: 1 },

  restoreBtn: { alignItems: "center", paddingVertical: 14 },
  restoreBtnText: { fontSize: 14, fontFamily: fonts.semibold, color: colors.primary },

  legalText: {
    fontSize: 11, fontFamily: fonts.regular, color: colors.textMuted,
    textAlign: "center", lineHeight: 16, paddingHorizontal: 8,
  },
});
