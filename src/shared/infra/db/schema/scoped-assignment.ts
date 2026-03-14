import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { teamMembership } from "./team-membership";

/**
 * Scoped assignment table.
 * Answers: "What can this user do, and where?"
 * Links a team membership to a specific role within a scope (business or branch).
 */
export const scopedAssignment = pgTable(
  "scoped_assignment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    membershipId: uuid("membership_id")
      .notNull()
      .references(() => teamMembership.id, { onDelete: "cascade" }),
    roleTemplate: varchar("role_template", { length: 50 }).notNull(),
    scopeType: varchar("scope_type", { length: 20 }).notNull(),
    scopeId: uuid("scope_id").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("idx_scoped_assignment_membership").on(t.membershipId),
    index("idx_scoped_assignment_scope").on(t.scopeType, t.scopeId),
    index("idx_scoped_assignment_role").on(t.roleTemplate),
  ],
);

export const ScopedAssignmentSchema = createSelectSchema(scopedAssignment);
export const InsertScopedAssignmentSchema =
  createInsertSchema(scopedAssignment);

export type ScopedAssignmentRecord = z.infer<typeof ScopedAssignmentSchema>;
export type InsertScopedAssignment = z.infer<
  typeof InsertScopedAssignmentSchema
>;
