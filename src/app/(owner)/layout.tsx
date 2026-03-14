import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { appRoutes } from "@/common/app-routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OwnerBottomNav } from "@/components/layout/owner-bottom-nav";
import { OrganizationNotFoundError } from "@/modules/organization/errors/organization.errors";
import { makeOrganizationService } from "@/modules/organization/factories/organization.factory";
import { requireSession } from "@/shared/infra/supabase/session";
import { OwnerSidebar } from "./sidebar";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  // Portal separation: only owners (or legacy accounts with null preference) may access
  if (session.portalPreference === "customer") {
    redirect("/");
  }

  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? appRoutes.organization.base;

  const isOnboardingRoute =
    pathname === appRoutes.organization.getStarted ||
    pathname === appRoutes.organization.onboarding;

  let hasOrganization = false;

  try {
    await makeOrganizationService().getByOwnerId(session.userId);
    hasOrganization = true;
  } catch (error) {
    if (!(error instanceof OrganizationNotFoundError)) {
      throw error;
    }
  }

  // Legacy accounts with null portal_preference + org are treated as owners
  if (!hasOrganization && !isOnboardingRoute) {
    redirect(appRoutes.organization.getStarted);
  }

  return (
    <DashboardShell sidebar={<OwnerSidebar />} bottomNav={<OwnerBottomNav />}>
      {children}
    </DashboardShell>
  );
}
