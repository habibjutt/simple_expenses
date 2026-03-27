import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { tokenManager } from "../../lib/auth-token";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, fonts, shadow } from "../../lib/theme";

function AddTabButton() {
  return (
    <TouchableOpacity
      onPress={() => router.push("/add-transaction")}
      activeOpacity={0.85}
      style={s.addWrap}
    >
      <View style={s.addShadow}>
        <LinearGradient
          colors={[colors.primary, "#15803D"]}
          style={s.addGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

export default function AppLayout() {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    tokenManager.isAuthenticated().then((auth) => {
      setIsAuthenticated(auth);
      setChecking(false);
    });
  }, []);

  if (checking) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: s.tabBar,
        tabBarLabelStyle: s.label,
        tabBarItemStyle: s.item,
        tabBarBackground: () => <View style={s.tabBg} />,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }} />
      <Tabs.Screen name="transactions" options={{ title: "Txns", tabBarIcon: ({ color, size }) => <Ionicons name="swap-horizontal" size={size} color={color} /> }} />
      <Tabs.Screen name="credit-cards" options={{ title: "", tabBarLabel: () => null, tabBarButton: () => <AddTabButton /> }} />
      <Tabs.Screen name="spending-limits" options={{ title: "Budgets", tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart" size={size} color={color} /> }} />
      <Tabs.Screen name="bank-accounts" options={{ href: null }} />
      <Tabs.Screen name="invoices" options={{ href: null }} />
      <Tabs.Screen name="goals" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    height: 80,
    paddingBottom: 12,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBg: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: { fontSize: 11, fontFamily: fonts.semibold, letterSpacing: 0.2 },
  item: { paddingTop: 8 },

  addWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
  },
  addShadow: {
    width: 56,
    height: 56,
    borderRadius: 20,
    ...shadow.glow(colors.primary),
  },
  addGrad: {
    flex: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
