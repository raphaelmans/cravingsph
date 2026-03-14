import type { TeamMembershipRecord } from "@/shared/infra/db/schema";
import { logger } from "@/shared/infra/logger";
import type { RequestContext } from "@/shared/kernel/context";
import type { CreateMembershipDTO } from "../dtos/team-access.dto";
import {
  MembershipAlreadyExistsError,
  MembershipNotFoundError,
} from "../errors/team-access.errors";
import type { IMembershipRepository } from "../repositories/membership.repository";

export interface IMembershipService {
  create(
    data: CreateMembershipDTO,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord>;
  revoke(membershipId: string, ctx?: RequestContext): Promise<void>;
  findByUserAndOrg(
    userId: string,
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord | null>;
  findByOrg(
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord[]>;
}

export class MembershipService implements IMembershipService {
  constructor(private membershipRepository: IMembershipRepository) {}

  async create(
    data: CreateMembershipDTO,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord> {
    const existing = await this.membershipRepository.findByUserAndOrg(
      data.userId,
      data.organizationId,
      ctx,
    );

    if (existing) {
      throw new MembershipAlreadyExistsError(data.userId, data.organizationId);
    }

    const membership = await this.membershipRepository.create(
      {
        userId: data.userId,
        organizationId: data.organizationId,
        status: "active",
        joinedAt: new Date(),
      },
      ctx,
    );

    logger.info(
      {
        event: "team_membership.created",
        membershipId: membership.id,
        userId: data.userId,
        organizationId: data.organizationId,
      },
      "Team membership created",
    );

    return membership;
  }

  async revoke(membershipId: string, ctx?: RequestContext): Promise<void> {
    const membership = await this.membershipRepository.findById(
      membershipId,
      ctx,
    );

    if (!membership) {
      throw new MembershipNotFoundError(membershipId);
    }

    await this.membershipRepository.updateStatus(membershipId, "revoked", ctx);

    logger.info(
      {
        event: "team_membership.revoked",
        membershipId,
        userId: membership.userId,
      },
      "Team membership revoked",
    );
  }

  async findByUserAndOrg(
    userId: string,
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord | null> {
    return this.membershipRepository.findByUserAndOrg(
      userId,
      organizationId,
      ctx,
    );
  }

  async findByOrg(
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<TeamMembershipRecord[]> {
    return this.membershipRepository.findByOrg(organizationId, ctx);
  }
}
