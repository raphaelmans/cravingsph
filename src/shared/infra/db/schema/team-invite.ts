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
import { organization } from "./organization";

/**
 * Team invite table.
 * Owner-initiated invitations for team members with a specific role and scope.
 */
export const teamInvite = pgTable(
  "team_invite",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    token: varchar("token", { length: 100 }).notNull(),
    roleTemplate: varchar("role_template", { length: 50 }).notNull(),
    scopeType: varchar("scope_type", { length: 20 }).notNull(),
    scopeId: uuid("scope_id").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("idx_team_invite_token").on(t.token),
    index("idx_team_invite_org").on(t.organizationId),
    index("idx_team_invite_email").on(t.email),
  ],
);

export const TeamInviteSchema = createSelectSchema(teamInvite);
export const InsertTeamInviteSchema = createInsertSchema(teamInvite);

export type TeamInviteRecord = z.infer<typeof TeamInviteSchema>;
export type InsertTeamInvite = z.infer<typeof InsertTeamInviteSchema>;
