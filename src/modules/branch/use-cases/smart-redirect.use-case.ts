import { appRoutes } from "@/common/app-routes";
import type { IOrganizationRepository } from "@/modules/organization/repositories/organization.repository";
import type { IAssignmentService } from "@/modules/team-access/services/assignment.service";
import { flags } from "@/shared/infra/feature-flags";
import type { PortalPreference } from "@/shared/kernel/auth";
import type { IBranchRepository } from "../repositories/branch.repository";

type SmartRedirectInput = {
  userId: string;
  portalPreference: PortalPreference | null;
};

/**
 * Resolves the first destination after login.
 *
 * Current scope:
 * - Org owners keep the owner-console flow.
 * - Users with exactly one active branch assignment go straight to that branch portal.
 * - All other cases fall back to the existing portal-preference behavior.
 *
 * Business-scoped assignees intentionally keep legacy behavior for now because
 * the owner console layout still assumes org ownership.
 */
export class SmartRedirectUseCase {
  constructor(
    private organizationRepository: IOrganizationRepository,
    private assignmentService: IAssignmentService,
    private branchRepository: IBranchRepository,
  ) {}

  async execute({
    userId,
    portalPreference,
  }: SmartRedirectInput): Promise<string> {
    const ownedOrganization =
      await this.organizationRepository.findByOwnerId(userId);

    if (ownedOrganization) {
      return appRoutes.organization.base;
    }

    if (flags.branchOpsPortal) {
      const assignments = await this.assignmentService.findActiveByUser(userId);

      const hasBusinessAssignment = assignments.some(
        (assignment) => assignment.scopeType === "business",
      );
      if (!hasBusinessAssignment) {
        const branchIds = [
          ...new Set(
            assignments
              .filter((assignment) => assignment.scopeType === "branch")
              .map((assignment) => assignment.scopeId),
          ),
        ];

        if (branchIds.length === 1) {
          const branch = await this.branchRepository.findById(branchIds[0]);
          if (branch?.portalSlug) {
            return appRoutes.branchPortal.byPortalSlug(branch.portalSlug);
          }
        }
      }
    }

    return getLegacyPostLoginDestination({
      hasOwnedOrganization: ownedOrganization !== null,
      portalPreference,
    });
  }
}

type LegacyDestinationInput = {
  hasOwnedOrganization: boolean;
  portalPreference: PortalPreference | null;
};

export function getLegacyPostLoginDestination({
  hasOwnedOrganization,
  portalPreference,
}: LegacyDestinationInput): string {
  if (portalPreference === "customer") {
    return appRoutes.index.base;
  }

  if (portalPreference === "owner") {
    return hasOwnedOrganization
      ? appRoutes.organization.base
      : appRoutes.organization.getStarted;
  }

  return hasOwnedOrganization
    ? appRoutes.organization.base
    : appRoutes.index.base;
}
