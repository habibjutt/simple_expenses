// Design tokens — Light fintech theme
export const colors = {
  // Backgrounds
  bg: "#f5f5f7",            // Neutral light-gray app background (Apple system-like)
  surface: "#ffffff",       // White cards and surfaces
  surface2: "#eef1ff",      // Soft indigo tint for totals / hover rows

  // Borders
  border: "rgba(0,0,0,0.07)",      // Very soft border
  borderSubtle: "rgba(0,0,0,0.04)", // Ultra-subtle row divider

  // Brand / Primary — vibrant violet (fintech energy)
  primary: "#6c47ff",
  primaryDim: "rgba(108,71,255,0.10)",
  primaryMid: "rgba(108,71,255,0.18)",

  // Semantic
  success: "#00b896",
  successDim: "rgba(0,184,150,0.10)",

  danger: "#ff4060",
  dangerDim: "rgba(255,64,96,0.10)",

  warning: "#ff9f0a",
  warningDim: "rgba(255,159,10,0.12)",

  // Text — high contrast on light (WCAG AA+)
  text: "#0f0d2a",          // Near-black primary text
  textSub: "#7b7a8e",       // Medium gray secondary text
  textMuted: "#b8b6cc",     // Dim gray (decorative only)

  // Credit card palette — vibrant gradients
  cards: [
    ["#6c47ff", "#4527e0"],  // Brand violet
    ["#0ea5e9", "#0284c7"],  // Sky
    ["#f43f5e", "#be123c"],  // Rose
    ["#00b896", "#007a63"],  // Teal
    ["#d97706", "#b45309"],  // Amber
    ["#8b5cf6", "#7c3aed"],  // Purple
  ] as [string, string][],
};

export const shadow = {
  sm: {
    elevation: 2,
    shadowColor: "#a0aec0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  md: {
    elevation: 8,
    shadowColor: "#6c47ff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
  },
  card: {
    elevation: 3,
    shadowColor: "#a0aec0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  glow: (color: string) => ({
    elevation: 10,
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
  }),
};
