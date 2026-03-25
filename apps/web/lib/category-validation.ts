import { db } from "@/lib/db";

const SYSTEM_CATEGORIES = ["Transfer"];

/**
 * Validate that a category name exists for the given user.
 * System categories (e.g. "Transfer") are always allowed.
 * When transactionType is provided, the category type must match
 * (exact match or "both").
 */
export async function validateUserCategory(
  userId: string,
  categoryName: string,
  transactionType?: string
): Promise<{ valid: boolean; error?: string }> {
  if (SYSTEM_CATEGORIES.includes(categoryName)) {
    return { valid: true };
  }

  const matchingTypes = transactionType
    ? [transactionType, "both"]
    : undefined;

  const category = await db.category.findFirst({
    where: {
      userId,
      name: categoryName,
      ...(matchingTypes ? { type: { in: matchingTypes } } : {}),
    },
  });

  if (!category) {
    return {
      valid: false,
      error: transactionType
        ? `Category "${categoryName}" not found or does not match transaction type "${transactionType}"`
        : `Category "${categoryName}" not found`,
    };
  }

  return { valid: true };
}
