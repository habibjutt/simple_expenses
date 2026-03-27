import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../lib/theme";

interface AuthButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  variant?: "primary" | "ghost";
}

export default function AuthButton({ label, loading, variant = "primary", disabled, ...props }: AuthButtonProps) {
  if (variant === "ghost") {
    return (
      <TouchableOpacity style={s.ghost} disabled={disabled || loading} activeOpacity={0.7} {...props}>
        <Text style={s.ghostText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[s.wrap, (disabled || loading) && s.disabled]}
      {...props}
    >
      <LinearGradient colors={[colors.primary, "#15803D"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.gradient}>
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={s.text}>{label}</Text>
        }
      </LinearGradient>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  wrap: { borderRadius: 28, overflow: "hidden", marginTop: 8 },
  gradient: { height: 56, alignItems: "center", justifyContent: "center" },
  text: { color: "#fff", fontSize: 16, fontFamily: fonts.bold, letterSpacing: 0.3 },
  ghost: { alignItems: "center", paddingVertical: 14 },
  ghostText: { color: colors.primary, fontSize: 14, fontFamily: fonts.semibold },
  disabled: { opacity: 0.55 },
});
