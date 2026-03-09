import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { order } from "./order";
import { restaurant } from "./restaurant";

/**
 * Review table.
 * Customer reviews tied to real completed orders.
 * One review per order. Rating 1-5 stars.
 */
export const review = pgTable(
  "review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurant.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    authorName: varchar("author_name", { length: 200 }),
    rating: integer("rating").notNull(), // 1-5
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_review_restaurant").on(t.restaurantId),
    index("idx_review_user").on(t.userId),
    uniqueIndex("idx_review_order").on(t.orderId), // one review per order
  ],
);

export const ReviewSchema = createSelectSchema(review);
export const InsertReviewSchema = createInsertSchema(review);

export type ReviewRecord = z.infer<typeof ReviewSchema>;
export type InsertReview = z.infer<typeof InsertReviewSchema>;
