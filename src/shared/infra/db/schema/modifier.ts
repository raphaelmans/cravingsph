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
import { modifierGroup } from "./modifier-group";

/**
 * Modifier table.
 * Individual modifier options within a group (e.g., "Extra cheese +₱25").
 */
export const modifier = pgTable(
  "modifier",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    modifierGroupId: uuid("modifier_group_id")
      .notNull()
      .references(() => modifierGroup.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).default("0").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_modifier_group").on(table.modifierGroupId),
    index("idx_modifier_sort").on(table.modifierGroupId, table.sortOrder),
  ],
);

export const ModifierSchema = createSelectSchema(modifier);
export const InsertModifierSchema = createInsertSchema(modifier);

export type ModifierRecord = z.infer<typeof ModifierSchema>;
export type InsertModifier = z.infer<typeof InsertModifierSchema>;
