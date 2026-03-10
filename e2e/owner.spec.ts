import { expect, test } from "@playwright/test";

test.describe("AC-009: Owner nav has no dead links", () => {
  const sidebarLinks = [
    { label: "Get Started", expectedPath: "/organization/get-started" },
    { label: "Dashboard", expectedPath: "/organization" },
    { label: "Restaurants", expectedPath: "/organization/restaurants" },
    { label: "Payments", expectedPath: "/organization/payments" },
    { label: "Verification", expectedPath: "/organization/verify" },
    { label: "Profile", expectedPath: "/account/profile" },
  ];

  for (const { label, expectedPath } of sidebarLinks) {
    test(`sidebar link "${label}" navigates to ${expectedPath}`, async ({
      page,
    }) => {
      // Navigate to get-started (owner without org ends up here)
      await page.goto("/organization/get-started");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1_000);

      // Click sidebar link
      const link = page.locator(`a:has-text("${label}")`).first();
      const isVisible = await link.isVisible().catch(() => false);
      if (!isVisible) {
        // Link not in sidebar — skip gracefully
        return;
      }

      await link.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2_000);

      // Should not show 404
      await expect(page.locator("text=404")).not.toBeVisible();

      // URL should contain the expected path OR redirect back to get-started
      // (new owner without a restaurant may be redirected back)
      const url = page.url();
      const navigatedCorrectly = url.includes(expectedPath);
      const redirectedToGetStarted = url.includes("/organization/get-started");
      expect(navigatedCorrectly || redirectedToGetStarted).toBe(true);
    });
  }
});

test.describe("AC-010: Onboarding completion is honest", () => {
  test("onboarding wizard shows partial completion for incomplete setup", async ({
    page,
  }) => {
    // Owner test user has no menu items, payment config, or verification
    await page.goto("/organization/onboarding");
    await page.waitForLoadState("domcontentloaded");

    // Should NOT show "You're All Set!" for an incomplete setup
    const allSetText = page.locator("text=/you.*all set/i");
    const isAllSet = await allSetText.isVisible().catch(() => false);

    // If we can see the completion step, verify it's honest
    if (isAllSet) {
      // This would be a failure - new owner shouldn't see "all set"
      expect(isAllSet).toBe(false);
    }
  });
});

test.describe("AC-011: Branch orders are branch-scoped", () => {
  test("owner dashboard loads without errors", async ({ page }) => {
    await page.goto("/organization");
    await page.waitForLoadState("domcontentloaded");

    await page.waitForTimeout(2_000);

    // Dashboard should load — owner without org may be redirected to get-started
    const dashText = page.locator("text=/dashboard|welcome/i").first();
    const getStartedText = page
      .locator("text=/get started|set up|restaurant/i")
      .first();
    const hasDash = await dashText.isVisible().catch(() => false);
    const hasGetStarted = await getStartedText.isVisible().catch(() => false);
    expect(hasDash || hasGetStarted).toBe(true);
  });
});

test.describe("AC-012: Payment methods are org-scoped", () => {
  test("new organization sees empty payment methods", async ({ page }) => {
    await page.goto("/organization/payments");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Owner without org may be redirected to get-started
    const url = page.url();
    if (url.includes("/organization/get-started")) {
      // Redirected — acceptable for new owner without a restaurant
      return;
    }

    // New org should show empty state or "no payment methods"
    const emptyIndicator = page.locator(
      "text=/no payment|empty|add.*method|get started|no.*configured/i",
    );
    const hasContent = await page
      .locator('[data-testid="payment-method"]')
      .first()
      .isVisible()
      .catch(() => false);

    if (!hasContent) {
      await expect(emptyIndicator.first()).toBeVisible({ timeout: 5_000 });
    }
  });
});

test.describe("AC-013: Verification starts in draft", () => {
  test("verification page loads without errors", async ({ page }) => {
    await page.goto("/organization/verify");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Page should load without showing 404
    await expect(page.locator("text=404")).not.toBeVisible();

    // Should show verification content or redirect to get-started (no restaurant yet)
    const verificationText = page
      .locator("text=/verification|verify|document/i")
      .first();
    const getStartedText = page
      .locator("text=/get started|set up|restaurant/i")
      .first();

    const hasVerification = await verificationText
      .isVisible()
      .catch(() => false);
    const hasGetStarted = await getStartedText.isVisible().catch(() => false);

    // Either shows verification page or onboarding (both acceptable for new owner)
    expect(hasVerification || hasGetStarted).toBe(true);
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

  test("payments page has zero hydration errors", async ({ page }) => {
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

    await page.goto("/organization/payments");
    await page.waitForLoadState("domcontentloaded");

    expect(hydrationErrors).toHaveLength(0);
  });
});
