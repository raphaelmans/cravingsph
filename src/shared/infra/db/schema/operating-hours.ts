import {
  boolean,
  integer,
  pgTable,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { branch } from "./branch";

/**
 * OperatingHours table.
 * Weekly operating schedule for each branch.
 * dayOfWeek: 0=Monday ... 6=Sunday.
 * One row per branch per day.
 */
export const operatingHours = pgTable(
  "operating_hours",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(), // 0=Monday ... 6=Sunday
    opensAt: time("opens_at").notNull(),
    closesAt: time("closes_at").notNull(),
    isClosed: boolean("is_closed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("idx_operating_hours_branch_day").on(t.branchId, t.dayOfWeek),
  ],
);

export const OperatingHoursSchema = createSelectSchema(operatingHours);
export const InsertOperatingHoursSchema = createInsertSchema(operatingHours);

export type OperatingHoursRecord = z.infer<typeof OperatingHoursSchema>;
export type InsertOperatingHours = z.infer<typeof InsertOperatingHoursSchema>;
