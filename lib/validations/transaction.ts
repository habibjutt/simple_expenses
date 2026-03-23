import { z } from "zod";

export const CreateTransactionSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  amount: z.coerce
    .number()
    .refine((v) => v !== 0, { message: "Amount cannot be zero" }),
  date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: "Invalid date" }),
  category: z.string().min(1, "Category is required"),
  notes: z.string().max(500, "Notes are too long").optional().nullable(),
  creditCardId: z.string().optional().nullable(),
  bankAccountId: z.string().optional().nullable(),
  installments: z.coerce
    .number()
    .int()
    .min(1, "Installments must be at least 1")
    .default(1),
});

export const CreateTransferSchema = z.object({
  name: z.string().max(255, "Name is too long").optional(),
  amount: z.coerce
    .number()
    .positive("Transfer amount must be greater than 0"),
  date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: "Invalid date" }),
  fromAccountId: z.string().min(1, "Source account is required"),
  toAccountId: z.string().min(1, "Destination account is required"),
});

export const UpdateTransactionSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  amount: z.coerce
    .number()
    .refine((v) => v !== 0, { message: "Amount cannot be zero" }),
  date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: "Invalid date" }),
  category: z.string().min(1, "Category is required"),
  notes: z.string().max(500, "Notes are too long").optional().nullable(),
  installments: z.coerce
    .number()
    .int()
    .min(1, "Installments must be at least 1")
    .default(1),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type CreateTransferInput = z.infer<typeof CreateTransferSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
