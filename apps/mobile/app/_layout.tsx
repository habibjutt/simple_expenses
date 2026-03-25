import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { initApiClient } from "../lib/api";
import { colors } from "../lib/theme";

initApiClient();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, gcTime: 1000 * 60 * 5, retry: 1 },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="add-transaction" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
          </Stack>
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
