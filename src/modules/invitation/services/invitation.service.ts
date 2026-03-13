import crypto from "node:crypto";
import type {
  CreateInvitationInput,
  InvitationDTO,
  ListInvitationsInput,
} from "../dtos/invitation.dto";
import {
  InvitationAlreadyAcceptedError,
  InvitationExpiredError,
  InvitationNotFoundError,
} from "../errors/invitation.errors";
import type {
  IInvitationRepository,
  InvitationRow,
  InvitationWithAcceptedEmailRow,
} from "../repositories/invitation.repository";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IInvitationService {
  create(
    input: CreateInvitationInput,
    adminUserId: string,
  ): Promise<InvitationDTO>;
  list(input?: ListInvitationsInput): Promise<InvitationDTO[]>;
  revoke(id: string): Promise<InvitationDTO>;
  validate(token: string): Promise<InvitationDTO>;
  accept(token: string, userId: string): Promise<InvitationDTO>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class InvitationService implements IInvitationService {
  constructor(private repository: IInvitationRepository) {}

  async create(
    input: CreateInvitationInput,
    adminUserId: string,
  ): Promise<InvitationDTO> {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

    const row = await this.repository.create({
      token,
      email: input.email,
      restaurantName: input.restaurantName,
      createdBy: adminUserId,
      expiresAt,
    });

    return this.toDTO(row);
  }

  async list(input?: ListInvitationsInput): Promise<InvitationDTO[]> {
    const rows = await this.repository.findAll({
      status: input?.status,
    });

    return rows.map((r) => this.toDTOWithEmail(r));
  }

  async revoke(id: string): Promise<InvitationDTO> {
    const row = await this.repository.findById(id);
    if (!row) {
      throw new InvitationNotFoundError(id);
    }

    if (row.status !== "pending") {
      throw new InvitationAlreadyAcceptedError();
    }

    const updated = await this.repository.updateStatus(id, "expired");
    return this.toDTO(updated);
  }

  async validate(token: string): Promise<InvitationDTO> {
    const row = await this.repository.findByToken(token);
    if (!row) {
      throw new InvitationNotFoundError(token);
    }

    if (row.status !== "pending") {
      throw new InvitationAlreadyAcceptedError();
    }

    if (new Date() > row.expiresAt) {
      throw new InvitationExpiredError();
    }

    return this.toDTO(row);
  }

  async accept(token: string, userId: string): Promise<InvitationDTO> {
    const row = await this.repository.findByToken(token);
    if (!row) {
      throw new InvitationNotFoundError(token);
    }

    if (row.status !== "pending") {
      throw new InvitationAlreadyAcceptedError();
    }

    if (new Date() > row.expiresAt) {
      throw new InvitationExpiredError();
    }

    const updated = await this.repository.updateStatus(
      row.id,
      "accepted",
      userId,
    );

    return this.toDTO(updated);
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private toDTO(row: InvitationRow): InvitationDTO {
    return {
      id: row.id,
      token: row.token,
      email: row.email,
      restaurantName: row.restaurantName,
      status: row.status,
      createdBy: row.createdBy,
      acceptedBy: row.acceptedBy,
      acceptedByEmail: null,
      expiresAt: row.expiresAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private toDTOWithEmail(row: InvitationWithAcceptedEmailRow): InvitationDTO {
    return {
      ...this.toDTO(row),
      acceptedByEmail: row.acceptedByEmail,
    };
  }
}
