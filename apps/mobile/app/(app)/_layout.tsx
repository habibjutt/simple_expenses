import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { tokenManager } from "../../lib/auth-token";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "../../lib/theme";

function AddTabButton() {
  return (
    <TouchableOpacity
      onPress={() => router.push("/add-transaction")}
      activeOpacity={0.85}
      style={s.addWrap}
    >
      <View style={s.addShadow}>
        <LinearGradient
          colors={["#8b67ff", "#4527e0"]}
          style={s.addGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={30} color="#fff" />
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
        tabBarInactiveTintColor: colors.textSub,
        tabBarStyle: s.tabBar,
        tabBarLabelStyle: s.label,
        tabBarItemStyle: s.item,
        tabBarBackground: () => <View style={s.tabBg} />,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }} />
      <Tabs.Screen name="transactions" options={{ title: "Txns", tabBarIcon: ({ color, size }) => <Ionicons name="swap-horizontal" size={size} color={color} /> }} />
      <Tabs.Screen name="credit-cards" options={{ title: "", tabBarLabel: () => null, tabBarButton: () => <AddTabButton /> }} />
      <Tabs.Screen name="bank-accounts" options={{ title: "Accounts", tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} /> }} />
      <Tabs.Screen name="invoices" options={{ href: null }} />
      <Tabs.Screen name="goals" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="spending-limits" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 76,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: "#a0aec0",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabBg: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  label: { fontSize: 10, fontWeight: "600", letterSpacing: 0.4 },
  item: { paddingTop: 8 },

  // ── Center + button
  addWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  addShadow: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.primary,
    elevation: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  addGrad: {
    flex: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
