import { z } from "zod";

export const IdSchema = z.string().min(1, "ID is required");

export const PayInvoiceSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
  bankAccountId: z.string().min(1, "Bank account ID is required"),
  billStartDate: z.date({ error: "Invalid bill start date" }),
  billEndDate: z.date({ error: "Invalid bill end date" }),
  paymentDueDate: z.date({ error: "Invalid payment due date" }),
  paymentAmount: z.number().min(0.01, "Payment amount must be greater than 0"),
});

export const EditInvoiceSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  newBankAccountId: z.string().min(1).nullable(),
});

export type PayInvoiceInput = z.infer<typeof PayInvoiceSchema>;
export type EditInvoiceInput = z.infer<typeof EditInvoiceSchema>;
