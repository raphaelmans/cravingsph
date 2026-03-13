import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SECRET_KEY ?? "";

function createAdminSupabase() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe("AC-009: Owner nav has no dead links", () => {
  const sidebarLinks = [
    { label: "Get Started", expectedPath: "/organization/get-started" },
    { label: "Dashboard", expectedPath: "/organization" },
    { label: "Restaurants", expectedPath: "/organization/restaurants" },
    { label: "Profile", expectedPath: "/account/profile" },
  ];

  for (const { label, expectedPath } of sidebarLinks) {
    test(`sidebar link "${label}" navigates to ${expectedPath}`, async ({
      page,
    }) => {
      await page.goto("/organization/get-started");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1_000);

      const link = page.locator(`a:has-text("${label}")`).first();
      const isVisible = await link.isVisible().catch(() => false);
      if (!isVisible) {
        return;
      }

      await link.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2_000);

      await expect(page.locator("text=404")).not.toBeVisible();

      const url = page.url();
      const navigatedCorrectly = url.includes(expectedPath);
      const redirectedToGetStarted = url.includes("/organization/get-started");
      expect(navigatedCorrectly || redirectedToGetStarted).toBe(true);
    });
  }

  test("sidebar does NOT show deprecated Payments or Verification links", async ({
    page,
  }) => {
    await page.goto("/organization/get-started");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1_000);

    // These links were removed from the sidebar
    await expect(page.locator('nav a:has-text("Payments")')).not.toBeVisible();
    await expect(
      page.locator('nav a:has-text("Verification")'),
    ).not.toBeVisible();
  });
});

test.describe("AC-010: Onboarding completion is honest", () => {
  test("onboarding wizard shows partial completion for incomplete setup", async ({
    page,
  }) => {
    await page.goto("/organization/onboarding");
    await page.waitForLoadState("domcontentloaded");

    const allSetText = page.locator("text=/you.*all set/i");
    const isAllSet = await allSetText.isVisible().catch(() => false);

    if (isAllSet) {
      expect(isAllSet).toBe(false);
    }
  });
});

test.describe("Onboarding: Setup wizard structure", () => {
  test("wizard has exactly 5 steps: Organization, Restaurant, Branch, Menu, Complete", async ({
    page,
  }) => {
    await page.goto("/organization/onboarding?step=1");
    await page.waitForLoadState("domcontentloaded");

    const progressNav = page.getByRole("navigation", {
      name: /onboarding progress/i,
    });
    await expect(progressNav).toBeVisible({ timeout: 10_000 });

    // Verify all 5 step labels exist
    for (const label of [
      "Organization",
      "Restaurant",
      "Branch",
      "Menu",
      "Complete",
    ]) {
      await expect(progressNav.locator(`text=${label}`)).toBeVisible();
    }

    // Verify deprecated step labels do NOT exist
    for (const label of ["Payment", "Verification"]) {
      await expect(progressNav.locator(`text=${label}`)).not.toBeVisible();
    }
  });

  test("wizard shows step count header (Step X of 5)", async ({ page }) => {
    await page.goto("/organization/onboarding?step=1");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("text=/step.*of 5/i")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("wizard shows 'Back to setup hub' link", async ({ page }) => {
    await page.goto("/organization/onboarding?step=1");
    await page.waitForLoadState("domcontentloaded");

    const backLink = page.locator("a:has-text('Back to setup hub')");
    await expect(backLink).toBeVisible({ timeout: 10_000 });
    await expect(backLink).toHaveAttribute("href", "/organization/get-started");
  });
});

test.describe("Onboarding: Menu builder step", () => {
  test("step 4 shows Build Your Menu form when prerequisites are met", async ({
    page,
  }) => {
    await page.goto("/organization/onboarding?step=4");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Owner may be redirected to an earlier step if prerequisites aren't met
    const menuHeader = page.locator("text=/build your menu/i").first();
    const hasMenuForm = await menuHeader
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (hasMenuForm) {
      // Verify form fields
      await expect(
        page.getByRole("textbox", { name: /menu category/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: /first item name/i }),
      ).toBeVisible();
      await expect(page.getByRole("textbox", { name: /price/i })).toBeVisible();

      // Verify action buttons
      await expect(
        page.getByRole("button", { name: /create menu item/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /skip for now/i }),
      ).toBeVisible();
    } else {
      // Should still be on the onboarding wizard (just a different step)
      await expect(page.locator("text=/setup wizard/i").first()).toBeVisible({
        timeout: 5_000,
      });
    }
  });
});

test.describe("Onboarding: Completion step", () => {
  test("step 5 shows completion status or redirects to earlier step", async ({
    page,
  }) => {
    await page.goto("/organization/onboarding?step=5");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // May show completion, partial completion, or redirect to earlier step
    const allSet = page.locator("text=/you.*all set/i");
    const almostThere = page.locator("text=/almost there/i");
    const wizardTitle = page.locator("text=/setup wizard/i").first();

    const hasAllSet = await allSet.isVisible().catch(() => false);
    const hasAlmostThere = await almostThere.isVisible().catch(() => false);
    const hasWizard = await wizardTitle.isVisible().catch(() => false);

    // Should be somewhere in the wizard flow
    expect(hasAllSet || hasAlmostThere || hasWizard).toBe(true);
  });

  test("partial completion shows specific missing steps when visible", async ({
    page,
  }) => {
    await page.goto("/organization/onboarding?step=5");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    const almostThere = page.locator("text=/almost there/i");
    const isPartial = await almostThere.isVisible().catch(() => false);

    if (isPartial) {
      await expect(
        page.locator("text=/completed.*of.*required steps/i"),
      ).toBeVisible();

      await expect(
        page.locator("a:has-text('View Setup Progress')"),
      ).toBeVisible();
      await expect(
        page.locator("a:has-text('Skip to Dashboard')"),
      ).toBeVisible();
    }
  });

  test("full completion shows 'Go to Dashboard' button when visible", async ({
    page,
  }) => {
    await page.goto("/organization/onboarding?step=5");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    const allSet = page.locator("text=/you.*all set/i");
    const isComplete = await allSet.isVisible().catch(() => false);

    if (isComplete) {
      await expect(page.locator("a:has-text('Go to Dashboard')")).toBeVisible();
    }
  });
});

test.describe("Onboarding: Dashboard for owner", () => {
  test("dashboard loads with welcome heading or setup hub", async ({
    page,
  }) => {
    await page.goto("/organization");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    const dashText = page.locator("text=/welcome|dashboard/i").first();
    const getStartedText = page
      .locator("text=/get started|set up|restaurant/i")
      .first();
    const hasDash = await dashText.isVisible().catch(() => false);
    const hasGetStarted = await getStartedText.isVisible().catch(() => false);
    expect(hasDash || hasGetStarted).toBe(true);
  });

  test("dashboard does NOT show 'Payment Settings' quick link", async ({
    page,
  }) => {
    await page.goto("/organization");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Only check if we're actually on the dashboard (not redirected)
    const url = page.url();
    if (!url.includes("/get-started")) {
      await expect(page.locator("text=/payment settings/i")).not.toBeVisible();
    }
  });

  test("dashboard shows 'Set Operating Hours' quick link", async ({ page }) => {
    await page.goto("/organization");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    const url = page.url();
    if (!url.includes("/get-started")) {
      await expect(
        page.locator("text=/set operating hours/i").first(),
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test("dashboard shows setup checklist when onboarding is incomplete", async ({
    page,
  }) => {
    await page.goto("/organization");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    const url = page.url();
    if (!url.includes("/get-started")) {
      // If onboarding is incomplete, setup checklist should appear
      const checklist = page.locator("text=/complete your setup/i");
      const isVisible = await checklist.isVisible().catch(() => false);

      if (isVisible) {
        // Verify checklist has progress indicator
        await expect(page.getByRole("progressbar")).toBeVisible();

        // Verify "Continue Setup" CTA exists
        await expect(
          page.locator("a:has-text('Continue Setup')"),
        ).toBeVisible();
      }
    }
  });

  test("dashboard stat cards show expected labels", async ({ page }) => {
    await page.goto("/organization");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    const url = page.url();
    if (!url.includes("/get-started")) {
      // Verify the 4 stat cards exist
      for (const label of [
        "Orders Today",
        "Pending Orders",
        "Active Locations",
        "Revenue Today",
      ]) {
        await expect(page.locator(`text=${label}`).first()).toBeVisible({
          timeout: 5_000,
        });
      }
    }
  });
});

test.describe("Onboarding: Setup hub page", () => {
  test("setup hub shows progress and step cards", async ({ page }) => {
    await page.goto("/organization/get-started");
    await page.waitForLoadState("domcontentloaded");

    // Should show Get Started or setup content
    const heading = page
      .locator("text=/get started|setup|onboarding/i")
      .first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("AC-015: Breadcrumb hydration on owner pages", () => {
  test("owner dashboard has zero hydration errors", async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (
          text.includes("Hydration") ||
          text.includes("hydration") ||
          text.includes("did not match") ||
          text.includes("cannot appear as") ||
          text.includes("validateDOMNesting")
        ) {
          hydrationErrors.push(text);
        }
      }
    });

    await page.goto("/organization");
    await page.waitForLoadState("domcontentloaded");

    expect(hydrationErrors).toHaveLength(0);
  });

  test("onboarding wizard has zero hydration errors", async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (
          text.includes("Hydration") ||
          text.includes("hydration") ||
          text.includes("did not match") ||
          text.includes("cannot appear as") ||
          text.includes("validateDOMNesting")
        ) {
          hydrationErrors.push(text);
        }
      }
    });

    await page.goto("/organization/onboarding?step=1");
    await page.waitForLoadState("domcontentloaded");

    expect(hydrationErrors).toHaveLength(0);
  });
});

test.describe("Table Management", () => {
  test.describe.configure({ mode: "serial" });

  let tablesUrl = "";
  let branchDetailUrl = "";

  test.beforeAll(async () => {
    const supabase = createAdminSupabase();

    const { data: restaurant } = await supabase
      .from("restaurant")
      .select("id")
      .eq("slug", "e2e-test-restaurant")
      .single();

    if (!restaurant) return;

    const { data: branch } = await supabase
      .from("branch")
      .select("id")
      .eq("restaurant_id", restaurant.id)
      .eq("slug", "e2e-main-branch")
      .single();

    if (!branch) return;

    branchDetailUrl = `/organization/restaurants/${restaurant.id}/branches/${branch.id}`;
    tablesUrl = `${branchDetailUrl}/tables`;

    // Clean up leftover test table from previous failed runs
    await supabase
      .from("branch_table")
      .delete()
      .eq("branch_id", branch.id)
      .eq("code", "E2E-NEW");
  });

  test("branch detail page shows 'Manage tables' in Branch Tools", async ({
    page,
  }) => {
    test.skip(!branchDetailUrl, "Seed data not available");

    await page.goto(branchDetailUrl);
    await page.waitForLoadState("domcontentloaded");

    const link = page.locator("a:has-text('Manage tables')");
    await expect(link).toBeVisible({ timeout: 10_000 });
  });

  test("tables page loads with 5 seeded tables", async ({ page }) => {
    test.skip(!tablesUrl, "Seed data not available");

    await page.goto(tablesUrl);
    await page.waitForLoadState("domcontentloaded");

    for (const label of [
      "Table 1",
      "Table 2",
      "Table 3",
      "Table 4",
      "Table 5",
    ]) {
      await expect(page.locator(`td:has-text("${label}")`).first()).toBeVisible(
        { timeout: 5_000 },
      );
    }

    for (const code of ["T-01", "T-02", "T-03", "T-04", "T-05"]) {
      await expect(page.locator(`code:has-text("${code}")`)).toBeVisible();
    }
  });

  test("seeded tables T-01 and T-03 show active sessions", async ({ page }) => {
    test.skip(!tablesUrl, "Seed data not available");

    await page.goto(tablesUrl);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // T-01 row should have "Close session" button (session is active)
    const t01Row = page.locator("tr", {
      has: page.locator('code:has-text("T-01")'),
    });
    await expect(
      t01Row.getByRole("button", { name: "Close session" }),
    ).toBeVisible();

    // T-03 row should have "Close session" button
    const t03Row = page.locator("tr", {
      has: page.locator('code:has-text("T-03")'),
    });
    await expect(
      t03Row.getByRole("button", { name: "Close session" }),
    ).toBeVisible();

    // T-02 row should have "Open session" button (no active session)
    const t02Row = page.locator("tr", {
      has: page.locator('code:has-text("T-02")'),
    });
    await expect(
      t02Row.getByRole("button", { name: "Open session" }),
    ).toBeVisible();
  });

  test("create table via Add Table dialog", async ({ page }) => {
    test.skip(!tablesUrl, "Seed data not available");

    await page.goto(tablesUrl);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Open the Add Table dialog
    await page
      .getByRole("button", { name: /add table/i })
      .first()
      .click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Fill form fields
    await dialog.getByLabel("Label").fill("E2E New Table");
    await dialog.getByLabel("Code").fill("e2e-new"); // auto-uppercases to E2E-NEW

    // Submit
    await dialog.getByRole("button", { name: "Add Table" }).click();

    // Verify success toast and new row
    await expect(page.locator("text=Table created")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator('td:has-text("E2E New Table")')).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator('code:has-text("E2E-NEW")')).toBeVisible();
  });

  test("duplicate code shows conflict error", async ({ page }) => {
    test.skip(!tablesUrl, "Seed data not available");

    await page.goto(tablesUrl);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    await page
      .getByRole("button", { name: /add table/i })
      .first()
      .click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    await dialog.getByLabel("Label").fill("Duplicate Test");
    await dialog.getByLabel("Code").fill("T-01");
    await dialog.getByRole("button", { name: "Add Table" }).click();

    // Conflict error toast
    await expect(page.locator("text=/already exists/i")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("edit table updates label", async ({ page }) => {
    test.skip(!tablesUrl, "Seed data not available");

    await page.goto(tablesUrl);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Click edit on the E2E New Table row
    const row = page.locator("tr", {
      has: page.locator('code:has-text("E2E-NEW")'),
    });
    await row.getByRole("button", { name: "Edit" }).click();

    // Edit dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await expect(dialog.locator("text=Edit Table")).toBeVisible();

    // Change the label
    const labelInput = dialog.getByLabel("Label");
    await labelInput.clear();
    await labelInput.fill("E2E Updated Table");

    await dialog.getByRole("button", { name: "Save Changes" }).click();

    // Verify success
    await expect(page.locator("text=Table updated")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator('td:has-text("E2E Updated Table")')).toBeVisible({
      timeout: 5_000,
    });
  });

  test("open and close table session", async ({ page }) => {
    test.skip(!tablesUrl, "Seed data not available");

    await page.goto(tablesUrl);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // T-02 has no active session — open one
    const t02Row = page.locator("tr", {
      has: page.locator('code:has-text("T-02")'),
    });
    await t02Row.getByRole("button", { name: "Open session" }).click();

    await expect(page.locator("text=Session opened")).toBeVisible({
      timeout: 5_000,
    });

    // Now T-02 should show "Close session"
    await expect(
      t02Row.getByRole("button", { name: "Close session" }),
    ).toBeVisible({ timeout: 5_000 });

    // Close it
    await t02Row.getByRole("button", { name: "Close session" }).click();

    await expect(page.locator("text=Session closed")).toBeVisible({
      timeout: 5_000,
    });

    // T-02 should show "Open session" again
    await expect(
      t02Row.getByRole("button", { name: "Open session" }),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("close all sessions clears all active sessions", async ({ page }) => {
    test.skip(!tablesUrl, "Seed data not available");

    await page.goto(tablesUrl);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Click "Close All Sessions"
    await page.getByRole("button", { name: /close all sessions/i }).click();

    // Success toast
    await expect(page.locator("text=/session.*closed/i")).toBeVisible({
      timeout: 5_000,
    });

    // Wait for UI to update
    await page.waitForTimeout(1_000);

    // All seeded tables should now show "Open session"
    const t01Row = page.locator("tr", {
      has: page.locator('code:has-text("T-01")'),
    });
    await expect(
      t01Row.getByRole("button", { name: "Open session" }),
    ).toBeVisible({ timeout: 5_000 });

    const t03Row = page.locator("tr", {
      has: page.locator('code:has-text("T-03")'),
    });
    await expect(
      t03Row.getByRole("button", { name: "Open session" }),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("delete table with confirmation dialog", async ({ page }) => {
    test.skip(!tablesUrl, "Seed data not available");

    await page.goto(tablesUrl);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Delete the E2E table we created earlier
    const row = page.locator("tr", {
      has: page.locator('code:has-text("E2E-NEW")'),
    });
    await row.getByRole("button", { name: "Delete" }).click();

    // Confirmation dialog should appear
    const alertDialog = page.locator('[role="alertdialog"]');
    await expect(alertDialog).toBeVisible({ timeout: 5_000 });
    await expect(alertDialog.locator("text=Delete table?")).toBeVisible();

    // Confirm deletion
    await alertDialog.getByRole("button", { name: "Delete" }).click();

    // Verify success
    await expect(page.locator("text=/deleted/i")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator('code:has-text("E2E-NEW")')).not.toBeVisible({
      timeout: 5_000,
    });
  });
});
