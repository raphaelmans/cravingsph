import { z } from "zod";

// --- Tables ---

export const CreateTableSchema = z.object({
  branchId: z.string().uuid(),
  label: z.string().min(1).max(50),
  code: z
    .string()
    .min(1)
    .max(20)
    .regex(
      /^[A-Z0-9-]+$/,
      "Code must be uppercase letters, digits, or hyphens",
    ),
  sortOrder: z.number().int().min(0).optional(),
});
export type CreateTableDTO = z.infer<typeof CreateTableSchema>;

export const UpdateTableSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(50).optional(),
  code: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[A-Z0-9-]+$/, "Code must be uppercase letters, digits, or hyphens")
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateTableDTO = z.infer<typeof UpdateTableSchema>;

export const ListTablesSchema = z.object({
  branchId: z.string().uuid(),
});
export type ListTablesDTO = z.infer<typeof ListTablesSchema>;

export const TableIdSchema = z.object({
  id: z.string().uuid(),
});

// --- Sessions ---

export const OpenSessionSchema = z.object({
  branchTableId: z.string().uuid(),
});
export type OpenSessionDTO = z.infer<typeof OpenSessionSchema>;

export const CloseSessionSchema = z.object({
  sessionId: z.string().uuid(),
});
export type CloseSessionDTO = z.infer<typeof CloseSessionSchema>;

export const CloseAllSessionsSchema = z.object({
  branchId: z.string().uuid(),
});
export type CloseAllSessionsDTO = z.infer<typeof CloseAllSessionsSchema>;
