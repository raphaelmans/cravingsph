import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { branch } from "./branch";
import { tableSession } from "./table-session";

/**
 * Order table.
 * Tracks customer orders through the full lifecycle:
 * placed → accepted → preparing → ready → completed/cancelled.
 */
export const order = pgTable(
  "order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: varchar("order_number", { length: 20 }).notNull().unique(),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    orderType: varchar("order_type", { length: 20 }).notNull(), // 'dine-in' | 'pickup'
    customerName: varchar("customer_name", { length: 200 }),
    customerPhone: varchar("customer_phone", { length: 20 }),
    tableNumber: varchar("table_number", { length: 20 }),
    tableSessionId: uuid("table_session_id").references(() => tableSession.id, {
      onDelete: "set null",
    }),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("placed"),
    paymentStatus: varchar("payment_status", { length: 20 })
      .notNull()
      .default("pending"),
    paymentMethod: varchar("payment_method", { length: 50 }),
    paymentReference: varchar("payment_reference", { length: 200 }),
    paymentScreenshotUrl: text("payment_screenshot_url"),
    specialInstructions: text("special_instructions"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_order_branch_status").on(t.branchId, t.status),
    index("idx_order_customer").on(t.customerId),
    index("idx_order_created").on(t.createdAt),
    index("idx_order_table_session").on(t.tableSessionId),
  ],
);

export const OrderSchema = createSelectSchema(order);
export const InsertOrderSchema = createInsertSchema(order);

export type OrderRecord = z.infer<typeof OrderSchema>;
export type InsertOrder = z.infer<typeof InsertOrderSchema>;
