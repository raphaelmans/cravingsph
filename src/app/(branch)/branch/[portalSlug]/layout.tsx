import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BranchPortalProvider } from "@/features/branch-portal/components/branch-portal-provider";
import { BranchNotFoundError } from "@/modules/branch/errors/branch.errors";
import { makeBranchService } from "@/modules/branch/factories/branch.factory";
import { makeOrganizationRepository } from "@/modules/organization/factories/organization.factory";
import { makeRestaurantRepository } from "@/modules/restaurant/factories/restaurant.factory";
import type { RoleTemplate } from "@/modules/team-access/dtos/team-access.dto";
import { InsufficientBranchAccessError } from "@/modules/team-access/errors/team-access.errors";
import { makeAssignmentService } from "@/modules/team-access/factories/team-access.factory";
import { flags } from "@/shared/infra/feature-flags";
import { requireSession } from "@/shared/infra/supabase/session";
import { AuthorizationError } from "@/shared/kernel/errors";
import { BranchPortalBottomNav } from "../../branch-portal-bottom-nav";
import { BranchPortalSidebar } from "../../branch-portal-sidebar";

interface BranchPortalLayoutProps {
  children: React.ReactNode;
  params: Promise<{ portalSlug: string }>;
}

/**
 * Branch portal layout.
 * Resolves the portal slug to a branch record, verifies the user has access,
 * and wraps children in the branch portal shell (sidebar + bottom nav).
 *
 * Access control:
 * - When branchScopedStaffAccess flag is ON: uses AssignmentService.getAccessLevel
 *   (org owner, business-scope, or branch-scope assignment)
 * - When flag is OFF: org ownership check only (legacy behavior)
 */
export default async function BranchPortalLayout({
  children,
  params,
}: BranchPortalLayoutProps) {
  // Gate behind feature flag
  if (!flags.branchOpsPortal) {
    notFound();
  }

  const session = await requireSession();
  const { portalSlug } = await params;

  // Resolve branch from portal slug
  const branch = await makeBranchService()
    .getByPortalSlug(portalSlug)
    .catch((error: unknown) => {
      if (error instanceof BranchNotFoundError) {
        notFound();
      }
      throw error;
    });

  // Resolve restaurant and organization for access checks
  const restaurant = await makeRestaurantRepository().findById(
    branch.restaurantId,
  );
  if (!restaurant) {
    notFound();
  }

  const organization = await makeOrganizationRepository().findById(
    restaurant.organizationId,
  );
  if (!organization) {
    notFound();
  }

  let accessLevel: RoleTemplate;

  if (flags.branchScopedStaffAccess) {
    // Team-based access: org owner, business-scope, or branch-scope assignment
    const level = await makeAssignmentService().getAccessLevel(
      session.userId,
      "branch",
      branch.id,
      organization.id,
    );

    if (!level) {
      throw new InsufficientBranchAccessError(session.userId, branch.id);
    }

    accessLevel = level;
  } else {
    // Legacy: org ownership only
    if (organization.ownerId !== session.userId) {
      throw new AuthorizationError(
        "Not authorized to access this branch portal",
        {
          branchId: branch.id,
          userId: session.userId,
        },
      );
    }

    accessLevel = "business_owner";
  }

  return (
    <BranchPortalProvider
      value={{
        branchId: branch.id,
        restaurantId: branch.restaurantId,
        portalSlug,
        branchName: branch.name,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        accessLevel,
      }}
    >
      <DashboardShell
        sidebar={<BranchPortalSidebar />}
        bottomNav={<BranchPortalBottomNav />}
      >
        {children}
      </DashboardShell>
    </BranchPortalProvider>
  );
}
