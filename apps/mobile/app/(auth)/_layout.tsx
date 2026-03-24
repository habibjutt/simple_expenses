import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { tokenManager } from "../../lib/auth-token";

export default function AuthLayout() {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    tokenManager.isAuthenticated().then((auth) => {
      setIsAuthenticated(auth);
      setChecking(false);
    });
  }, []);

  if (checking) return null;
  if (isAuthenticated) return <Redirect href="/(app)/dashboard" />;

  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Sign In", headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: "Create Account", headerShown: false }} />
      <Stack.Screen
        name="forgot-password"
        options={{ title: "Reset Password", headerShown: false }}
      />
    </Stack>
  );
}
