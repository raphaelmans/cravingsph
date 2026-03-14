import { redirect } from "next/navigation";
import { appRoutes } from "@/common/app-routes";
import { getSafeRedirectPath } from "@/common/redirects";
import { makeBranchRepository } from "@/modules/branch/factories/branch.factory";
import { SmartRedirectUseCase } from "@/modules/branch/use-cases/smart-redirect.use-case";
import { makeOrganizationRepository } from "@/modules/organization/factories/organization.factory";
import { makeAssignmentService } from "@/modules/team-access/factories/team-access.factory";
import { getServerSession } from "@/shared/infra/supabase/session";

/**
 * Post-login redirect handler.
 * Routes users to the correct portal based on their portal preference and role:
 * - Admin → /admin
 * - Owner (portal_preference = 'owner') → /organization or /organization/get-started
 * - Customer (portal_preference = 'customer') → / (home)
 * - Legacy (null portal_preference) → check org existence for backward compat
 */
type PostLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PostLoginPage({
  searchParams,
}: PostLoginPageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  const queryParams = (await searchParams) ?? {};
  const requestedRedirect = Array.isArray(queryParams.redirect)
    ? queryParams.redirect[0]
    : queryParams.redirect;

  const safeRedirect = getSafeRedirectPath(requestedRedirect, {
    fallback: "__smart_redirect__",
    disallowPathname: appRoutes.postLogin.base,
    disallowRoutes: ["guest"],
  });

  if (safeRedirect !== "__smart_redirect__") {
    redirect(safeRedirect);
  }

  const destination = await new SmartRedirectUseCase(
    makeOrganizationRepository(),
    makeAssignmentService(),
    makeBranchRepository(),
  ).execute({
    userId: session.userId,
    portalPreference: session.portalPreference,
  });

  redirect(destination);
}
