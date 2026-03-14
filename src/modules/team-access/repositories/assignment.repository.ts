import { and, eq } from "drizzle-orm";
import {
  type InsertScopedAssignment,
  type ScopedAssignmentRecord,
  scopedAssignment,
  teamMembership,
} from "@/shared/infra/db/schema";
import type { DbClient, DrizzleTransaction } from "@/shared/infra/db/types";
import type { RequestContext } from "@/shared/kernel/context";

export interface IAssignmentRepository {
  findById(
    id: string,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord | null>;
  findByMembership(
    membershipId: string,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord[]>;
  findByUserAndScope(
    userId: string,
    scopeType: string,
    scopeId: string,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord | null>;
  findActiveByUser(
    userId: string,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord[]>;
  create(
    data: InsertScopedAssignment,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord>;
  revoke(id: string, ctx?: RequestContext): Promise<ScopedAssignmentRecord>;
}

export class AssignmentRepository implements IAssignmentRepository {
  constructor(private db: DbClient) {}

  private getClient(ctx?: RequestContext): DbClient | DrizzleTransaction {
    return (ctx?.tx as DrizzleTransaction) ?? this.db;
  }

  async findById(
    id: string,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(scopedAssignment)
      .where(eq(scopedAssignment.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findByMembership(
    membershipId: string,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(scopedAssignment)
      .where(eq(scopedAssignment.membershipId, membershipId));
  }

  async findByUserAndScope(
    userId: string,
    scopeType: string,
    scopeId: string,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select({
        id: scopedAssignment.id,
        membershipId: scopedAssignment.membershipId,
        roleTemplate: scopedAssignment.roleTemplate,
        scopeType: scopedAssignment.scopeType,
        scopeId: scopedAssignment.scopeId,
        status: scopedAssignment.status,
        createdAt: scopedAssignment.createdAt,
        updatedAt: scopedAssignment.updatedAt,
      })
      .from(scopedAssignment)
      .innerJoin(
        teamMembership,
        eq(scopedAssignment.membershipId, teamMembership.id),
      )
      .where(
        and(
          eq(teamMembership.userId, userId),
          eq(teamMembership.status, "active"),
          eq(scopedAssignment.scopeType, scopeType),
          eq(scopedAssignment.scopeId, scopeId),
          eq(scopedAssignment.status, "active"),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async findActiveByUser(
    userId: string,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select({
        id: scopedAssignment.id,
        membershipId: scopedAssignment.membershipId,
        roleTemplate: scopedAssignment.roleTemplate,
        scopeType: scopedAssignment.scopeType,
        scopeId: scopedAssignment.scopeId,
        status: scopedAssignment.status,
        createdAt: scopedAssignment.createdAt,
        updatedAt: scopedAssignment.updatedAt,
      })
      .from(scopedAssignment)
      .innerJoin(
        teamMembership,
        eq(scopedAssignment.membershipId, teamMembership.id),
      )
      .where(
        and(
          eq(teamMembership.userId, userId),
          eq(teamMembership.status, "active"),
          eq(scopedAssignment.status, "active"),
        ),
      );
  }

  async create(
    data: InsertScopedAssignment,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .insert(scopedAssignment)
      .values(data)
      .returning();
    return result[0];
  }

  async revoke(
    id: string,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .update(scopedAssignment)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(eq(scopedAssignment.id, id))
      .returning();
    return result[0];
  }
}
