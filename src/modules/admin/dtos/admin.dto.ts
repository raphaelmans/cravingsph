import { z } from "zod";

export const GetAdminRestaurantSchema = z.object({
  id: z.string().uuid(),
});

export const UpdateAdminRestaurantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  cuisineType: z.string().max(100).trim().optional(),
  phone: z.string().max(20).trim().optional(),
  email: z.string().email().max(255).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateAdminRestaurantDTO = z.infer<
  typeof UpdateAdminRestaurantSchema
>;

export const GetAdminVerificationRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export const UpdateAdminVerificationStatusSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
});
