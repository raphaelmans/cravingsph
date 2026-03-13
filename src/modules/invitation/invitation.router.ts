import { env } from "@/lib/env";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "@/shared/infra/trpc/trpc";
import {
  AcceptInvitationInputSchema,
  CreateInvitationInputSchema,
  ListInvitationsInputSchema,
  RevokeInvitationInputSchema,
  ValidateInvitationInputSchema,
} from "./dtos/invitation.dto";
import { makeInvitationService } from "./factories/invitation.factory";

export const invitationRouter = router({
  /**
   * Create a new invitation token.
   * Admin-only — generates a unique invite URL for owner onboarding.
   */
  create: adminProcedure
    .input(CreateInvitationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeInvitationService();
      const invitation = await service.create(input, ctx.session.userId);
      const baseUrl =
        env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3443";
      return {
        ...invitation,
        inviteUrl: `${baseUrl}/register/owner?token=${invitation.token}`,
      };
    }),

  /**
   * List all invitations with optional status filter.
   * Admin-only — includes acceptedBy email from profile join.
   */
  list: adminProcedure
    .input(ListInvitationsInputSchema)
    .query(async ({ input }) => {
      const service = makeInvitationService();
      return service.list(input);
    }),

  /**
   * Revoke a pending invitation.
   * Admin-only — sets status to expired.
   */
  revoke: adminProcedure
    .input(RevokeInvitationInputSchema)
    .mutation(async ({ input }) => {
      const service = makeInvitationService();
      return service.revoke(input.id);
    }),

  /**
   * Validate an invitation token.
   * Public — checks if the token is valid, pending, and not expired.
   */
  validate: publicProcedure
    .input(ValidateInvitationInputSchema)
    .query(async ({ input }) => {
      const service = makeInvitationService();
      return service.validate(input.token);
    }),

  /**
   * Accept an invitation token.
   * Protected — marks the invitation as accepted by the authenticated user.
   */
  accept: protectedProcedure
    .input(AcceptInvitationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeInvitationService();
      return service.accept(input.token, ctx.session.userId);
    }),
});
