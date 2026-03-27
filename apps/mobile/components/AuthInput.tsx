import { forwardRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../lib/theme";

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
  wrapper: { marginBottom: 18 },
  label: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.textSub,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 54,
  },
  rowError: { borderColor: colors.danger },
  input: { flex: 1, fontSize: 15, color: colors.text, fontFamily: fonts.medium },
  error: { fontSize: 12, color: colors.danger, marginTop: 6, marginLeft: 2, fontFamily: fonts.medium },
});
