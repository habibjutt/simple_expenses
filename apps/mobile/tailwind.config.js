/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#2ecc71",
          600: "#27ae60",
          700: "#1e8449",
        },
        success: "#2ecc71",
        danger: "#ef4444",
        warning: "#f59e0b",
        // App dark surfaces
        "app-bg": "#141414",
        "app-surface": "#1e1e1e",
        "app-surface2": "#262626",
        "app-border": "#2e2e2e",
      },
    },
  },
  plugins: [],
};
