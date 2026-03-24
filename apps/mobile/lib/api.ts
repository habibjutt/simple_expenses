import { configureApiClient } from "@simple-expenses/api";
import { tokenManager } from "./auth-token";
import { router } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export function initApiClient() {
  configureApiClient({
    baseUrl: API_URL,
    getToken: () => tokenManager.getToken(),
    onUnauthorized: async () => {
      await tokenManager.deleteToken();
      router.replace("/(auth)/login");
    },
  });
}
