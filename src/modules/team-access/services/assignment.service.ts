import type { IOrganizationRepository } from "@/modules/organization/repositories/organization.repository";
import type { ScopedAssignmentRecord } from "@/shared/infra/db/schema";
import { logger } from "@/shared/infra/logger";
import type { RequestContext } from "@/shared/kernel/context";
import {
  type CreateAssignmentDTO,
  ROLE_SCOPE_MAP,
  type RoleTemplate,
} from "../dtos/team-access.dto";
import {
  AssignmentNotFoundError,
  InvalidRoleTemplateError,
} from "../errors/team-access.errors";
import type { IAssignmentRepository } from "../repositories/assignment.repository";

export interface IAssignmentService {
  create(
    data: CreateAssignmentDTO,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord>;
  revoke(assignmentId: string, ctx?: RequestContext): Promise<void>;
  hasAccess(
    userId: string,
    scopeType: string,
    scopeId: string,
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<boolean>;
  getAccessLevel(
    userId: string,
    scopeType: string,
    scopeId: string,
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<RoleTemplate | null>;
  findActiveByUser(
    userId: string,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord[]>;
}

export class AssignmentService implements IAssignmentService {
  constructor(
    private assignmentRepository: IAssignmentRepository,
    private organizationRepository: IOrganizationRepository,
  ) {}

  async create(
    data: CreateAssignmentDTO,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord> {
    // Validate role template matches scope type
    const expectedScope = ROLE_SCOPE_MAP[data.roleTemplate];
    if (expectedScope !== data.scopeType) {
      throw new InvalidRoleTemplateError(data.roleTemplate, data.scopeType);
    }

    const assignment = await this.assignmentRepository.create(
      {
        membershipId: data.membershipId,
        roleTemplate: data.roleTemplate,
        scopeType: data.scopeType,
        scopeId: data.scopeId,
        status: "active",
      },
      ctx,
    );

    logger.info(
      {
        event: "scoped_assignment.created",
        assignmentId: assignment.id,
        membershipId: data.membershipId,
        roleTemplate: data.roleTemplate,
        scopeType: data.scopeType,
        scopeId: data.scopeId,
      },
      "Scoped assignment created",
    );

    return assignment;
  }

  async revoke(assignmentId: string, ctx?: RequestContext): Promise<void> {
    const assignment = await this.assignmentRepository.findById(
      assignmentId,
      ctx,
    );

    if (!assignment) {
      throw new AssignmentNotFoundError(assignmentId);
    }

    await this.assignmentRepository.revoke(assignmentId, ctx);

    logger.info(
      {
        event: "scoped_assignment.revoked",
        assignmentId,
        membershipId: assignment.membershipId,
      },
      "Scoped assignment revoked",
    );
  }

  /**
   * Check if a user has access to a given scope.
   * Returns true if:
   * 1. User is the org owner (implicit business_owner)
   * 2. User has an active assignment matching the scope
   * 3. User has a business-scope assignment (grants access to all branches)
   */
  async hasAccess(
    userId: string,
    scopeType: string,
    scopeId: string,
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<boolean> {
    const level = await this.getAccessLevel(
      userId,
      scopeType,
      scopeId,
      organizationId,
      ctx,
    );
    return level !== null;
  }

  /**
   * Get the effective role template for a user at a given scope.
   * Returns null if no access.
   *
   * Priority: org owner > business-scope assignment > branch-scope assignment
   */
  async getAccessLevel(
    userId: string,
    scopeType: string,
    scopeId: string,
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<RoleTemplate | null> {
    // 1. Check if user is the org owner (implicit business_owner)
    const org = await this.organizationRepository.findById(organizationId, ctx);
    if (org?.ownerId === userId) {
      return "business_owner";
    }

    // 2. Check for a direct scope match
    const directAssignment = await this.assignmentRepository.findByUserAndScope(
      userId,
      scopeType,
      scopeId,
      ctx,
    );
    if (directAssignment) {
      return directAssignment.roleTemplate as RoleTemplate;
    }

    // 3. For branch scope, check if user has a business-scope assignment
    if (scopeType === "branch") {
      const businessAssignment =
        await this.assignmentRepository.findByUserAndScope(
          userId,
          "business",
          organizationId,
          ctx,
        );
      if (businessAssignment) {
        return businessAssignment.roleTemplate as RoleTemplate;
      }
    }

    return null;
  }

  async findActiveByUser(
    userId: string,
    ctx?: RequestContext,
  ): Promise<ScopedAssignmentRecord[]> {
    return this.assignmentRepository.findActiveByUser(userId, ctx);
  }
}
