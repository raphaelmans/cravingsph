import { protectedProcedure, router } from "@/shared/infra/trpc/trpc";
import {
  IsSavedInputSchema,
  ToggleSavedInputSchema,
} from "./dtos/saved-restaurant.dto";
import { makeSavedRestaurantService } from "./factories/saved-restaurant.factory";

export const savedRestaurantRouter = router({
  /**
   * List the current user's saved restaurants with restaurant details.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const service = makeSavedRestaurantService();
    return service.list(ctx.session.userId);
  }),

  /**
   * Toggle save/unsave a restaurant. Returns { saved: boolean }.
   */
  toggle: protectedProcedure
    .input(ToggleSavedInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeSavedRestaurantService();
      return service.toggle(ctx.session.userId, input.restaurantId, input.note);
    }),

  /**
   * Check if a restaurant is saved by the current user.
   */
  isSaved: protectedProcedure
    .input(IsSavedInputSchema)
    .query(async ({ ctx, input }) => {
      const service = makeSavedRestaurantService();
      return service.isSaved(ctx.session.userId, input.restaurantId);
    }),
});
