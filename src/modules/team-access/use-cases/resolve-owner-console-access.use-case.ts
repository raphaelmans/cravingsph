import type { IOrganizationRepository } from "@/modules/organization/repositories/organization.repository";
import type { OrganizationRecord } from "@/shared/infra/db/schema";
import type { RequestContext } from "@/shared/kernel/context";
import { AuthorizationError } from "@/shared/kernel/errors";
import type { RoleTemplate } from "../dtos/team-access.dto";
import { type BusinessRoleTemplate, isBusinessRole } from "../permissions";
import type { IAssignmentService } from "../services/assignment.service";

type ResolveOwnerConsoleAccessInput = {
  userId: string;
  organizationId?: string;
};

export type OwnerConsoleAccess = {
  organization: OrganizationRecord;
  accessLevel: BusinessRoleTemplate;
};

export class ResolveOwnerConsoleAccessUseCase {
  constructor(
    private organizationRepository: IOrganizationRepository,
    private assignmentService: IAssignmentService,
  ) {}

  async execute(
    { userId, organizationId }: ResolveOwnerConsoleAccessInput,
    ctx?: RequestContext,
  ): Promise<OwnerConsoleAccess | null> {
    if (organizationId) {
      return this.resolveForOrganization(userId, organizationId, ctx);
    }

    const ownedOrganization = await this.organizationRepository.findByOwnerId(
      userId,
      ctx,
    );
    if (ownedOrganization) {
      return {
        organization: ownedOrganization,
        accessLevel: "business_owner",
      };
    }

    const assignments = await this.assignmentService.findActiveByUser(
      userId,
      ctx,
    );
    const businessAssignments = assignments.filter(
      (
        assignment,
      ): assignment is typeof assignment & {
        roleTemplate: BusinessRoleTemplate;
      } =>
        assignment.scopeType === "business" &&
        isBusinessRole(assignment.roleTemplate as RoleTemplate | null),
    );

    const organizationIds = [
      ...new Set(businessAssignments.map((a) => a.scopeId)),
    ];

    if (organizationIds.length === 0) {
      return null;
    }

    if (organizationIds.length > 1) {
      throw new AuthorizationError(
        "Owner console access requires a single business organization",
        {
          userId,
          organizationIds,
        },
      );
    }

    return this.resolveForOrganization(userId, organizationIds[0], ctx);
  }

  private async resolveForOrganization(
    userId: string,
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<OwnerConsoleAccess | null> {
    const organization = await this.organizationRepository.findById(
      organizationId,
      ctx,
    );

    if (!organization) {
      return null;
    }

    if (organization.ownerId === userId) {
      return {
        organization,
        accessLevel: "business_owner",
      };
    }

    const accessLevel = await this.assignmentService.getAccessLevel(
      userId,
      "business",
      organizationId,
      organizationId,
      ctx,
    );

    if (!isBusinessRole(accessLevel)) {
      return null;
    }

    return {
      organization,
      accessLevel,
    };
  }
}
