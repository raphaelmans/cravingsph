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
import { order } from "./order";

/**
 * OrderStatusHistory table.
 * Audit trail for order state changes.
 * Every status transition is recorded with who made it and when.
 */
export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    fromStatus: varchar("from_status", { length: 20 }),
    toStatus: varchar("to_status", { length: 20 }).notNull(),
    changedBy: uuid("changed_by").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_order_status_history_order").on(t.orderId)],
);

export const OrderStatusHistorySchema = createSelectSchema(orderStatusHistory);
export const InsertOrderStatusHistorySchema =
  createInsertSchema(orderStatusHistory);

export type OrderStatusHistoryRecord = z.infer<typeof OrderStatusHistorySchema>;
export type InsertOrderStatusHistory = z.infer<
  typeof InsertOrderStatusHistorySchema
>;
