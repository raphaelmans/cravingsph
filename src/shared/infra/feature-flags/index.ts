/**
 * Feature flag definitions for gating new functionality.
 * Env-backed, typed, and immutable at runtime.
 * All flags default to false when the env var is missing or not "true".
 *
 * Reads directly from process.env rather than the @t3-oss/env proxy
 * because these are optional server-only values that may be absent.
 * The env schema in src/lib/env/index.ts still validates their shape.
 */
export interface FeatureFlags {
  /** Enable the branch ops portal at /branch/:portalSlug */
  branchOpsPortal: boolean;
  /** Enable branch-scoped staff access enforcement */
  branchScopedStaffAccess: boolean;
  /** Enable short portal routes for branches */
  branchPortalShortRoutes: boolean;
  /** Enable the task-oriented owner sidebar v2 */
  ownerConsoleSidebarV2: boolean;
  /** Enable team access management for owners */
  ownerTeamAccess: boolean;
  /** Enable the restaurant workspace switcher in sidebar v2 */
  ownerWorkspaceSwitcher: boolean;
}

function readBoolFlag(value: string | undefined): boolean {
  return value === "true";
}

export const flags: FeatureFlags = {
  branchOpsPortal: readBoolFlag(process.env.FF_BRANCH_OPS_PORTAL),
  branchScopedStaffAccess: readBoolFlag(
    process.env.FF_BRANCH_SCOPED_STAFF_ACCESS,
  ),
  branchPortalShortRoutes: readBoolFlag(
    process.env.FF_BRANCH_PORTAL_SHORT_ROUTES,
  ),
  ownerConsoleSidebarV2: readBoolFlag(process.env.FF_OWNER_CONSOLE_SIDEBAR_V2),
  ownerTeamAccess: readBoolFlag(process.env.FF_OWNER_TEAM_ACCESS),
  ownerWorkspaceSwitcher: readBoolFlag(process.env.FF_OWNER_WORKSPACE_SWITCHER),
};
