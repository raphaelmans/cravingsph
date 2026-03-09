import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "@/shared/infra/trpc/trpc";
import { AuthorizationError } from "@/shared/kernel/errors";
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
} from "./dtos/organization.dto";
import { makeOrganizationService } from "./factories/organization.factory";

export const organizationRouter = router({
  /**
   * Get current user's organization.
   */
  mine: protectedProcedure.query(async ({ ctx }) => {
    const organizationService = makeOrganizationService();
    return organizationService.getByOwnerId(ctx.userId);
  }),

  /**
   * Create a new organization for the current user.
   * Only accounts with portal_preference 'owner' (or null for legacy) may create.
   */
  create: protectedProcedure
    .input(CreateOrganizationSchema)
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.portalPreference === "customer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Customer accounts cannot create organizations",
          cause: new AuthorizationError(
            "Customer accounts cannot create organizations",
            { userId: ctx.userId },
          ),
        });
      }
      const organizationService = makeOrganizationService();
      return organizationService.create(ctx.userId, input);
    }),

  /**
   * Update current user's organization.
   */
  update: protectedProcedure
    .input(UpdateOrganizationSchema)
    .mutation(async ({ input, ctx }) => {
      const organizationService = makeOrganizationService();
      const org = await organizationService.getByOwnerId(ctx.userId);
      return organizationService.update(org.id, input);
    }),
});
