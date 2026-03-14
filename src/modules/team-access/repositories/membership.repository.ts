import { and, eq } from "drizzle-orm";
import {
  type InsertTeamMembership,
  type TeamMembershipRecord,
  teamMembership,
} from "@/shared/infra/db/schema";
import type { DbClient, DrizzleTransaction } from "@/shared/infra/db/types";
import type { RequestContext } from "@/shared/kernel/context";

export interface IMembershipRepository {
  findById(
    id: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord | null>;
  findByUserAndOrg(
    userId: string,
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord | null>;
  findByOrg(
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord[]>;
  findByUser(
    userId: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord[]>;
  create(
    data: InsertTeamMembership,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord>;
  updateStatus(
    id: string,
    status: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord>;
}

export class MembershipRepository implements IMembershipRepository {
  constructor(private db: DbClient) {}

  private getClient(ctx?: RequestContext): DbClient | DrizzleTransaction {
    return (ctx?.tx as DrizzleTransaction) ?? this.db;
  }

  async findById(
    id: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(teamMembership)
      .where(eq(teamMembership.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findByUserAndOrg(
    userId: string,
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(teamMembership)
      .where(
        and(
          eq(teamMembership.userId, userId),
          eq(teamMembership.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async findByOrg(
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(teamMembership)
      .where(eq(teamMembership.organizationId, organizationId));
  }

  async findByUser(
    userId: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(teamMembership)
      .where(eq(teamMembership.userId, userId));
  }

  async create(
    data: InsertTeamMembership,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord> {
    const client = this.getClient(ctx);
    const result = await client.insert(teamMembership).values(data).returning();
    return result[0];
  }

  async updateStatus(
    id: string,
    status: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .update(teamMembership)
      .set({ status, updatedAt: new Date() })
      .where(eq(teamMembership.id, id))
      .returning();
    return result[0];
  }
}
