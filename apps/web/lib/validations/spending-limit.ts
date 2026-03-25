import { z } from "zod";
import { sanitizeString } from "@/lib/sanitize";

export const SpendingLimitSchema = z.object({
  categoryName: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category name is too long")
    .transform(sanitizeString),
  amount: z.number().positive("Amount must be positive"),
  month: z
    .number()
    .int()
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  year: z
    .number()
    .int()
    .min(2000, "Invalid year")
    .max(2100, "Invalid year"),
});

export type SpendingLimitInput = z.infer<typeof SpendingLimitSchema>;
