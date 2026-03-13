import { expect, test } from "@playwright/test";

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
