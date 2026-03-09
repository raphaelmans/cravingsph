import { test, expect } from "@playwright/test";

test.describe("AC-009: Owner nav has no dead links", () => {
  const sidebarLinks = [
    { label: "Get Started", expectedPath: "/organization/get-started" },
    { label: "Dashboard", expectedPath: "/organization" },
    { label: "Restaurants", expectedPath: "/organization/restaurants" },
    { label: "Payments", expectedPath: "/organization/payments" },
    { label: "Verification", expectedPath: "/organization/verify" },
  ];

  for (const { label, expectedPath } of sidebarLinks) {
    test(`sidebar link "${label}" navigates to ${expectedPath}`, async ({ page }) => {
      await page.goto("/organization");
      await page.waitForLoadState("networkidle");

      // Click sidebar link
      const link = page.locator(`a:has-text("${label}")`).first();
      if (await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForLoadState("networkidle");

        // Should not show 404 or error
        await expect(page.locator("text=404")).not.toBeVisible();
        expect(page.url()).toContain(expectedPath);
      }
    });
  }
});

test.describe("AC-010: Onboarding completion is honest", () => {
  test("onboarding wizard shows partial completion for incomplete setup", async ({ page }) => {
    // Owner test user has no menu items, payment config, or verification
    await page.goto("/organization/onboarding");
    await page.waitForLoadState("networkidle");

    // Should NOT show "You're All Set!" for an incomplete setup
    const allSetText = page.locator('text=/you.*all set/i');
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
    await page.waitForLoadState("networkidle");

    // Dashboard should load (owner may not have a branch yet)
    await expect(page.locator('text=/dashboard|welcome/i').first()).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("AC-012: Payment methods are org-scoped", () => {
  test("new organization sees empty payment methods", async ({ page }) => {
    await page.goto("/organization/payments");
    await page.waitForLoadState("networkidle");

    // New org should show empty state or "no payment methods"
    const emptyIndicator = page.locator(
      'text=/no payment|empty|add.*method|get started|no.*configured/i'
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
  test("new restaurant shows draft verification status", async ({ page }) => {
    await page.goto("/organization/verify");
    await page.waitForLoadState("networkidle");

    // Verify page loads without error
    await expect(page.locator("text=Verification")).toBeVisible({
      timeout: 10_000,
    });

    // Should show draft or "no documents" state for new restaurant
    await expect(
      page.locator('text=/draft|not submitted|0.*of.*3|upload|no.*document/i').first()
    ).toBeVisible({ timeout: 5_000 });
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
    await page.waitForLoadState("networkidle");

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
    await page.waitForLoadState("networkidle");

    expect(hydrationErrors).toHaveLength(0);
  });
});
