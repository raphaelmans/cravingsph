import { randomBytes } from "node:crypto";
import type { IBranchRepository } from "@/modules/branch/repositories/branch.repository";
import type { IRestaurantRepository } from "@/modules/restaurant/repositories/restaurant.repository";
import type { TeamInviteRecord } from "@/shared/infra/db/schema";
import { logger } from "@/shared/infra/logger";
import type { RequestContext } from "@/shared/kernel/context";
import {
  type CreateTeamInviteDTO,
  ROLE_SCOPE_MAP,
} from "../dtos/team-access.dto";
import {
  InvalidRoleTemplateError,
  ScopeNotInOrganizationError,
  TeamInviteAlreadyAcceptedError,
  TeamInviteExpiredError,
  TeamInviteNotFoundError,
  TeamInviteNotPendingError,
} from "../errors/team-access.errors";
import type { ITeamInviteRepository } from "../repositories/team-invite.repository";

const INVITE_EXPIRY_DAYS = 7;

export interface IInviteService {
  create(
    data: CreateTeamInviteDTO,
    invitedBy: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord>;
  list(
    organizationId: string,
    status?: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord[]>;
  revoke(inviteId: string, ctx?: RequestContext): Promise<void>;
  validate(token: string, ctx?: RequestContext): Promise<TeamInviteRecord>;
}

export class InviteService implements IInviteService {
  constructor(
    private inviteRepository: ITeamInviteRepository,
    private restaurantRepository: IRestaurantRepository,
    private branchRepository: IBranchRepository,
  ) {}

  async create(
    data: CreateTeamInviteDTO,
    invitedBy: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord> {
    // Validate role/scope combination
    const expectedScope = ROLE_SCOPE_MAP[data.roleTemplate];
    if (expectedScope !== data.scopeType) {
      throw new InvalidRoleTemplateError(data.roleTemplate, data.scopeType);
    }

    // Validate scope target belongs to org
    await this.validateScopeBelongsToOrg(
      data.scopeType,
      data.scopeId,
      data.organizationId,
      ctx,
    );

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    const invite = await this.inviteRepository.create(
      {
        organizationId: data.organizationId,
        invitedBy,
        email: data.email,
        token,
        roleTemplate: data.roleTemplate,
        scopeType: data.scopeType,
        scopeId: data.scopeId,
        status: "pending",
        expiresAt,
      },
      ctx,
    );

    logger.info(
      {
        event: "team_invite.created",
        inviteId: invite.id,
        organizationId: data.organizationId,
        email: data.email,
        roleTemplate: data.roleTemplate,
        scopeType: data.scopeType,
      },
      "Team invite created",
    );

    return invite;
  }

  async list(
    organizationId: string,
    status?: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord[]> {
    if (status) {
      return this.inviteRepository.findByOrgAndStatus(
        organizationId,
        status,
        ctx,
      );
    }
    return this.inviteRepository.findByOrg(organizationId, ctx);
  }

  async revoke(inviteId: string, ctx?: RequestContext): Promise<void> {
    const invite = await this.inviteRepository.findById(inviteId, ctx);

    if (!invite) {
      throw new TeamInviteNotFoundError(inviteId);
    }

    if (invite.status !== "pending") {
      throw new TeamInviteNotPendingError(inviteId, invite.status);
    }

    await this.inviteRepository.updateStatus(inviteId, "revoked", ctx);

    logger.info(
      {
        event: "team_invite.revoked",
        inviteId,
        organizationId: invite.organizationId,
      },
      "Team invite revoked",
    );
  }

  async validate(
    token: string,
    ctx?: RequestContext,
  ): Promise<TeamInviteRecord> {
    const invite = await this.inviteRepository.findByToken(token, ctx);

    if (!invite) {
      throw new TeamInviteNotFoundError(token);
    }

    if (invite.status === "accepted") {
      throw new TeamInviteAlreadyAcceptedError(invite.id);
    }

    if (invite.status === "revoked") {
      throw new TeamInviteNotPendingError(invite.id, invite.status);
    }

    if (invite.expiresAt && new Date() > invite.expiresAt) {
      throw new TeamInviteExpiredError(invite.id);
    }

    return invite;
  }

  private async validateScopeBelongsToOrg(
    scopeType: string,
    scopeId: string,
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<void> {
    if (scopeType === "business") {
      // Business scope: scopeId must be the organization itself
      if (scopeId !== organizationId) {
        throw new ScopeNotInOrganizationError(scopeId, organizationId);
      }
      return;
    }

    // Branch scope: verify branch → restaurant → organization chain
    const branch = await this.branchRepository.findById(scopeId, ctx);
    if (!branch) {
      throw new ScopeNotInOrganizationError(scopeId, organizationId);
    }

    const restaurant = await this.restaurantRepository.findById(
      branch.restaurantId,
      ctx,
    );
    if (!restaurant || restaurant.organizationId !== organizationId) {
      throw new ScopeNotInOrganizationError(scopeId, organizationId);
    }
  }
}
