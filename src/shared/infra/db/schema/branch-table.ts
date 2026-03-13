import {
  boolean,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { branch } from "./branch";

/**
 * Branch table (physical dining table).
 * Represents a numbered table or seat within a branch,
 * identified by a QR code for dine-in ordering.
 */
export const branchTable = pgTable(
  "branch_table",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 50 }).notNull(),
    code: varchar("code", { length: 20 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_branch_table_branch_code").on(table.branchId, table.code),
    index("idx_branch_table_branch").on(table.branchId),
    index("idx_branch_table_sort").on(table.branchId, table.sortOrder),
  ],
);

export const BranchTableSchema = createSelectSchema(branchTable);
export const InsertBranchTableSchema = createInsertSchema(branchTable);

export type BranchTableRecord = z.infer<typeof BranchTableSchema>;
export type InsertBranchTable = z.infer<typeof InsertBranchTableSchema>;
