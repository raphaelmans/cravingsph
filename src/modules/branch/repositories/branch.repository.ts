import { and, eq } from "drizzle-orm";
import {
  type BranchRecord,
  branch,
  branchTable,
  type InsertBranch,
  type OperatingHoursRecord,
  operatingHours,
  tableSession,
} from "@/shared/infra/db/schema";
import type { DbClient, DrizzleTransaction } from "@/shared/infra/db/types";
import type { RequestContext } from "@/shared/kernel/context";
import type { OperatingHourEntry } from "../dtos/branch.dto";

export interface IBranchRepository {
  findById(id: string, ctx?: RequestContext): Promise<BranchRecord | null>;
  findBySlug(
    restaurantId: string,
    slug: string,
    ctx?: RequestContext,
  ): Promise<BranchRecord | null>;
  findByRestaurantId(
    restaurantId: string,
    ctx?: RequestContext,
  ): Promise<BranchRecord[]>;
  create(data: InsertBranch, ctx?: RequestContext): Promise<BranchRecord>;
  update(
    id: string,
    data: Partial<InsertBranch>,
    ctx?: RequestContext,
  ): Promise<BranchRecord>;
  findOperatingHours(
    branchId: string,
    ctx?: RequestContext,
  ): Promise<OperatingHoursRecord[]>;
  upsertOperatingHours(
    branchId: string,
    hours: OperatingHourEntry[],
    ctx?: RequestContext,
  ): Promise<void>;
  findActiveTablesWithSessions(
    branchId: string,
  ): Promise<
    { tableId: string; label: string; code: string; activeSessionId: string }[]
  >;
}

export class BranchRepository implements IBranchRepository {
  constructor(private db: DbClient) {}

  private getClient(ctx?: RequestContext): DbClient | DrizzleTransaction {
    return (ctx?.tx as DrizzleTransaction) ?? this.db;
  }

  async findById(
    id: string,
    ctx?: RequestContext,
  ): Promise<BranchRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(branch)
      .where(eq(branch.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findBySlug(
    restaurantId: string,
    slug: string,
    ctx?: RequestContext,
  ): Promise<BranchRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(branch)
      .where(and(eq(branch.restaurantId, restaurantId), eq(branch.slug, slug)))
      .limit(1);

    return result[0] ?? null;
  }

  async findByRestaurantId(
    restaurantId: string,
    ctx?: RequestContext,
  ): Promise<BranchRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(branch)
      .where(eq(branch.restaurantId, restaurantId));
  }

  async create(
    data: InsertBranch,
    ctx?: RequestContext,
  ): Promise<BranchRecord> {
    const client = this.getClient(ctx);
    const result = await client.insert(branch).values(data).returning();
    return result[0];
  }

  async update(
    id: string,
    data: Partial<InsertBranch>,
    ctx?: RequestContext,
  ): Promise<BranchRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .update(branch)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(branch.id, id))
      .returning();

    return result[0];
  }

  async findOperatingHours(
    branchId: string,
    ctx?: RequestContext,
  ): Promise<OperatingHoursRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(operatingHours)
      .where(eq(operatingHours.branchId, branchId))
      .orderBy(operatingHours.dayOfWeek, operatingHours.slotIndex);
  }

  async upsertOperatingHours(
    branchId: string,
    hours: OperatingHourEntry[],
    ctx?: RequestContext,
  ): Promise<void> {
    const client = this.getClient(ctx);
    const now = new Date();

    // Delete all existing rows for this branch, then reinsert.
    // This handles slot additions/removals cleanly since the unique
    // constraint is now (branchId, dayOfWeek, slotIndex).
    await client
      .delete(operatingHours)
      .where(eq(operatingHours.branchId, branchId));

    if (hours.length > 0) {
      await client.insert(operatingHours).values(
        hours.map((entry) => ({
          branchId,
          dayOfWeek: entry.dayOfWeek,
          slotIndex: entry.slotIndex,
          opensAt: entry.opensAt,
          closesAt: entry.closesAt,
          isClosed: entry.isClosed,
          createdAt: now,
          updatedAt: now,
        })),
      );
    }
  }

  async findActiveTablesWithSessions(
    branchId: string,
  ): Promise<
    { tableId: string; label: string; code: string; activeSessionId: string }[]
  > {
    const rows = await this.db
      .select({
        tableId: branchTable.id,
        label: branchTable.label,
        code: branchTable.code,
        activeSessionId: tableSession.id,
      })
      .from(branchTable)
      .innerJoin(tableSession, eq(tableSession.branchTableId, branchTable.id))
      .where(
        and(
          eq(branchTable.branchId, branchId),
          eq(branchTable.isActive, true),
          eq(tableSession.status, "active"),
        ),
      )
      .orderBy(branchTable.sortOrder);

    return rows;
  }
}
