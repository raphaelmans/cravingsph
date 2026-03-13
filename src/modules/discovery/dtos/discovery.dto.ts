import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const FeaturedInputSchema = z.object({
  limit: z.number().int().min(1).max(20).default(6),
});

export const NearbyInputSchema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  limit: z.number().int().min(1).max(20).optional().default(6),
});

export const SearchInputSchema = z.object({
  query: z.string().trim().optional(),
  cuisine: z.string().trim().optional(),
  city: z.string().trim().optional(),
  barangay: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

export const SearchFoodInputSchema = z.object({
  query: z.string().min(1).max(200),
  barangay: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(50).default(20).optional(),
});

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface RestaurantPreviewDTO {
  id: string;
  slug: string;
  name: string;
  coverImageUrl: string | null;
  logoUrl: string | null;
  cuisineTypes: string[];
  popularItems: string[];
  branchCity: string | null;
}

export interface FoodSearchItemDTO {
  name: string;
  basePrice: string;
  imageUrl: string | null;
}

export interface FoodSearchResultDTO {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  coverUrl: string | null;
  cuisineTypes: string[];
  branchCity: string | null;
  branchBarangay: string | null;
  matchedItems: FoodSearchItemDTO[];
}

export interface LocationDTO {
  city: string;
  province: string | null;
  slug: string;
  count: number;
}
