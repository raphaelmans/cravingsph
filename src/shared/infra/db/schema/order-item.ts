import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { itemVariant } from "./item-variant";
import { menuItem } from "./menu-item";
import { order } from "./order";

/**
 * OrderItem table.
 * Line items within an order.
 * References the original menu item/variant for traceability,
 * but stores name and price at time of purchase.
 */
export const orderItem = pgTable(
  "order_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    menuItemId: uuid("menu_item_id").references(() => menuItem.id, {
      onDelete: "set null",
    }),
    itemVariantId: uuid("item_variant_id").references(() => itemVariant.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 200 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    modifiers: jsonb("modifiers"), // [{ name, price }]
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_order_item_order").on(t.orderId)],
);

export const OrderItemSchema = createSelectSchema(orderItem);
export const InsertOrderItemSchema = createInsertSchema(orderItem);

export type OrderItemRecord = z.infer<typeof OrderItemSchema>;
export type InsertOrderItem = z.infer<typeof InsertOrderItemSchema>;
