import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/shared/infra/trpc/trpc";
import {
  CreateReviewInputSchema,
  ListByRestaurantInputSchema,
} from "./dtos/review.dto";
import { makeReviewService } from "./factories/review.factory";

export const reviewRouter = router({
  /**
   * Create a review for a completed order.
   * One review per order; verifies ownership and status.
   */
  create: protectedProcedure
    .input(CreateReviewInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeReviewService();
      return service.create(ctx.session.userId, input);
    }),

  /**
   * List reviews for a restaurant by slug.
   * Public — includes average rating and total count.
   */
  listByRestaurant: publicProcedure
    .input(ListByRestaurantInputSchema)
    .query(async ({ input }) => {
      const service = makeReviewService();
      return service.listByRestaurant(input.restaurantSlug, input.limit);
    }),
});
