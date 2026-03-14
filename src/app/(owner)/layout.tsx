import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { appRoutes } from "@/common/app-routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OwnerBottomNav } from "@/components/layout/owner-bottom-nav";
import { makeResolveOwnerConsoleAccessUseCase } from "@/modules/team-access/factories/team-access.factory";
import { flags } from "@/shared/infra/feature-flags";
import { requireSession } from "@/shared/infra/supabase/session";
import { OwnerSidebar } from "./sidebar";
import { OwnerSidebarV2 } from "./sidebar-v2";

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

  const ownerConsoleAccess =
    await makeResolveOwnerConsoleAccessUseCase().execute({
      userId: session.userId,
    });

  // Legacy accounts with null portal_preference + org are treated as owners.
  // Business-scoped assignees may also enter the console once resolved here.
  if (!ownerConsoleAccess && !isOnboardingRoute) {
    redirect(appRoutes.organization.getStarted);
  }

  if (ownerConsoleAccess && isOnboardingRoute) {
    redirect(appRoutes.organization.base);
  }

  const sidebar = flags.ownerConsoleSidebarV2 ? (
    <OwnerSidebarV2
      showBranchOps={flags.branchOpsPortal}
      showTeamAccess={flags.ownerTeamAccess}
      showWorkspaceSwitcher={flags.ownerWorkspaceSwitcher}
    />
  ) : (
    <OwnerSidebar />
  );

  return (
    <DashboardShell sidebar={sidebar} bottomNav={<OwnerBottomNav />}>
      {children}
    </DashboardShell>
  );
}
