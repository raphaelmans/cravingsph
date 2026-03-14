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
 * Team membership table.
 * Answers: "Is this user part of this business ecosystem?"
 * Links a user to an organization as a team member.
 */
export const teamMembership = pgTable(
  "team_membership",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("idx_team_membership_user_org").on(t.userId, t.organizationId),
    index("idx_team_membership_org").on(t.organizationId),
  ],
);

export const TeamMembershipSchema = createSelectSchema(teamMembership);
export const InsertTeamMembershipSchema = createInsertSchema(teamMembership);

export type TeamMembershipRecord = z.infer<typeof TeamMembershipSchema>;
export type InsertTeamMembership = z.infer<typeof InsertTeamMembershipSchema>;
