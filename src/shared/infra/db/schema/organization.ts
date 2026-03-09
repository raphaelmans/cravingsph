import {
  boolean,
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

/**
 * Organization table.
 * Top-level entity for restaurant owners.
 * One owner can have one organization, which contains multiple restaurants.
 */
export const organization = pgTable(
  "organization",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    description: text("description"),
    logoUrl: text("logo_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_organization_owner").on(table.ownerId),
    index("idx_organization_slug").on(table.slug),
  ],
);

export const OrganizationSchema = createSelectSchema(organization);
export const InsertOrganizationSchema = createInsertSchema(organization);

export type OrganizationRecord = z.infer<typeof OrganizationSchema>;
export type InsertOrganization = z.infer<typeof InsertOrganizationSchema>;
