import { publicProcedure, router } from "@/shared/infra/trpc/trpc";
import {
  FeaturedInputSchema,
  NearbyInputSchema,
  SearchFoodInputSchema,
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
   * Search restaurants — filter by text, cuisine, city, and barangay.
   */
  search: publicProcedure.input(SearchInputSchema).query(async ({ input }) => {
    const service = makeDiscoveryService();
    return service.search({
      query: input.query,
      cuisine: input.cuisine,
      city: input.city,
      barangay: input.barangay,
      limit: input.limit,
    });
  }),

  /**
   * Search menu items by name — returns restaurants with matched food items.
   */
  searchFood: publicProcedure
    .input(SearchFoodInputSchema)
    .query(async ({ input }) => {
      const service = makeDiscoveryService();
      return service.searchFood({
        query: input.query,
        barangay: input.barangay,
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

  /**
   * Distinct barangays with active restaurants.
   */
  barangays: publicProcedure.query(async () => {
    const service = makeDiscoveryService();
    return service.listBarangays();
  }),
});
