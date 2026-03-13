import { and, asc, eq, inArray, max } from "drizzle-orm";
import {
  type BranchTableRecord,
  branchTable,
  type InsertBranchTable,
  type InsertTableSession,
  type TableSessionRecord,
  tableSession,
} from "@/shared/infra/db/schema";
import type { DbClient, DrizzleTransaction } from "@/shared/infra/db/types";
import type { RequestContext } from "@/shared/kernel/context";
import { TableCodeConflictError } from "../errors/table.errors";

export type TableWithSession = {
  table: BranchTableRecord;
  activeSession: TableSessionRecord | null;
};

export interface ITableRepository {
  findByBranchIdWithSessions(
    branchId: string,
    ctx?: RequestContext,
  ): Promise<TableWithSession[]>;
  findById(id: string, ctx?: RequestContext): Promise<BranchTableRecord | null>;
  create(
    data: InsertBranchTable,
    ctx?: RequestContext,
  ): Promise<BranchTableRecord>;
  update(
    id: string,
    data: Partial<InsertBranchTable>,
    ctx?: RequestContext,
  ): Promise<BranchTableRecord>;
  delete(id: string, ctx?: RequestContext): Promise<void>;
  findActiveSession(
    branchTableId: string,
    ctx?: RequestContext,
  ): Promise<TableSessionRecord | null>;
  findSessionById(
    sessionId: string,
    ctx?: RequestContext,
  ): Promise<TableSessionRecord | null>;
  createSession(
    data: InsertTableSession,
    ctx?: RequestContext,
  ): Promise<TableSessionRecord>;
  closeSession(
    sessionId: string,
    userId: string,
    ctx?: RequestContext,
  ): Promise<TableSessionRecord>;
  closeAllActiveSessions(
    branchId: string,
    userId: string,
    ctx?: RequestContext,
  ): Promise<number>;
  getNextSortOrder(branchId: string, ctx?: RequestContext): Promise<number>;
}

export class TableRepository implements ITableRepository {
  constructor(private db: DbClient) {}

  private getClient(ctx?: RequestContext): DbClient | DrizzleTransaction {
    return (ctx?.tx as DrizzleTransaction) ?? this.db;
  }

  async findByBranchIdWithSessions(
    branchId: string,
    ctx?: RequestContext,
  ): Promise<TableWithSession[]> {
    const client = this.getClient(ctx);
    const rows = await client
      .select({
        table: branchTable,
        session: tableSession,
      })
      .from(branchTable)
      .leftJoin(
        tableSession,
        and(
          eq(tableSession.branchTableId, branchTable.id),
          eq(tableSession.status, "active"),
        ),
      )
      .where(eq(branchTable.branchId, branchId))
      .orderBy(asc(branchTable.sortOrder));

    return rows.map((row) => ({
      table: row.table,
      activeSession: row.session,
    }));
  }

  async findById(
    id: string,
    ctx?: RequestContext,
  ): Promise<BranchTableRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(branchTable)
      .where(eq(branchTable.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async create(
    data: InsertBranchTable,
    ctx?: RequestContext,
  ): Promise<BranchTableRecord> {
    const client = this.getClient(ctx);
    try {
      const result = await client.insert(branchTable).values(data).returning();
      return result[0];
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        "code" in err &&
        (err as { code: string }).code === "23505"
      ) {
        throw new TableCodeConflictError(data.branchId, data.code);
      }
      throw err;
    }
  }

  async update(
    id: string,
    data: Partial<InsertBranchTable>,
    ctx?: RequestContext,
  ): Promise<BranchTableRecord> {
    const client = this.getClient(ctx);
    try {
      const result = await client
        .update(branchTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(branchTable.id, id))
        .returning();
      return result[0];
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        "code" in err &&
        (err as { code: string }).code === "23505"
      ) {
        throw new TableCodeConflictError(
          data.branchId ?? "unknown",
          data.code ?? "unknown",
        );
      }
      throw err;
    }
  }

  async delete(id: string, ctx?: RequestContext): Promise<void> {
    const client = this.getClient(ctx);
    await client.delete(branchTable).where(eq(branchTable.id, id));
  }

  async findActiveSession(
    branchTableId: string,
    ctx?: RequestContext,
  ): Promise<TableSessionRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(tableSession)
      .where(
        and(
          eq(tableSession.branchTableId, branchTableId),
          eq(tableSession.status, "active"),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async findSessionById(
    sessionId: string,
    ctx?: RequestContext,
  ): Promise<TableSessionRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(tableSession)
      .where(eq(tableSession.id, sessionId))
      .limit(1);

    return result[0] ?? null;
  }

  async createSession(
    data: InsertTableSession,
    ctx?: RequestContext,
  ): Promise<TableSessionRecord> {
    const client = this.getClient(ctx);
    const result = await client.insert(tableSession).values(data).returning();
    return result[0];
  }

  async closeSession(
    sessionId: string,
    userId: string,
    ctx?: RequestContext,
  ): Promise<TableSessionRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .update(tableSession)
      .set({
        status: "closed",
        closedAt: new Date(),
        closedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(tableSession.id, sessionId))
      .returning();
    return result[0];
  }

  async closeAllActiveSessions(
    branchId: string,
    userId: string,
    ctx?: RequestContext,
  ): Promise<number> {
    const client = this.getClient(ctx);

    const tableIds = client
      .select({ id: branchTable.id })
      .from(branchTable)
      .where(eq(branchTable.branchId, branchId));

    const result = await client
      .update(tableSession)
      .set({
        status: "closed",
        closedAt: new Date(),
        closedBy: userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(tableSession.branchTableId, tableIds),
          eq(tableSession.status, "active"),
        ),
      );

    return result.count;
  }

  async getNextSortOrder(
    branchId: string,
    ctx?: RequestContext,
  ): Promise<number> {
    const client = this.getClient(ctx);
    const result = await client
      .select({ maxSort: max(branchTable.sortOrder) })
      .from(branchTable)
      .where(eq(branchTable.branchId, branchId));

    return (result[0]?.maxSort ?? -1) + 1;
  }
}
