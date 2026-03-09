import { z } from "zod";

// --- Categories ---

export const CreateCategorySchema = z.object({
  branchId: z.string().uuid(),
  name: z.string().min(1).max(100),
});
export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
});
export type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;

export const ReorderCategoriesSchema = z.object({
  branchId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()),
});
export type ReorderCategoriesDTO = z.infer<typeof ReorderCategoriesSchema>;

// --- Menu Items ---

export const CreateMenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
});
export type CreateMenuItemDTO = z.infer<typeof CreateMenuItemSchema>;

export const UpdateMenuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  basePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});
export type UpdateMenuItemDTO = z.infer<typeof UpdateMenuItemSchema>;

// --- Item Variants ---

export const CreateVariantSchema = z.object({
  menuItemId: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
});
export type CreateVariantDTO = z.infer<typeof CreateVariantSchema>;

export const UpdateVariantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
});
export type UpdateVariantDTO = z.infer<typeof UpdateVariantSchema>;

// --- Modifier Groups ---

export const CreateModifierGroupSchema = z.object({
  menuItemId: z.string().uuid(),
  name: z.string().min(1).max(100),
  isRequired: z.boolean().optional(),
  minSelections: z.number().int().min(0).optional(),
  maxSelections: z.number().int().min(1).optional(),
});
export type CreateModifierGroupDTO = z.infer<typeof CreateModifierGroupSchema>;

export const UpdateModifierGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  isRequired: z.boolean().optional(),
  minSelections: z.number().int().min(0).optional(),
  maxSelections: z.number().int().min(1).optional(),
  sortOrder: z.number().int().min(0).optional(),
});
export type UpdateModifierGroupDTO = z.infer<typeof UpdateModifierGroupSchema>;

// --- Modifiers ---

export const CreateModifierSchema = z.object({
  modifierGroupId: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .optional(),
});
export type CreateModifierDTO = z.infer<typeof CreateModifierSchema>;

export const UpdateModifierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
});
export type UpdateModifierDTO = z.infer<typeof UpdateModifierSchema>;
