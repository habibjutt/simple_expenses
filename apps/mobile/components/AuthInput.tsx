import { forwardRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

const AuthInput = forwardRef<TextInput, AuthInputProps>(function AuthInput(
  { label, error, isPassword, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const isSecure = isPassword && !visible;

  return (
    <View style={s.wrapper}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.row, error ? s.rowError : null]}>
        <TextInput
          ref={ref}
          style={s.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isSecure}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={colors.primary}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setVisible((v) => !v)} hitSlop={8}>
            <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSub} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={s.error}>{error}</Text>}
    </View>
  );
});

export default AuthInput;

const s = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.textSub,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 16,
    height: 52,
  },
  rowError: { borderColor: colors.danger },
  input: { flex: 1, fontSize: 15, color: colors.text, fontWeight: "500" },
  error: { fontSize: 12, color: colors.danger, marginTop: 6, marginLeft: 2 },
});
