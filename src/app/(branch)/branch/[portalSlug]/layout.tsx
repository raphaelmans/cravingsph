import { notFound } from "next/navigation";
import { BranchNotFoundError } from "@/modules/branch/errors/branch.errors";
import { makeBranchService } from "@/modules/branch/factories/branch.factory";
import { makeOrganizationRepository } from "@/modules/organization/factories/organization.factory";
import { makeRestaurantRepository } from "@/modules/restaurant/factories/restaurant.factory";
import { flags } from "@/shared/infra/feature-flags";
import { requireSession } from "@/shared/infra/supabase/session";
import { AuthorizationError } from "@/shared/kernel/errors";

interface BranchPortalLayoutProps {
  children: React.ReactNode;
  params: Promise<{ portalSlug: string }>;
}

/**
 * Branch portal layout.
 * Resolves the portal slug to a branch record, verifies the user has access,
 * and provides branch context to child pages.
 *
 * Access control (Step 3): org ownership only.
 * Step 12 will add branch-scoped team access.
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

  // Verify user has access: resolve restaurant → organization → check ownership
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

  if (organization.ownerId !== session.userId) {
    throw new AuthorizationError(
      "Not authorized to access this branch portal",
      {
        branchId: branch.id,
        userId: session.userId,
      },
    );
  }

  return <>{children}</>;
}
