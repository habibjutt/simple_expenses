import { getApiUser, api } from "@/lib/api-auth";
import { db } from "@/lib/db";

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", icon: "🍽️", color: "#FF6B6B", type: "expense" },
  { name: "Transportation", icon: "🚗", color: "#4ECDC4", type: "expense" },
  { name: "Shopping", icon: "🛍️", color: "#45B7D1", type: "expense" },
  { name: "Entertainment", icon: "🎮", color: "#96CEB4", type: "expense" },
  { name: "Healthcare", icon: "🏥", color: "#FFEAA7", type: "expense" },
  { name: "Housing", icon: "🏠", color: "#DDA0DD", type: "expense" },
  { name: "Education", icon: "📚", color: "#98D8C8", type: "expense" },
  { name: "Travel", icon: "✈️", color: "#F7DC6F", type: "expense" },
  { name: "Utilities", icon: "💡", color: "#82E0AA", type: "expense" },
  { name: "Personal Care", icon: "💆", color: "#F1948A", type: "expense" },
  { name: "Salary", icon: "💰", color: "#58D68D", type: "income" },
  { name: "Freelance", icon: "💻", color: "#5DADE2", type: "income" },
  { name: "Investment", icon: "📈", color: "#A569BD", type: "income" },
  { name: "Gift", icon: "🎁", color: "#F0B27A", type: "both" },
  { name: "Other", icon: "📦", color: "#BDC3C7", type: "both" },
];

// POST /api/v1/categories/seed
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const existing = await db.category.count({ where: { userId: user.id } });
  if (existing > 0)
    return api.badRequest("Categories already exist. Delete all before seeding.");

  const categories = await db.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user.id })),
  });

  return api.created({ created: categories.count });
}
