import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { auth } from "@simple-expenses/api";
import { Ionicons } from "@expo/vector-icons";
import AuthInput from "../../components/AuthInput";
import AuthButton from "../../components/AuthButton";
import { colors } from "../../lib/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!email.trim()) { setError("Email is required"); return; }
    setLoading(true); setError(null);
    try { await auth.forgotPassword(email.trim()); setSent(true); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
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
            {sent ? (
              <View style={s.successBox}>
                <View style={s.successIcon}><Ionicons name="checkmark-circle" size={40} color={colors.success} /></View>
                <Text style={s.successTitle}>Check your email</Text>
                <Text style={s.successSub}>We sent a reset link to {email}</Text>
                <AuthButton label="Back to Sign In" onPress={() => router.replace("/(auth)/login")} />
              </View>
            ) : (
              <>
                <Text style={s.title}>Forgot password?</Text>
                <Text style={s.subtitle}>We will send you a reset link</Text>
                {error && (
                  <View style={s.errBox}>
                    <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                    <Text style={s.errText}>{error}</Text>
                  </View>
                )}
                <View style={{ marginTop: 28 }}>
                  <AuthInput label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" returnKeyType="done" onSubmitEditing={onSubmit} />
                </View>
                <AuthButton label="Send Reset Link" loading={loading} onPress={onSubmit} />
                <AuthButton label="Back to Sign In" variant="ghost" onPress={() => router.back()} />
              </>
            )}
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
  title: { fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSub, marginTop: 4 },
  errBox: { flexDirection: "row", alignItems: "center", backgroundColor: colors.dangerDim, borderRadius: 12, padding: 12, marginTop: 16, gap: 8, borderWidth: 1, borderColor: "rgba(255,69,96,0.3)" },
  errText: { color: colors.danger, fontSize: 13, flex: 1 },
  successBox: { alignItems: "center", paddingTop: 40, gap: 12 },
  successIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.successDim, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { fontSize: 22, fontWeight: "800", color: colors.text },
  successSub: { fontSize: 14, color: colors.textSub, textAlign: "center", lineHeight: 20, marginBottom: 24 },
});
