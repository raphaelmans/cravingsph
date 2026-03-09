import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const ToggleSavedInputSchema = z.object({
  restaurantId: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
});

export const IsSavedInputSchema = z.object({
  restaurantId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface SavedRestaurantDTO {
  id: string;
  restaurantId: string;
  slug: string;
  name: string;
  coverImageUrl: string | null;
  logoUrl: string | null;
  cuisineTypes: string[];
  popularItems: string[];
  locationLabel: string | null;
  savedAt: string;
  note: string | null;
}
