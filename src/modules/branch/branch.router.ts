import { z } from "zod";
import { RestaurantNotFoundError } from "@/modules/restaurant/errors/restaurant.errors";
import { makeRestaurantRepository } from "@/modules/restaurant/factories/restaurant.factory";
import { makeResolveOwnerConsoleAccessUseCase } from "@/modules/team-access/factories/team-access.factory";
import { canAccessOwnerConsole } from "@/modules/team-access/permissions";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/shared/infra/trpc/trpc";
import { AuthorizationError } from "@/shared/kernel/errors";
import {
  CreateBranchSchema,
  GetOperatingHoursSchema,
  UpdateBranchSchema,
  UpdateOperatingHoursSchema,
} from "./dtos/branch.dto";
import { makeBranchService } from "./factories/branch.factory";

export const branchRouter = router({
  /**
   * List active tables with sessions for a branch (public — used by checkout).
   */
  listActiveTables: publicProcedure
    .input(z.object({ branchId: z.string().uuid() }))
    .query(async ({ input }) => {
      const branchService = makeBranchService();
      return branchService.listActiveTables(input.branchId);
    }),

  /**
   * Get a branch by its restaurant-scoped slug (public).
   */
  getBySlug: publicProcedure
    .input(
      z.object({
        restaurantId: z.string().uuid(),
        slug: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const branchService = makeBranchService();
      return branchService.getBySlug(input.restaurantId, input.slug);
    }),

  /**
   * List active branches for a restaurant (public — used by menu page).
   */
  listPublicByRestaurant: publicProcedure
    .input(
      z.object({
        restaurantId: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      const branchService = makeBranchService();
      return branchService.listPublicByRestaurant(input.restaurantId);
    }),

  /**
   * List all branches the current user can access (for branch switcher).
   * Returns branches with portal slugs and restaurant names.
   */
  listAccessible: protectedProcedure.query(async ({ ctx }) => {
    const branchService = makeBranchService();
    const ownerConsoleAccess =
      await makeResolveOwnerConsoleAccessUseCase().execute({
        userId: ctx.userId,
      });

    if (ownerConsoleAccess) {
      return branchService.listByOrganizationId(
        ownerConsoleAccess.organization.id,
      );
    }

    return branchService.listAccessible(ctx.userId);
  }),

  /**
   * List all branches for a restaurant.
   */
  listByRestaurant: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const restaurant = await makeRestaurantRepository().findById(
        input.restaurantId,
      );

      if (!restaurant) {
        throw new RestaurantNotFoundError(input.restaurantId);
      }

      const ownerConsoleAccess =
        await makeResolveOwnerConsoleAccessUseCase().execute({
          userId: ctx.userId,
          organizationId: restaurant.organizationId,
        });

      if (
        !ownerConsoleAccess ||
        !canAccessOwnerConsole(ownerConsoleAccess.accessLevel)
      ) {
        throw new AuthorizationError(
          "Not authorized to view this restaurant's branches",
          {
            restaurantId: input.restaurantId,
            userId: ctx.userId,
          },
        );
      }

      const branchService = makeBranchService();
      return branchService.listByRestaurantId(input.restaurantId);
    }),

  /**
   * Create a new branch for a restaurant.
   */
  create: protectedProcedure
    .input(CreateBranchSchema)
    .mutation(async ({ input, ctx }) => {
      const branchService = makeBranchService();
      return branchService.create(ctx.userId, input.restaurantId, input);
    }),

  /**
   * Update an existing branch.
   */
  update: protectedProcedure
    .input(UpdateBranchSchema)
    .mutation(async ({ input, ctx }) => {
      const branchService = makeBranchService();
      return branchService.update(ctx.userId, input.id, input);
    }),

  /**
   * Get operating hours for a branch.
   */
  getOperatingHours: protectedProcedure
    .input(GetOperatingHoursSchema)
    .query(async ({ input, ctx }) => {
      const branchService = makeBranchService();
      return branchService.getOperatingHours(ctx.userId, input.branchId);
    }),

  /**
   * Update operating hours for a branch (supports multiple time slots per day).
   */
  updateOperatingHours: protectedProcedure
    .input(UpdateOperatingHoursSchema)
    .mutation(async ({ input, ctx }) => {
      const branchService = makeBranchService();
      await branchService.updateOperatingHours(
        ctx.userId,
        input.branchId,
        input.hours,
      );
    }),
});
