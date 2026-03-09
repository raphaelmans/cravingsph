import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { restaurant } from "./restaurant";

/**
 * SavedRestaurant table.
 * Tracks which restaurants a user has bookmarked/saved for later.
 * One save per user per restaurant.
 */
export const savedRestaurant = pgTable(
  "saved_restaurant",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurant.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("idx_saved_restaurant_user_restaurant").on(
      t.userId,
      t.restaurantId,
    ),
    index("idx_saved_restaurant_user").on(t.userId),
  ],
);

export const SavedRestaurantSchema = createSelectSchema(savedRestaurant);
export const InsertSavedRestaurantSchema = createInsertSchema(savedRestaurant);

export type SavedRestaurantRecord = z.infer<typeof SavedRestaurantSchema>;
export type InsertSavedRestaurant = z.infer<typeof InsertSavedRestaurantSchema>;
