import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { tokenManager } from "../../lib/auth-token";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

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
      <Tabs.Screen name="credit-cards" options={{ title: "Cards", tabBarIcon: ({ color, size }) => <Ionicons name="card" size={size} color={color} /> }} />
      <Tabs.Screen name="bank-accounts" options={{ title: "Accounts", tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} /> }} />
      <Tabs.Screen name="invoices" options={{ title: "Bills", tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 64,
    paddingBottom: 8,
    elevation: 0,
  },
  tabBg: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  label: { fontSize: 10, fontWeight: "600", letterSpacing: 0.4 },
  item: { paddingTop: 8 },
});
