// Shared category types and default data — NOT a server action file

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: string;
};

export const ICON_GROUPS: { label: string; icons: string[] }[] = [
  {
    label: "Food & Drink",
    icons: [
      "utensils",
      "pizza",
      "coffee",
      "cake",
      "beer",
      "wine",
      "cookie",
      "sandwich",
      "ice-cream",
      "fish",
      "soup",
      "salad",
    ],
  },
  {
    label: "Transport",
    icons: [
      "car",
      "plane",
      "bus",
      "train",
      "bike",
      "ship",
      "truck",
      "fuel",
      "gauge",
    ],
  },
  {
    label: "Shopping",
    icons: [
      "shopping-cart",
      "shopping-bag",
      "store",
      "package",
      "shirt",
      "gem",
      "watch",
      "glasses",
      "tag",
      "gift",
    ],
  },
  {
    label: "Health & Fitness",
    icons: [
      "heart-pulse",
      "heart",
      "pill",
      "activity",
      "thermometer",
      "stethoscope",
      "dumbbell",
      "baby",
    ],
  },
  {
    label: "Entertainment",
    icons: [
      "tv",
      "music",
      "headphones",
      "camera",
      "film",
      "gamepad-2",
      "book-open",
      "ticket",
      "trophy",
      "party-popper",
    ],
  },
  {
    label: "Home",
    icons: [
      "home",
      "sofa",
      "bed",
      "lamp",
      "wrench",
      "wifi",
      "hammer",
      "droplets",
    ],
  },
  {
    label: "Finance",
    icons: [
      "banknote",
      "wallet",
      "credit-card",
      "piggy-bank",
      "dollar-sign",
      "receipt",
      "trending-up",
      "landmark",
      "coins",
      "percent",
    ],
  },
  {
    label: "Work",
    icons: [
      "briefcase",
      "laptop",
      "phone",
      "monitor",
      "server",
      "code-2",
      "mail",
      "printer",
      "pen",
    ],
  },
  {
    label: "Personal",
    icons: [
      "sparkles",
      "scissors",
      "star",
      "bell",
      "shield",
      "lock",
      "key",
      "calendar",
      "clock",
      "user",
    ],
  },
  {
    label: "Other",
    icons: [
      "zap",
      "users",
      "repeat",
      "arrow-left-right",
      "globe",
      "map",
      "compass",
      "leaf",
      "sun",
      "moon",
      "cloud",
      "umbrella",
      "graduation-cap",
    ],
  },
];

export const PRESET_ICONS = ICON_GROUPS.flatMap((g) => g.icons);

export const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  {
    name: "Food & Dining",
    color: "#f97316",
    icon: "utensils",
    type: "expense",
  },
  {
    name: "Groceries",
    color: "#ef4444",
    icon: "shopping-cart",
    type: "expense",
  },
  { name: "Transport", color: "#3b82f6", icon: "car", type: "expense" },
  { name: "Shopping", color: "#a855f7", icon: "shopping-bag", type: "expense" },
  { name: "Health", color: "#22c55e", icon: "heart-pulse", type: "expense" },
  { name: "Entertainment", color: "#ec4899", icon: "tv", type: "expense" },
  {
    name: "Education",
    color: "#06b6d4",
    icon: "graduation-cap",
    type: "expense",
  },
  { name: "Home", color: "#84cc16", icon: "home", type: "expense" },
  { name: "Travel", color: "#14b8a6", icon: "plane", type: "expense" },
  {
    name: "Personal Care",
    color: "#f59e0b",
    icon: "sparkles",
    type: "expense",
  },
  { name: "Subscriptions", color: "#8b5cf6", icon: "repeat", type: "expense" },
  { name: "Petrol", color: "#64748b", icon: "fuel", type: "expense" },
  { name: "Utilities", color: "#0ea5e9", icon: "zap", type: "expense" },
  { name: "Family", color: "#f43f5e", icon: "users", type: "expense" },
  { name: "Gifts", color: "#d946ef", icon: "gift", type: "expense" },
  {
    name: "Investments",
    color: "#10b981",
    icon: "trending-up",
    type: "expense",
  },
  {
    name: "Debts & Loans",
    color: "#dc2626",
    icon: "landmark",
    type: "expense",
  },
  { name: "Others", color: "#9ca3af", icon: "tag", type: "expense" },
  { name: "Salary", color: "#16a34a", icon: "banknote", type: "income" },
  { name: "Freelance", color: "#2563eb", icon: "briefcase", type: "income" },
  {
    name: "Transfer",
    color: "#6b7280",
    icon: "arrow-left-right",
    type: "both",
  },
];
