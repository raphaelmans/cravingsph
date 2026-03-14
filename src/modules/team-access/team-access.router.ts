import { z } from "zod";
import { makeBranchService } from "@/modules/branch/factories/branch.factory";
import { makeOrganizationService } from "@/modules/organization/factories/organization.factory";
import { makeProfileService } from "@/modules/profile/factories/profile.factory";
import { flags } from "@/shared/infra/feature-flags";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/shared/infra/trpc/trpc";
import { AuthorizationError } from "@/shared/kernel/errors";
import {
  AcceptInviteSchema,
  CreateTeamInviteSchema,
  HasAccessSchema,
  ListInvitesSchema,
  ListMembersSchema,
  RevokeInviteSchema,
  RevokeMemberSchema,
  ValidateInviteSchema,
} from "./dtos/team-access.dto";
import {
  makeAcceptInviteUseCase,
  makeAssignmentRepository,
  makeAssignmentService,
  makeInviteService,
  makeMembershipRepository,
  makeMembershipService,
  makeResolveOwnerConsoleAccessUseCase,
  makeTeamInviteRepository,
} from "./factories/team-access.factory";
import { canManageTeam, canViewTeam } from "./permissions";

/** Resolve a scope ID to a human-readable label. */
async function resolveScopeName(
  scopeType: string,
  scopeId: string,
): Promise<string> {
  if (scopeType === "business") return "Business-wide access";
  try {
    const branch = await makeBranchService().getById(scopeId);
    return branch.name;
  } catch {
    return "Unknown branch";
  }
}

async function requireTeamAccess(
  userId: string,
  organizationId: string,
  permission: "view" | "manage",
) {
  const access = await makeResolveOwnerConsoleAccessUseCase().execute({
    userId,
    organizationId,
  });

  if (!access) {
    throw new AuthorizationError("Not authorized to access this organization", {
      organizationId,
      userId,
    });
  }

  const allowed =
    permission === "manage"
      ? canManageTeam(access.accessLevel)
      : canViewTeam(access.accessLevel);

  if (!allowed) {
    throw new AuthorizationError(
      permission === "manage"
        ? "Not authorized to manage team access"
        : "Not authorized to view team access",
      {
        organizationId,
        userId,
        accessLevel: access.accessLevel,
      },
    );
  }

  return access;
}

const inviteRouter = router({
  /** Create a team invite (owner-only) */
  create: protectedProcedure
    .input(CreateTeamInviteSchema)
    .mutation(async ({ input, ctx }) => {
      if (!flags.ownerTeamAccess) {
        throw new AuthorizationError("Team access feature is not enabled");
      }
      await requireTeamAccess(ctx.userId, input.organizationId, "manage");
      const service = makeInviteService();
      return service.create(input, ctx.userId);
    }),

  /** List invites for an organization (enriched with scope names) */
  list: protectedProcedure
    .input(ListInvitesSchema)
    .query(async ({ input, ctx }) => {
      if (!flags.ownerTeamAccess) {
        throw new AuthorizationError("Team access feature is not enabled");
      }
      await requireTeamAccess(ctx.userId, input.organizationId, "view");

      const service = makeInviteService();
      const invites = await service.list(input.organizationId, input.status);

      return Promise.all(
        invites.map(async (invite) => ({
          ...invite,
          scopeName: await resolveScopeName(invite.scopeType, invite.scopeId),
        })),
      );
    }),

  /** Revoke a pending invite */
  revoke: protectedProcedure
    .input(RevokeInviteSchema)
    .mutation(async ({ input, ctx }) => {
      if (!flags.ownerTeamAccess) {
        throw new AuthorizationError("Team access feature is not enabled");
      }

      const invite = await makeTeamInviteRepository().findById(input.inviteId);
      if (invite) {
        await requireTeamAccess(ctx.userId, invite.organizationId, "manage");
      }

      const service = makeInviteService();
      await service.revoke(input.inviteId);
    }),

  /** Validate an invite token (public — for the accept landing page) */
  validate: publicProcedure
    .input(ValidateInviteSchema)
    .query(async ({ input }) => {
      const service = makeInviteService();
      const invite = await service.validate(input.token);

      // Enrich with display names for the landing page
      let organizationName = "Unknown organization";
      try {
        const org = await makeOrganizationService().getById(
          invite.organizationId,
        );
        organizationName = org.name;
      } catch {
        // org not found — use fallback
      }

      const scopeName = await resolveScopeName(
        invite.scopeType,
        invite.scopeId,
      );

      return { ...invite, organizationName, scopeName };
    }),

  /** Accept a team invite */
  accept: protectedProcedure
    .input(AcceptInviteSchema)
    .mutation(async ({ input, ctx }) => {
      const useCase = makeAcceptInviteUseCase();
      return useCase.execute(input.inviteId, ctx.userId);
    }),
});

/**
 * Team access router — manages memberships, scoped assignments, and invites.
 */
export const teamAccessRouter = router({
  /** List memberships for an organization (enriched with user info and assignments) */
  listMembers: protectedProcedure
    .input(ListMembersSchema)
    .query(async ({ input, ctx }) => {
      if (!flags.ownerTeamAccess) {
        throw new AuthorizationError("Team access feature is not enabled");
      }
      await requireTeamAccess(ctx.userId, input.organizationId, "view");

      const membershipService = makeMembershipService();
      const memberships = await membershipService.findByOrg(
        input.organizationId,
      );

      const profileService = makeProfileService();
      const assignmentRepo = makeAssignmentRepository();

      return Promise.all(
        memberships.map(async (m) => {
          let email = "Unknown";
          let displayName: string | null = null;
          try {
            const userProfile = await profileService.getProfile(m.userId);
            email = userProfile.email ?? "Unknown";
            displayName = userProfile.displayName;
          } catch {
            // profile not found — use fallbacks
          }

          const assignments = await assignmentRepo.findByMembership(m.id);
          const enrichedAssignments = await Promise.all(
            assignments
              .filter((a) => a.status === "active")
              .map(async (a) => ({
                ...a,
                scopeName: await resolveScopeName(a.scopeType, a.scopeId),
              })),
          );

          return {
            ...m,
            email,
            displayName,
            assignments: enrichedAssignments,
          };
        }),
      );
    }),

  /** Revoke a team membership (and cascading assignments) */
  revokeMember: protectedProcedure
    .input(RevokeMemberSchema)
    .mutation(async ({ input, ctx }) => {
      if (!flags.ownerTeamAccess) {
        throw new AuthorizationError("Team access feature is not enabled");
      }

      const membershipService = makeMembershipService();
      const membership = await makeMembershipRepository().findById(
        input.membershipId,
      );
      if (membership) {
        await requireTeamAccess(
          ctx.userId,
          membership.organizationId,
          "manage",
        );
      }
      await membershipService.revoke(input.membershipId);
    }),

  /** Check if the current user has access to a scope */
  hasAccess: protectedProcedure
    .input(HasAccessSchema.extend({ organizationId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const service = makeAssignmentService();
      return service.hasAccess(
        ctx.userId,
        input.scopeType,
        input.scopeId,
        input.organizationId,
      );
    }),

  /** Invite sub-router */
  invite: inviteRouter,
});
