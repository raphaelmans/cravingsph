import { eq } from "drizzle-orm";
import { branch } from "@/shared/infra/db/schema";
import type { DbClient } from "@/shared/infra/db/types";
import type { IBranchChecker } from "./order.service";

export class BranchChecker implements IBranchChecker {
  constructor(private db: DbClient) {}

  async isOrderingEnabled(branchId: string): Promise<boolean> {
    const rows = await this.db
      .select({ isOrderingEnabled: branch.isOrderingEnabled })
      .from(branch)
      .where(eq(branch.id, branchId))
      .limit(1);

    return rows[0]?.isOrderingEnabled ?? false;
  }
}
