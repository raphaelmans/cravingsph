import { z } from "zod";
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
      return service.validate(input.token);
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
