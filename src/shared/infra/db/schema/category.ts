import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { branch } from "./branch";

/**
 * Category table.
 * Menu categories within a branch (e.g., "Chicken", "Drinks", "Desserts").
 */
export const category = pgTable(
  "category",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_category_branch").on(table.branchId),
    index("idx_category_sort").on(table.branchId, table.sortOrder),
  ],
);

export const CategorySchema = createSelectSchema(category);
export const InsertCategorySchema = createInsertSchema(category);

export type CategoryRecord = z.infer<typeof CategorySchema>;
export type InsertCategory = z.infer<typeof InsertCategorySchema>;
