import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { auth } from "@simple-expenses/api";
import { loginSchema, type LoginInput } from "@simple-expenses/types";
import { tokenManager } from "../../lib/auth-token";
import { loginRevenueCat } from "../../lib/revenuecat";
import AuthInput from "../../components/AuthInput";
import AuthButton from "../../components/AuthButton";
import { useState } from "react";
import { colors, fonts } from "../../lib/theme";
import { Ionicons } from "@expo/vector-icons";

function ControlledInput({ control, name, ...props }: Parameters<typeof AuthInput>[0] & { control: ReturnType<typeof useForm>["control"]; name: string }) {
  const { field, fieldState } = useController({ control, name });
  return <AuthInput {...props} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />;
}

export default function LoginScreen() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    try {
      const response = await auth.login(data);
      await tokenManager.setToken(response.token);
      if (response.user?.id) {
        loginRevenueCat(response.user.id).catch((err) =>
          console.warn("RevenueCat login failed — purchases may not sync:", err)
        );
      }
      router.replace("/(app)/dashboard");
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Invalid email or password.");
    }
  }

  return (
    <View style={s.root}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={s.hero}>
            <View style={s.logoRing}>
              <LinearGradient colors={[colors.primary, "#15803D"]} style={s.logoGrad}>
                <Ionicons name="wallet" size={28} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={s.appName}>Fixpenses</Text>
            <Text style={s.tagline}>Your finances, beautifully tracked</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.subtitle}>Sign in to continue</Text>

            {serverError && (
              <View style={s.errBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                <Text style={s.errText}>{serverError}</Text>
              </View>
            )}

            <View style={{ marginTop: 28 }}>
              <ControlledInput control={control} name="email" label="Email" placeholder="you@example.com" keyboardType="email-address" returnKeyType="next" />
              <ControlledInput control={control} name="password" label="Password" placeholder="••••••••" isPassword returnKeyType="done" onSubmitEditing={handleSubmit(onSubmit)} />
            </View>

            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")} style={s.forgot}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <AuthButton label="Sign In" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />

            <View style={s.divider}>
              <View style={s.line} />
              <Text style={s.divText}>or</Text>
              <View style={s.line} />
            </View>

            <AuthButton label="Create an account" variant="ghost" onPress={() => router.push("/(auth)/signup")} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1 },
  hero: { alignItems: "center", paddingTop: 72, paddingBottom: 40 },
  logoRing: { width: 80, height: 80, borderRadius: 24, overflow: "hidden", marginBottom: 20, borderWidth: 1.5, borderColor: "rgba(99,102,241,0.25)" },
  logoGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
  appName: { fontSize: 24, fontFamily: fonts.extrabold, color: colors.text, letterSpacing: -0.5 },
  tagline: { fontSize: 14, fontFamily: fonts.medium, color: colors.textSub, marginTop: 6 },
  form: { flex: 1, backgroundColor: colors.surface, borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.border },
  title: { fontSize: 28, fontFamily: fonts.extrabold, color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: fonts.medium, color: colors.textSub, marginTop: 4 },
  errBox: { flexDirection: "row", alignItems: "center", backgroundColor: colors.dangerDim, borderRadius: 14, padding: 14, marginTop: 16, gap: 8, borderWidth: 1, borderColor: "rgba(244,63,94,0.2)" },
  errText: { color: colors.danger, fontSize: 13, flex: 1, fontFamily: fonts.medium },
  forgot: { alignSelf: "flex-end", marginTop: -4, marginBottom: 20 },
  forgotText: { color: colors.primary, fontSize: 13, fontFamily: fonts.semibold },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.borderSubtle },
  divText: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.medium, marginHorizontal: 16 },
});
