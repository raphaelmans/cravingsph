import {
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { menuItem } from "./menu-item";

/**
 * ItemVariant table.
 * Size/type variants for menu items (e.g., Small ₱99, Medium ₱149, Large ₱199).
 * When variants exist, the variant price replaces the item's base price.
 */
export const itemVariant = pgTable(
  "item_variant",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    menuItemId: uuid("menu_item_id")
      .notNull()
      .references(() => menuItem.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_item_variant_menu_item").on(table.menuItemId),
    index("idx_item_variant_sort").on(table.menuItemId, table.sortOrder),
  ],
);

export const ItemVariantSchema = createSelectSchema(itemVariant);
export const InsertItemVariantSchema = createInsertSchema(itemVariant);

export type ItemVariantRecord = z.infer<typeof ItemVariantSchema>;
export type InsertItemVariant = z.infer<typeof InsertItemVariantSchema>;
