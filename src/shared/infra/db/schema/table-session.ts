import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { branchTable } from "./branch-table";

/**
 * Table session.
 * Tracks the lifecycle of a dining session at a physical table —
 * from QR scan (opened) through to checkout (closed).
 */
export const tableSession = pgTable(
  "table_session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    branchTableId: uuid("branch_table_id")
      .notNull()
      .references(() => branchTable.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    openedAt: timestamp("opened_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    openedBy: uuid("opened_by").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    closedBy: uuid("closed_by").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_table_session_branch_table").on(table.branchTableId),
    index("idx_table_session_branch_table_status").on(
      table.branchTableId,
      table.status,
    ),
    index("idx_table_session_opened_at").on(table.openedAt),
  ],
);

export const TableSessionSchema = createSelectSchema(tableSession);
export const InsertTableSessionSchema = createInsertSchema(tableSession);

export type TableSessionRecord = z.infer<typeof TableSessionSchema>;
export type InsertTableSession = z.infer<typeof InsertTableSessionSchema>;
