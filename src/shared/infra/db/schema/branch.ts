import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { restaurant } from "./restaurant";

/**
 * Branch table.
 * Physical location of a restaurant.
 * Each branch has its own menu, URL slug, operating hours, and order queue.
 */
export const branch = pgTable(
  "branch",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurant.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    address: text("address"),
    street: varchar("street", { length: 200 }),
    barangay: varchar("barangay", { length: 100 }),
    province: varchar("province", { length: 100 }),
    city: varchar("city", { length: 100 }),
    phone: varchar("phone", { length: 20 }),
    coverUrl: text("cover_url"),
    isOrderingEnabled: boolean("is_ordering_enabled").default(true).notNull(),
    autoAcceptOrders: boolean("auto_accept_orders").default(false).notNull(),
    paymentCountdownMinutes: integer("payment_countdown_minutes")
      .default(15)
      .notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    amenities: jsonb("amenities").$type<string[]>().default([]),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_branch_restaurant").on(table.restaurantId),
    index("idx_branch_slug").on(table.slug),
    index("idx_branch_location").on(table.province, table.city),
  ],
);

export const BranchSchema = createSelectSchema(branch);
export const InsertBranchSchema = createInsertSchema(branch);

export type BranchRecord = z.infer<typeof BranchSchema>;
export type InsertBranch = z.infer<typeof InsertBranchSchema>;
