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
  limit: z.number().int().min(1).max(50).optional().default(20),
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
}

export interface LocationDTO {
  city: string;
  province: string | null;
  slug: string;
  count: number;
}
