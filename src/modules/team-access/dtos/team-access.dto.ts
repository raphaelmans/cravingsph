import { z } from "zod";

/**
 * Role templates define what a user can do.
 * business_* roles operate at the organization level.
 * branch_* roles operate at the branch level.
 */
export const ROLE_TEMPLATES = [
  "business_owner",
  "business_manager",
  "business_viewer",
  "branch_manager",
  "branch_staff",
  "branch_viewer",
] as const;

export const RoleTemplateSchema = z.enum(ROLE_TEMPLATES);
export type RoleTemplate = z.infer<typeof RoleTemplateSchema>;

/**
 * Scope types for assignments.
 * business = organization-wide, branch = single branch.
 */
export const SCOPE_TYPES = ["business", "branch"] as const;

export const ScopeTypeSchema = z.enum(SCOPE_TYPES);
export type ScopeType = z.infer<typeof ScopeTypeSchema>;

/**
 * Maps role templates to their valid scope types.
 */
export const ROLE_SCOPE_MAP: Record<RoleTemplate, ScopeType> = {
  business_owner: "business",
  business_manager: "business",
  business_viewer: "business",
  branch_manager: "branch",
  branch_staff: "branch",
  branch_viewer: "branch",
};

/** Membership statuses */
export const MEMBERSHIP_STATUSES = ["active", "revoked", "pending"] as const;
export const MembershipStatusSchema = z.enum(MEMBERSHIP_STATUSES);
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>;

/** Assignment statuses */
export const ASSIGNMENT_STATUSES = ["active", "revoked"] as const;
export const AssignmentStatusSchema = z.enum(ASSIGNMENT_STATUSES);

/** Invite statuses */
export const INVITE_STATUSES = [
  "pending",
  "accepted",
  "expired",
  "revoked",
] as const;
export const InviteStatusSchema = z.enum(INVITE_STATUSES);

// --- Input schemas ---

export const CreateMembershipSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
});

export type CreateMembershipDTO = z.infer<typeof CreateMembershipSchema>;

export const CreateAssignmentSchema = z.object({
  membershipId: z.string().uuid(),
  roleTemplate: RoleTemplateSchema,
  scopeType: ScopeTypeSchema,
  scopeId: z.string().uuid(),
});

export type CreateAssignmentDTO = z.infer<typeof CreateAssignmentSchema>;

export const CreateTeamInviteSchema = z.object({
  organizationId: z.string().uuid(),
  email: z.string().email().max(255),
  roleTemplate: RoleTemplateSchema,
  scopeType: ScopeTypeSchema,
  scopeId: z.string().uuid(),
});

export type CreateTeamInviteDTO = z.infer<typeof CreateTeamInviteSchema>;

export const ListMembersSchema = z.object({
  organizationId: z.string().uuid(),
});

export const RevokeAssignmentSchema = z.object({
  assignmentId: z.string().uuid(),
});

export const RevokeMemberSchema = z.object({
  membershipId: z.string().uuid(),
});

export const HasAccessSchema = z.object({
  scopeType: ScopeTypeSchema,
  scopeId: z.string().uuid(),
});

// --- Invite input schemas ---

export const ListInvitesSchema = z.object({
  organizationId: z.string().uuid(),
  status: InviteStatusSchema.optional(),
});

export const RevokeInviteSchema = z.object({
  inviteId: z.string().uuid(),
});

export const ValidateInviteSchema = z.object({
  token: z.string().min(1).max(100),
});

export const AcceptInviteSchema = z.object({
  inviteId: z.string().uuid(),
});
