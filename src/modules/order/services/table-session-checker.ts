import { eq } from "drizzle-orm";
import { branchTable, tableSession } from "@/shared/infra/db/schema";
import type { DbClient } from "@/shared/infra/db/types";

export interface ActiveSessionInfo {
  id: string;
  branchTableId: string;
  tableLabel: string;
  tableCode: string;
  status: string;
}

export interface ITableSessionChecker {
  getActiveSession(tableSessionId: string): Promise<ActiveSessionInfo | null>;
}

export class TableSessionChecker implements ITableSessionChecker {
  constructor(private db: DbClient) {}

  async getActiveSession(
    tableSessionId: string,
  ): Promise<ActiveSessionInfo | null> {
    const rows = await this.db
      .select({
        id: tableSession.id,
        branchTableId: tableSession.branchTableId,
        tableLabel: branchTable.label,
        tableCode: branchTable.code,
        status: tableSession.status,
      })
      .from(tableSession)
      .innerJoin(branchTable, eq(branchTable.id, tableSession.branchTableId))
      .where(eq(tableSession.id, tableSessionId))
      .limit(1);

    return rows[0] ?? null;
  }
}
