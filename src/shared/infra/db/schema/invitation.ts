import {
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

/**
 * Invitation table.
 * Invite-only owner onboarding tokens created by admins.
 * Each token can be accepted once by a registering owner.
 */
export const invitation = pgTable(
  "invitation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: varchar("token", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }),
    restaurantName: varchar("restaurant_name", { length: 200 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    acceptedBy: uuid("accepted_by").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("idx_invitation_token").on(t.token),
    index("idx_invitation_status").on(t.status),
  ],
);

export const InvitationSchema = createSelectSchema(invitation);
export const InsertInvitationSchema = createInsertSchema(invitation);

export type InvitationRecord = z.infer<typeof InvitationSchema>;
export type InsertInvitation = z.infer<typeof InsertInvitationSchema>;
