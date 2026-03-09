import type {
  CreateReviewInput,
  RestaurantReviewsDTO,
  ReviewDTO,
} from "../dtos/review.dto";
import {
  OrderNotCompletedError,
  ReviewAlreadyExistsError,
  ReviewOrderNotFoundError,
  ReviewOrderNotOwnedError,
} from "../errors/review.errors";
import type {
  IReviewRepository,
  ReviewRow,
} from "../repositories/review.repository";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IReviewService {
  create(userId: string, input: CreateReviewInput): Promise<ReviewDTO>;
  listByRestaurant(slug: string, limit: number): Promise<RestaurantReviewsDTO>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ReviewService implements IReviewService {
  constructor(private repository: IReviewRepository) {}

  async create(userId: string, input: CreateReviewInput): Promise<ReviewDTO> {
    // 1. Verify order exists
    const orderRow = await this.repository.getOrderForReview(input.orderId);
    if (!orderRow) {
      throw new ReviewOrderNotFoundError(input.orderId);
    }

    // 2. Verify ownership
    if (orderRow.customerId !== userId) {
      throw new ReviewOrderNotOwnedError();
    }

    // 3. Verify order is completed
    if (orderRow.status !== "completed") {
      throw new OrderNotCompletedError(input.orderId, orderRow.status);
    }

    // 4. Verify no existing review
    const exists = await this.repository.hasReview(input.orderId);
    if (exists) {
      throw new ReviewAlreadyExistsError(input.orderId);
    }

    // 5. Create review
    const row = await this.repository.create({
      orderId: input.orderId,
      restaurantId: orderRow.restaurantId,
      userId,
      authorName: input.authorName,
      rating: input.rating,
      comment: input.comment,
    });

    return this.toDTO(row);
  }

  async listByRestaurant(
    slug: string,
    limit: number,
  ): Promise<RestaurantReviewsDTO> {
    const [reviews, stats] = await Promise.all([
      this.repository.findByRestaurantSlug(slug, limit),
      this.repository.getStatsByRestaurantSlug(slug),
    ]);

    return {
      reviews: reviews.map((r) => this.toDTO(r)),
      averageRating: stats.averageRating
        ? Number.parseFloat(Number.parseFloat(stats.averageRating).toFixed(1))
        : 0,
      totalReviews: Number.parseInt(stats.totalReviews, 10),
    };
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private toDTO(row: ReviewRow): ReviewDTO {
    return {
      id: row.id,
      orderId: row.orderId,
      authorName: row.authorName ?? "Customer",
      rating: row.rating,
      comment: row.comment ?? "",
      createdAt: row.createdAt.toISOString(),
    };
  }
}
