import { z } from "zod";
import { sanitizeString } from "@/lib/sanitize";

export const CategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").transform(sanitizeString),
  color: z.string().min(1, "Color is required"),
  icon: z.string().min(1, "Icon is required").transform(sanitizeString),
  type: z.enum(["expense", "income", "both"] as const, {
    error: 'Type must be "expense", "income", or "both"',
  }),
});

export const UpdateCategorySchema = CategorySchema.partial();

export type CategoryInput = z.infer<typeof CategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
