import { z } from "zod";

export const CreditCardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  billGenerationDate: z.coerce
    .number()
    .int()
    .min(1, "Bill generation date must be between 1 and 31")
    .max(31, "Bill generation date must be between 1 and 31"),
  paymentDate: z.coerce
    .number()
    .int()
    .min(1, "Payment date must be between 1 and 31")
    .max(31, "Payment date must be between 1 and 31"),
  cardLimit: z.coerce.number().positive("Card limit must be greater than 0"),
});

export type CreditCardInput = z.infer<typeof CreditCardSchema>;
