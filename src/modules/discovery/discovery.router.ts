import { publicProcedure, router } from "@/shared/infra/trpc/trpc";
import {
  FeaturedInputSchema,
  NearbyInputSchema,
  SearchInputSchema,
} from "./dtos/discovery.dto";
import { makeDiscoveryService } from "./factories/discovery.factory";

export const discoveryRouter = router({
  /**
   * Featured restaurants — editorially curated (is_featured=true).
   */
  featured: publicProcedure
    .input(FeaturedInputSchema)
    .query(async ({ input }) => {
      const service = makeDiscoveryService();
      return service.listFeatured(input.limit);
    }),

  /**
   * Nearby restaurants — sorted by proximity when lat/lng provided.
   */
  nearby: publicProcedure.input(NearbyInputSchema).query(async ({ input }) => {
    const service = makeDiscoveryService();
    return service.listNearby(input.lat, input.lng, input.limit);
  }),

  /**
   * Search restaurants — filter by text, cuisine, and city.
   */
  search: publicProcedure.input(SearchInputSchema).query(async ({ input }) => {
    const service = makeDiscoveryService();
    return service.search({
      query: input.query,
      cuisine: input.cuisine,
      city: input.city,
      limit: input.limit,
    });
  }),

  /**
   * Distinct cities with active restaurants.
   */
  locations: publicProcedure.query(async () => {
    const service = makeDiscoveryService();
    return service.listLocations();
  }),
});
