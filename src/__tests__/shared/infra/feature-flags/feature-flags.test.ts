import type { FeatureFlags } from "@/shared/infra/feature-flags";

describe("Feature flags", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  async function loadFlags(): Promise<FeatureFlags> {
    const mod = await import("@/shared/infra/feature-flags");
    return mod.flags;
  }

  it("defaults all flags to false when env vars are missing", async () => {
    // Remove all FF_ vars
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("FF_")) {
        delete process.env[key];
      }
    }

    const flags = await loadFlags();

    expect(flags.branchOpsPortal).toBe(false);
    expect(flags.branchScopedStaffAccess).toBe(false);
    expect(flags.branchPortalShortRoutes).toBe(false);
    expect(flags.ownerConsoleSidebarV2).toBe(false);
    expect(flags.ownerTeamAccess).toBe(false);
    expect(flags.ownerWorkspaceSwitcher).toBe(false);
  });

  it("reads true when env var is set to 'true'", async () => {
    process.env.FF_BRANCH_OPS_PORTAL = "true";
    process.env.FF_OWNER_CONSOLE_SIDEBAR_V2 = "true";

    const flags = await loadFlags();

    expect(flags.branchOpsPortal).toBe(true);
    expect(flags.ownerConsoleSidebarV2).toBe(true);
    // Others still false
    expect(flags.branchScopedStaffAccess).toBe(false);
    expect(flags.ownerTeamAccess).toBe(false);
  });

  it("treats non-'true' values as false", async () => {
    process.env.FF_BRANCH_OPS_PORTAL = "false";
    process.env.FF_OWNER_TEAM_ACCESS = "1";
    process.env.FF_OWNER_WORKSPACE_SWITCHER = "yes";

    const flags = await loadFlags();

    expect(flags.branchOpsPortal).toBe(false);
    expect(flags.ownerTeamAccess).toBe(false);
    expect(flags.ownerWorkspaceSwitcher).toBe(false);
  });

  it("returns an object with all six flag keys", async () => {
    const flags = await loadFlags();
    const keys = Object.keys(flags);

    expect(keys).toContain("branchOpsPortal");
    expect(keys).toContain("branchScopedStaffAccess");
    expect(keys).toContain("branchPortalShortRoutes");
    expect(keys).toContain("ownerConsoleSidebarV2");
    expect(keys).toContain("ownerTeamAccess");
    expect(keys).toContain("ownerWorkspaceSwitcher");
    expect(keys).toHaveLength(6);
  });
});
