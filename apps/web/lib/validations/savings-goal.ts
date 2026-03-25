import { z } from "zod";
import { sanitizeString } from "@/lib/sanitize";

export const CreateSavingsGoalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").transform(sanitizeString),
  targetAmount: z.number().positive("Target amount must be greater than 0"),
  color: z.string().min(1, "Color is required"),
  deadline: z.date().nullable().optional(),
});

export const UpdateSavingsGoalSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .transform(sanitizeString)
    .optional(),
  targetAmount: z
    .number()
    .positive("Target amount must be greater than 0")
    .optional(),
  currentAmount: z.number().min(0, "Amount cannot be negative").optional(),
  color: z.string().min(1, "Color is required").optional(),
  deadline: z.date().nullable().optional(),
  isCompleted: z.boolean().optional(),
});

export const ContributionSchema = z.object({
  amount: z.number().positive("Contribution amount must be greater than 0"),
});

export type CreateSavingsGoalInput = z.infer<typeof CreateSavingsGoalSchema>;
export type UpdateSavingsGoalInput = z.infer<typeof UpdateSavingsGoalSchema>;
