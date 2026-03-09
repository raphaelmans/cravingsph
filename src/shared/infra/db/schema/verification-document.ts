import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { restaurant } from "./restaurant";

/**
 * VerificationDocument table.
 * Documents uploaded for restaurant verification.
 * Types: 'business_registration' | 'valid_government_id' | 'business_permit'.
 * One document per type per restaurant.
 */
export const verificationDocument = pgTable(
  "verification_document",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurant.id, { onDelete: "cascade" }),
    documentType: varchar("document_type", { length: 50 }).notNull(),
    fileName: varchar("file_name", { length: 500 }),
    fileUrl: text("file_url"),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("idx_verification_document_restaurant").on(t.restaurantId),
    uniqueIndex("idx_verification_document_type").on(
      t.restaurantId,
      t.documentType,
    ),
  ],
);

export const VerificationDocumentSchema =
  createSelectSchema(verificationDocument);
export const InsertVerificationDocumentSchema =
  createInsertSchema(verificationDocument);

export type VerificationDocumentRecord = z.infer<
  typeof VerificationDocumentSchema
>;
export type InsertVerificationDocument = z.infer<
  typeof InsertVerificationDocumentSchema
>;
