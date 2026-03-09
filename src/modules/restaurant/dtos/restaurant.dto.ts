import { z } from "zod";

export const CreateRestaurantSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  cuisineType: z.string().max(100).trim().optional(),
  phone: z.string().max(20).trim().optional(),
  email: z.string().email().max(255).optional(),
});

export type CreateRestaurantDTO = z.infer<typeof CreateRestaurantSchema>;

export const UpdateRestaurantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  cuisineType: z.string().max(100).trim().optional(),
  logoUrl: z.string().url().optional(),
  coverUrl: z.string().url().optional(),
  phone: z.string().max(20).trim().optional(),
  email: z.string().email().max(255).optional(),
});

export type UpdateRestaurantDTO = z.infer<typeof UpdateRestaurantSchema>;
