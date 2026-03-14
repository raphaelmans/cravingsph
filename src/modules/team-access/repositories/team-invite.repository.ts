import { and, eq } from "drizzle-orm";
import {
  type InsertTeamInvite,
  type TeamInviteRecord,
  teamInvite,
} from "@/shared/infra/db/schema";
import type { DbClient, DrizzleTransaction } from "@/shared/infra/db/types";
import type { RequestContext } from "@/shared/kernel/context";

export interface ITeamInviteRepository {
  findById(id: string, ctx?: RequestContext): Promise<TeamInviteRecord | null>;
  findByToken(
    token: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord | null>;
  findByOrg(
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord[]>;
  findByOrgAndStatus(
    organizationId: string,
    status: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord[]>;
  create(
    data: InsertTeamInvite,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord>;
  updateStatus(
    id: string,
    status: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord>;
}

export class TeamInviteRepository implements ITeamInviteRepository {
  constructor(private db: DbClient) {}

  private getClient(ctx?: RequestContext): DbClient | DrizzleTransaction {
    return (ctx?.tx as DrizzleTransaction) ?? this.db;
  }

  async findById(
    id: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(teamInvite)
      .where(eq(teamInvite.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findByToken(
    token: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(teamInvite)
      .where(eq(teamInvite.token, token))
      .limit(1);

    return result[0] ?? null;
  }

  async findByOrg(
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(teamInvite)
      .where(eq(teamInvite.organizationId, organizationId));
  }

  async findByOrgAndStatus(
    organizationId: string,
    status: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(teamInvite)
      .where(
        and(
          eq(teamInvite.organizationId, organizationId),
          eq(teamInvite.status, status),
        ),
      );
  }

  async create(
    data: InsertTeamInvite,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord> {
    const client = this.getClient(ctx);
    const result = await client.insert(teamInvite).values(data).returning();
    return result[0];
  }

  async updateStatus(
    id: string,
    status: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .update(teamInvite)
      .set({ status })
      .where(eq(teamInvite.id, id))
      .returning();
    return result[0];
  }
}
