import { desc, eq } from "drizzle-orm";
import { invitation, profile } from "@/shared/infra/db/schema";
import type { DbClient } from "@/shared/infra/db/types";

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export interface InvitationRow {
  id: string;
  token: string;
  email: string | null;
  restaurantName: string | null;
  status: string;
  createdBy: string;
  acceptedBy: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitationWithAcceptedEmailRow extends InvitationRow {
  acceptedByEmail: string | null;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IInvitationRepository {
  create(data: {
    token: string;
    email?: string;
    restaurantName?: string;
    createdBy: string;
    expiresAt: Date;
  }): Promise<InvitationRow>;
  findByToken(token: string): Promise<InvitationRow | null>;
  findById(id: string): Promise<InvitationRow | null>;
  findAll(opts?: {
    status?: string;
  }): Promise<InvitationWithAcceptedEmailRow[]>;
  updateStatus(
    id: string,
    status: string,
    acceptedBy?: string,
  ): Promise<InvitationRow>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class InvitationRepository implements IInvitationRepository {
  constructor(private db: DbClient) {}

  async create(data: {
    token: string;
    email?: string;
    restaurantName?: string;
    createdBy: string;
    expiresAt: Date;
  }): Promise<InvitationRow> {
    const [row] = await this.db
      .insert(invitation)
      .values({
        token: data.token,
        email: data.email,
        restaurantName: data.restaurantName,
        createdBy: data.createdBy,
        expiresAt: data.expiresAt,
      })
      .returning({
        id: invitation.id,
        token: invitation.token,
        email: invitation.email,
        restaurantName: invitation.restaurantName,
        status: invitation.status,
        createdBy: invitation.createdBy,
        acceptedBy: invitation.acceptedBy,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
      });

    return row;
  }

  async findByToken(token: string): Promise<InvitationRow | null> {
    const rows = await this.db
      .select({
        id: invitation.id,
        token: invitation.token,
        email: invitation.email,
        restaurantName: invitation.restaurantName,
        status: invitation.status,
        createdBy: invitation.createdBy,
        acceptedBy: invitation.acceptedBy,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
      })
      .from(invitation)
      .where(eq(invitation.token, token))
      .limit(1);

    return rows[0] ?? null;
  }

  async findById(id: string): Promise<InvitationRow | null> {
    const rows = await this.db
      .select({
        id: invitation.id,
        token: invitation.token,
        email: invitation.email,
        restaurantName: invitation.restaurantName,
        status: invitation.status,
        createdBy: invitation.createdBy,
        acceptedBy: invitation.acceptedBy,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
      })
      .from(invitation)
      .where(eq(invitation.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async findAll(opts?: {
    status?: string;
  }): Promise<InvitationWithAcceptedEmailRow[]> {
    const conditions = opts?.status
      ? eq(invitation.status, opts.status)
      : undefined;

    const rows = await this.db
      .select({
        id: invitation.id,
        token: invitation.token,
        email: invitation.email,
        restaurantName: invitation.restaurantName,
        status: invitation.status,
        createdBy: invitation.createdBy,
        acceptedBy: invitation.acceptedBy,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
        acceptedByEmail: profile.email,
      })
      .from(invitation)
      .leftJoin(profile, eq(profile.userId, invitation.acceptedBy))
      .where(conditions)
      .orderBy(desc(invitation.createdAt));

    return rows;
  }

  async updateStatus(
    id: string,
    status: string,
    acceptedBy?: string,
  ): Promise<InvitationRow> {
    const [row] = await this.db
      .update(invitation)
      .set({
        status,
        acceptedBy: acceptedBy ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(invitation.id, id))
      .returning({
        id: invitation.id,
        token: invitation.token,
        email: invitation.email,
        restaurantName: invitation.restaurantName,
        status: invitation.status,
        createdBy: invitation.createdBy,
        acceptedBy: invitation.acceptedBy,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
      });

    return row;
  }
}
