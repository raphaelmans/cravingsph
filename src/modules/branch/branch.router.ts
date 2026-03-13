import { z } from "zod";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/shared/infra/trpc/trpc";
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
   * List all branches for a restaurant.
   */
  listByRestaurant: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const branchService = makeBranchService();
      return branchService.listByRestaurant(ctx.userId, input.restaurantId);
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
