import {
  boolean,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { organization } from "./organization";

/**
 * PaymentMethod table.
 * Organization-scoped payment method configurations.
 * Types: 'gcash' | 'maya' | 'bank'.
 * Config-only — no gateway processing.
 */
export const paymentMethod = pgTable(
  "payment_method",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 20 }).notNull(), // 'gcash' | 'maya' | 'bank'
    accountName: varchar("account_name", { length: 200 }).notNull(),
    accountNumber: varchar("account_number", { length: 100 }).notNull(),
    bankName: varchar("bank_name", { length: 200 }),
    isDefault: boolean("is_default").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("idx_payment_method_org").on(t.organizationId)],
);

export const PaymentMethodSchema = createSelectSchema(paymentMethod);
export const InsertPaymentMethodSchema = createInsertSchema(paymentMethod);

export type PaymentMethodRecord = z.infer<typeof PaymentMethodSchema>;
export type InsertPaymentMethod = z.infer<typeof InsertPaymentMethodSchema>;
