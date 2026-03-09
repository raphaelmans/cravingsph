import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { organization } from "./organization";

/**
 * Restaurant table.
 * Brand entity under an organization.
 * e.g., "Jollibee" is the restaurant, "Jollibee Makati" is a branch.
 */
export const restaurant = pgTable(
  "restaurant",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    description: text("description"),
    cuisineType: varchar("cuisine_type", { length: 100 }),
    logoUrl: text("logo_url"),
    coverUrl: text("cover_url"),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    verificationStatus: varchar("verification_status", { length: 20 })
      .default("pending")
      .notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_restaurant_org").on(table.organizationId),
    index("idx_restaurant_slug").on(table.slug),
    index("idx_restaurant_cuisine").on(table.cuisineType),
    index("idx_restaurant_verification").on(table.verificationStatus),
  ],
);

export const RestaurantSchema = createSelectSchema(restaurant);
export const InsertRestaurantSchema = createInsertSchema(restaurant);

export type RestaurantRecord = z.infer<typeof RestaurantSchema>;
export type InsertRestaurant = z.infer<typeof InsertRestaurantSchema>;
