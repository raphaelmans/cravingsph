import { avg, count, desc, eq, sql } from "drizzle-orm";
import { order, restaurant, review } from "@/shared/infra/db/schema";
import type { DbClient } from "@/shared/infra/db/types";

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export interface ReviewRow {
  id: string;
  orderId: string;
  authorName: string | null;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export interface OrderOwnershipRow {
  id: string;
  customerId: string | null;
  status: string;
  restaurantId: string;
}

export interface ReviewStatsRow {
  averageRating: string | null;
  totalReviews: string;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IReviewRepository {
  create(data: {
    orderId: string;
    restaurantId: string;
    userId: string;
    authorName: string;
    rating: number;
    comment: string;
  }): Promise<ReviewRow>;
  findByRestaurantSlug(slug: string, limit: number): Promise<ReviewRow[]>;
  getStatsByRestaurantSlug(slug: string): Promise<ReviewStatsRow>;
  getOrderForReview(orderId: string): Promise<OrderOwnershipRow | null>;
  hasReview(orderId: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ReviewRepository implements IReviewRepository {
  constructor(private db: DbClient) {}

  async create(data: {
    orderId: string;
    restaurantId: string;
    userId: string;
    authorName: string;
    rating: number;
    comment: string;
  }): Promise<ReviewRow> {
    const [row] = await this.db
      .insert(review)
      .values({
        orderId: data.orderId,
        restaurantId: data.restaurantId,
        userId: data.userId,
        authorName: data.authorName,
        rating: data.rating,
        comment: data.comment,
      })
      .returning({
        id: review.id,
        orderId: review.orderId,
        authorName: review.authorName,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      });

    return row;
  }

  async findByRestaurantSlug(
    slug: string,
    limit: number,
  ): Promise<ReviewRow[]> {
    return this.db
      .select({
        id: review.id,
        orderId: review.orderId,
        authorName: review.authorName,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })
      .from(review)
      .innerJoin(restaurant, eq(restaurant.id, review.restaurantId))
      .where(eq(restaurant.slug, slug))
      .orderBy(desc(review.createdAt))
      .limit(limit);
  }

  async getStatsByRestaurantSlug(slug: string): Promise<ReviewStatsRow> {
    const [row] = await this.db
      .select({
        averageRating: avg(review.rating),
        totalReviews: count(review.id),
      })
      .from(review)
      .innerJoin(restaurant, eq(restaurant.id, review.restaurantId))
      .where(eq(restaurant.slug, slug));

    return {
      averageRating: row?.averageRating ?? null,
      totalReviews: String(row?.totalReviews ?? 0),
    };
  }

  async getOrderForReview(orderId: string): Promise<OrderOwnershipRow | null> {
    const rows = await this.db
      .select({
        id: order.id,
        customerId: order.customerId,
        status: order.status,
        restaurantId: sql<string>`(
          SELECT b.restaurant_id FROM branch b WHERE b.id = ${order.branchId}
        )`,
      })
      .from(order)
      .where(eq(order.id, orderId))
      .limit(1);

    return rows[0] ?? null;
  }

  async hasReview(orderId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: review.id })
      .from(review)
      .where(eq(review.orderId, orderId))
      .limit(1);

    return rows.length > 0;
  }
}
