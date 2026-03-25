import { z } from "zod";
import { sanitizeString } from "@/lib/sanitize";

export const BankAccountSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .transform(sanitizeString),
  initialBalance: z.coerce
    .number()
    .min(0, "Initial balance cannot be negative"),
  currency: z.string().default("AED"),
});

export type BankAccountInput = z.infer<typeof BankAccountSchema>;
