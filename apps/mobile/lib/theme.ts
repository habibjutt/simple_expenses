// Design tokens — Friendly Finance Light Theme
// Font: Nunito (rounded, playful)  •  Palette: Green + warm cream base

export const fonts = {
  regular: "Nunito_400Regular",
  medium: "Nunito_500Medium",
  semibold: "Nunito_600SemiBold",
  bold: "Nunito_700Bold",
  extrabold: "Nunito_800ExtraBold",
};

export const colors = {
  // Backgrounds — warm cream base
  bg: "#FAF6F1",            // Warm cream
  surface: "#FFFFFF",       // Pure white cards and surfaces
  surface2: "#F3EDE6",      // Warm tint for sections / hover

  // Borders — warm-neutral instead of blue-tinted
  border: "rgba(120,110,100,0.10)",
  borderSubtle: "rgba(120,110,100,0.06)",

  // Brand / Primary — vibrant green
  primary: "#1A9E5C",
  primaryDim: "rgba(26,158,92,0.10)",
  primaryMid: "rgba(26,158,92,0.18)",

  // Semantic
  success: "#10B981",
  successDim: "rgba(16,185,129,0.10)",

  danger: "#F43F5E",
  dangerDim: "rgba(244,63,94,0.10)",

  warning: "#F59E0B",
  warningDim: "rgba(245,158,11,0.12)",

  // Text — dark green-tinted for warm harmony (WCAG AA+)
  text: "#1A2E23",          // Dark green-black — 14.2:1 on #FAF6F1 ✓
  textSub: "#5F6B64",       // Muted green-gray — 5.1:1 on #FAF6F1 ✓
  textMuted: "#9CA3AF",     // Gray-400 decorative

  // Credit card palette — vibrant friendly gradients
  cards: [
    ["#1A9E5C", "#15803D"],  // Green (brand)
    ["#06B6D4", "#0891B2"],  // Cyan
    ["#F43F5E", "#E11D48"],  // Rose
    ["#F59E0B", "#D97706"],  // Amber
    ["#3B82F6", "#2563EB"],  // Blue
    ["#8B5CF6", "#7C3AED"],  // Violet
  ] as [string, string][],
};

import { Platform } from "react-native";

export const shadow = {
  sm: Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2 },
    android: { elevation: 0 },
  })!,
  md: Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    android: { elevation: 0 },
  })!,
  card: Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    android: { elevation: 0 },
  })!,
  glow: (_color: string) => Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
    android: { elevation: 0 },
  })!,
};
