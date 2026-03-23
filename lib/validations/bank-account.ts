import { z } from "zod";

export const BankAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  initialBalance: z.coerce.number().min(0, "Initial balance cannot be negative"),
});

export type BankAccountInput = z.infer<typeof BankAccountSchema>;
