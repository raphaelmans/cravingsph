import { z } from "zod";

export const CreateBranchSchema = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

export type CreateBranchDTO = z.infer<typeof CreateBranchSchema>;

export const UpdateBranchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(500).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  coverUrl: z.string().url().optional(),
  isOrderingEnabled: z.boolean().optional(),
  autoAcceptOrders: z.boolean().optional(),
  paymentCountdownMinutes: z.number().int().min(1).optional(),
});

export type UpdateBranchDTO = z.infer<typeof UpdateBranchSchema>;
