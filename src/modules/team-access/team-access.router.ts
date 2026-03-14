import { z } from "zod";
import { makeBranchService } from "@/modules/branch/factories/branch.factory";
import { makeOrganizationService } from "@/modules/organization/factories/organization.factory";
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
  ValidateInviteSchema,
} from "./dtos/team-access.dto";
import {
  makeAcceptInviteUseCase,
  makeAssignmentService,
  makeInviteService,
  makeMembershipService,
} from "./factories/team-access.factory";

const inviteRouter = router({
  /** Create a team invite (owner-only) */
  create: protectedProcedure
    .input(CreateTeamInviteSchema)
    .mutation(async ({ input, ctx }) => {
      if (!flags.ownerTeamAccess) {
        throw new AuthorizationError("Team access feature is not enabled");
      }
      const service = makeInviteService();
      return service.create(input, ctx.userId);
    }),

  /** List invites for an organization */
  list: protectedProcedure.input(ListInvitesSchema).query(async ({ input }) => {
    if (!flags.ownerTeamAccess) {
      throw new AuthorizationError("Team access feature is not enabled");
    }
    const service = makeInviteService();
    return service.list(input.organizationId, input.status);
  }),

  /** Revoke a pending invite */
  revoke: protectedProcedure
    .input(RevokeInviteSchema)
    .mutation(async ({ input }) => {
      if (!flags.ownerTeamAccess) {
        throw new AuthorizationError("Team access feature is not enabled");
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

      let scopeName = "Business-wide access";
      if (invite.scopeType === "branch") {
        try {
          const branch = await makeBranchService().getById(invite.scopeId);
          scopeName = branch.name;
        } catch {
          scopeName = "Unknown branch";
        }
      }

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
  /** List memberships for an organization */
  listMembers: protectedProcedure
    .input(ListMembersSchema)
    .query(async ({ input }) => {
      const service = makeMembershipService();
      return service.findByOrg(input.organizationId);
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
