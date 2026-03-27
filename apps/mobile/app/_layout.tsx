import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { initApiClient } from "../lib/api";
import { initRevenueCat } from "../lib/revenuecat";
import { colors } from "../lib/theme";
import SplashScreenView from "../components/SplashScreen";

try { SplashScreen.preventAutoHideAsync(); } catch {}

initApiClient();
initRevenueCat();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, gcTime: 1000 * 60 * 5, retry: 1 },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="add-transaction" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
          </Stack>
          {showSplash && <SplashScreenView onFinish={handleSplashFinish} />}
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
