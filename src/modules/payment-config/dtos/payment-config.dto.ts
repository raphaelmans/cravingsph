import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const AddPaymentMethodInputSchema = z.object({
  type: z.enum(["gcash", "maya", "bank"]),
  accountName: z.string().trim().min(1).max(200),
  accountNumber: z.string().trim().min(1).max(100),
  bankName: z.string().trim().min(1).max(200).optional(),
  isDefault: z.boolean().optional().default(false),
});

export type AddPaymentMethodInput = z.infer<typeof AddPaymentMethodInputSchema>;

export const UpdatePaymentMethodInputSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["gcash", "maya", "bank"]),
  accountName: z.string().trim().min(1).max(200),
  accountNumber: z.string().trim().min(1).max(100),
  bankName: z.string().trim().min(1).max(200).optional(),
  isDefault: z.boolean().optional().default(false),
});

export type UpdatePaymentMethodInput = z.infer<
  typeof UpdatePaymentMethodInputSchema
>;

export const RemovePaymentMethodInputSchema = z.object({
  id: z.string().uuid(),
});

export const SetDefaultPaymentMethodInputSchema = z.object({
  id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface PaymentMethodDTO {
  id: string;
  type: "gcash" | "maya" | "bank";
  accountName: string;
  accountNumber: string;
  bankName: string | null;
  isDefault: boolean;
}
