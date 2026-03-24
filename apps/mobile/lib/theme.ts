// Design tokens for the dark luxury "Obsidian Finance" theme
export const colors = {
  bg: "#070B14",
  surface: "#0D1422",
  surface2: "#121C30",
  border: "rgba(74,138,255,0.15)",
  borderSubtle: "rgba(255,255,255,0.06)",

  primary: "#4A8AFF",
  primaryDim: "rgba(74,138,255,0.15)",

  success: "#00C896",
  successDim: "rgba(0,200,150,0.15)",

  danger: "#FF4560",
  dangerDim: "rgba(255,69,96,0.15)",

  warning: "#FFB800",
  warningDim: "rgba(255,184,0,0.15)",

  text: "#EEF2FF",
  textSub: "#6B7A99",
  textMuted: "#2E3A52",

  // Credit card palette
  cards: [
    ["#0F2A6E", "#1A3A8F"],
    ["#2A0F5E", "#3D1A8F"],
    ["#0F3A2A", "#1A5E3D"],
    ["#3A0F2A", "#6E1A3D"],
    ["#0F2A3A", "#1A4A6E"],
    ["#2A1A0F", "#5E3D1A"],
  ] as [string, string][],
};

export const shadow = {
  sm: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  md: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  glow: (color: string) => ({
    elevation: 12,
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  }),
};
