import { z } from "zod";
import { sanitizeString } from "@/lib/sanitize";

const RECURRING_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;

export const CreateTransactionSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long").transform(sanitizeString),
  amount: z.coerce
    .number()
    .refine((v) => v !== 0, { message: "Amount cannot be zero" }),
  date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: "Invalid date" }),
  category: z.string().min(1, "Category is required").transform(sanitizeString),
  notes: z.string().max(500, "Notes are too long").transform(sanitizeString).optional().nullable(),
  creditCardId: z.string().optional().nullable(),
  bankAccountId: z.string().optional().nullable(),
  installments: z.coerce
    .number()
    .int()
    .min(1, "Installments must be at least 1")
    .default(1),
  isRecurring: z.coerce.boolean().default(false),
  recurringFrequency: z.enum(RECURRING_FREQUENCIES).optional().nullable(),
  recurringEndDate: z
    .string()
    .refine((v) => !v || !isNaN(Date.parse(v)), { message: "Invalid end date" })
    .optional()
    .nullable(),
});

export const CreateTransferSchema = z.object({
  name: z.string().max(255, "Name is too long").transform(sanitizeString).optional(),
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
  name: z.string().min(1, "Name is required").max(255, "Name is too long").transform(sanitizeString),
  amount: z.coerce
    .number()
    .refine((v) => v !== 0, { message: "Amount cannot be zero" }),
  date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: "Invalid date" }),
  category: z.string().min(1, "Category is required").transform(sanitizeString),
  notes: z.string().max(500, "Notes are too long").transform(sanitizeString).optional().nullable(),
  installments: z.coerce
    .number()
    .int()
    .min(1, "Installments must be at least 1")
    .default(1),
  isRecurring: z.coerce.boolean().default(false),
  recurringFrequency: z.enum(RECURRING_FREQUENCIES).optional().nullable(),
  recurringEndDate: z
    .string()
    .refine((v) => !v || !isNaN(Date.parse(v)), { message: "Invalid end date" })
    .optional()
    .nullable(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type CreateTransferInput = z.infer<typeof CreateTransferSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type RecurringFrequency = typeof RECURRING_FREQUENCIES[number];
