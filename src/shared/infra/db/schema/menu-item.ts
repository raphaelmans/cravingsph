import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { category } from "./category";

/**
 * MenuItem table.
 * Individual food/drink items within a category.
 * Has a base price, optional variants, and optional modifier groups.
 */
export const menuItem = pgTable(
  "menu_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_menu_item_category").on(table.categoryId),
    index("idx_menu_item_sort").on(table.categoryId, table.sortOrder),
  ],
);

export const MenuItemSchema = createSelectSchema(menuItem);
export const InsertMenuItemSchema = createInsertSchema(menuItem);

export type MenuItemRecord = z.infer<typeof MenuItemSchema>;
export type InsertMenuItem = z.infer<typeof InsertMenuItemSchema>;
