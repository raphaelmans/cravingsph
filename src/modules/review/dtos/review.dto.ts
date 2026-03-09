import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const CreateReviewInputSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(2000),
  authorName: z.string().trim().min(1).max(200),
});

export type CreateReviewInput = z.infer<typeof CreateReviewInputSchema>;

export const ListByRestaurantInputSchema = z.object({
  restaurantSlug: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

export type ListByRestaurantInput = z.infer<typeof ListByRestaurantInputSchema>;

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface ReviewDTO {
  id: string;
  orderId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RestaurantReviewsDTO {
  reviews: ReviewDTO[];
  averageRating: number;
  totalReviews: number;
}
