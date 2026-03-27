import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { auth } from "@simple-expenses/api";
import { signupSchema, type SignupInput } from "@simple-expenses/types";
import { tokenManager } from "../../lib/auth-token";
import { loginRevenueCat } from "../../lib/revenuecat";
import AuthInput from "../../components/AuthInput";
import AuthButton from "../../components/AuthButton";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../../lib/theme";

function ControlledInput({ control, name, ...props }: Parameters<typeof AuthInput>[0] & { control: ReturnType<typeof useForm>["control"]; name: string }) {
  const { field, fieldState } = useController({ control, name });
  return <AuthInput {...props} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />;
}

export default function SignupScreen() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    try {
      const res = await auth.signup(data);
      await tokenManager.setToken(res.token);
      if (res.user?.id) {
        loginRevenueCat(res.user.id).catch((err) =>
          console.warn("RevenueCat login failed — purchases may not sync:", err)
        );
      }
      router.replace("/(app)/dashboard");
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Could not create account.");
    }
  }

  return (
    <View style={s.root}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.top}>
            <TouchableOpacity onPress={() => router.back()} style={s.back}>
              <Ionicons name="arrow-back" size={20} color={colors.textSub} />
            </TouchableOpacity>
          </View>
          <View style={s.form}>
            <Text style={s.title}>Create account</Text>
            <Text style={s.subtitle}>Start tracking your expenses</Text>

            {serverError && (
              <View style={s.errBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                <Text style={s.errText}>{serverError}</Text>
              </View>
            )}

            <View style={{ marginTop: 28 }}>
              <ControlledInput control={control} name="name" label="Full Name" placeholder="John Doe" returnKeyType="next" />
              <ControlledInput control={control} name="email" label="Email" placeholder="you@example.com" keyboardType="email-address" returnKeyType="next" />
              <ControlledInput control={control} name="password" label="Password" placeholder="Min. 8 characters" isPassword returnKeyType="done" onSubmitEditing={handleSubmit(onSubmit)} />
            </View>

            <AuthButton label="Create Account" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
            <AuthButton label="Already have an account? Sign in" variant="ghost" onPress={() => router.push("/(auth)/login")} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1 },
  top: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 24 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.borderSubtle },
  form: { flex: 1, backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.border },
  title: { fontSize: 26, fontFamily: fonts.extrabold, color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: fonts.regular, color: colors.textSub, marginTop: 4 },
  errBox: { flexDirection: "row", alignItems: "center", backgroundColor: colors.dangerDim, borderRadius: 14, padding: 12, marginTop: 16, gap: 8, borderWidth: 1, borderColor: "rgba(255,69,96,0.3)" },
  errText: { color: colors.danger, fontSize: 13, fontFamily: fonts.regular, flex: 1 },
});
