import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const CreateInvitationInputSchema = z.object({
  email: z.string().email().optional(),
  restaurantName: z.string().trim().max(200).optional(),
  expiresInDays: z.number().int().min(1).max(30).optional().default(7),
});

export type CreateInvitationInput = z.infer<typeof CreateInvitationInputSchema>;

export const ListInvitationsInputSchema = z.object({
  status: z.enum(["pending", "accepted", "expired"]).optional(),
});

export type ListInvitationsInput = z.infer<typeof ListInvitationsInputSchema>;

export const RevokeInvitationInputSchema = z.object({
  id: z.string().uuid(),
});

export type RevokeInvitationInput = z.infer<typeof RevokeInvitationInputSchema>;

export const ValidateInvitationInputSchema = z.object({
  token: z.string().min(1),
});

export type ValidateInvitationInput = z.infer<
  typeof ValidateInvitationInputSchema
>;

export const AcceptInvitationInputSchema = z.object({
  token: z.string().min(1),
});

export type AcceptInvitationInput = z.infer<typeof AcceptInvitationInputSchema>;

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface InvitationDTO {
  id: string;
  token: string;
  email: string | null;
  restaurantName: string | null;
  status: string;
  createdBy: string;
  acceptedBy: string | null;
  acceptedByEmail: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
