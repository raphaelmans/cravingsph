import { z } from "zod";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/shared/infra/trpc/trpc";
import { AuthorizationError } from "@/shared/kernel/errors";
import { makeResolveOwnerConsoleAccessUseCase } from "../team-access/factories/team-access.factory";
import { canAccessOwnerConsole } from "../team-access/permissions";
import {
  CreateRestaurantSchema,
  UpdateRestaurantSchema,
} from "./dtos/restaurant.dto";
import { makeRestaurantService } from "./factories/restaurant.factory";

export const restaurantRouter = router({
  /**
   * Get a restaurant by its public slug.
   * Used for customer-facing pages.
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const restaurantService = makeRestaurantService();
      return restaurantService.getBySlug(input.slug);
    }),

  /**
   * List all restaurants for an organization.
   * Used for the owner dashboard.
   */
  listByOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const access = await makeResolveOwnerConsoleAccessUseCase().execute({
        userId: ctx.userId,
        organizationId: input.organizationId,
      });
      if (!access || !canAccessOwnerConsole(access.accessLevel)) {
        throw new AuthorizationError(
          "Not authorized to view this organization's restaurants",
          {
            organizationId: input.organizationId,
            userId: ctx.userId,
          },
        );
      }

      const restaurantService = makeRestaurantService();
      return restaurantService.listByOrganizationId(input.organizationId);
    }),

  /**
   * Create a new restaurant under an organization.
   */
  create: protectedProcedure
    .input(CreateRestaurantSchema)
    .mutation(async ({ input, ctx }) => {
      const restaurantService = makeRestaurantService();
      const { organizationId, ...data } = input;
      return restaurantService.create(ctx.userId, organizationId, data);
    }),

  /**
   * Update an existing restaurant.
   */
  update: protectedProcedure
    .input(UpdateRestaurantSchema)
    .mutation(async ({ input, ctx }) => {
      const restaurantService = makeRestaurantService();
      const { id, ...data } = input;
      return restaurantService.update(ctx.userId, id, data);
    }),
});
