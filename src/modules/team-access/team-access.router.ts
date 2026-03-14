import { z } from "zod";
import { protectedProcedure, router } from "@/shared/infra/trpc/trpc";
import { HasAccessSchema, ListMembersSchema } from "./dtos/team-access.dto";
import {
  makeAssignmentService,
  makeMembershipService,
} from "./factories/team-access.factory";

/**
 * Team access router — manages memberships and scoped assignments.
 * Invite flow (Step 10) and full CRUD (Step 11) will be added later.
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
});
