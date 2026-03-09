import { z } from "zod";

export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Must be at most 200 characters")
    .transform((value) => value.trim()),
});

export type CreateOrganizationDTO = z.infer<typeof CreateOrganizationSchema>;

export const UpdateOrganizationSchema = z.object({
  name: z
    .string()
    .max(200, "Must be at most 200 characters")
    .transform((value) => value.trim())
    .optional(),
  description: z
    .union([z.string(), z.undefined()])
    .transform((value) => {
      if (typeof value !== "string") {
        return undefined;
      }
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    })
    .optional(),
  logoUrl: z.string().url().optional(),
});

export type UpdateOrganizationDTO = z.infer<typeof UpdateOrganizationSchema>;
