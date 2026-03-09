import {
  boolean,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { menuItem } from "./menu-item";

/**
 * ModifierGroup table.
 * Groups of modifiers for a menu item (e.g., "Choose your sauce", "Add-ons").
 * Has min/max selection rules to enforce constraints.
 */
export const modifierGroup = pgTable(
  "modifier_group",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    menuItemId: uuid("menu_item_id")
      .notNull()
      .references(() => menuItem.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
    minSelections: integer("min_selections").default(0).notNull(),
    maxSelections: integer("max_selections").default(1).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_modifier_group_menu_item").on(table.menuItemId),
    index("idx_modifier_group_sort").on(table.menuItemId, table.sortOrder),
  ],
);

export const ModifierGroupSchema = createSelectSchema(modifierGroup);
export const InsertModifierGroupSchema = createInsertSchema(modifierGroup);

export type ModifierGroupRecord = z.infer<typeof ModifierGroupSchema>;
export type InsertModifierGroup = z.infer<typeof InsertModifierGroupSchema>;
