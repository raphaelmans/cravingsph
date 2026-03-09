import { and, eq } from "drizzle-orm";
import {
  type BranchRecord,
  branch,
  type InsertBranch,
} from "@/shared/infra/db/schema";
import type { DbClient, DrizzleTransaction } from "@/shared/infra/db/types";
import type { RequestContext } from "@/shared/kernel/context";

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
}
