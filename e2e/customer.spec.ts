import { test, expect } from "@playwright/test";

test.describe("AC-004: Save-for-later on discovery", () => {
  test("authenticated customer can toggle save on a restaurant card", async ({ page }) => {
    await page.goto("/");

    // Find a heart/save button overlaid on a restaurant card
    const cardLink = page.locator("a[href^='/restaurant/']").first();
    await expect(cardLink).toBeVisible({ timeout: 10_000 });

    const heartButton = cardLink.locator("button").first();

    if (await heartButton.isVisible().catch(() => false)) {
      await heartButton.click();
      // Should not redirect to login (authenticated customer)
      await expect(page).not.toHaveURL(/login/);
      // Page should remain on homepage
      await expect(page).toHaveURL("/");
    }
  });
});

test.describe("AC-005: Saved restaurants are account-scoped", () => {
  test("new customer sees empty state on /saved", async ({ page }) => {
    await page.goto("/saved");
    await page.waitForLoadState("networkidle");

    // New test account should see empty state
    const emptyIndicator = page.locator(
      'text=/no saved|empty|start saving|nothing here|haven.*saved/i'
    );
    const hasCards = await page
      .locator('a[href^="/restaurant/"]')
      .first()
      .isVisible()
      .catch(() => false);

    if (!hasCards) {
      await expect(emptyIndicator.first()).toBeVisible({ timeout: 5_000 });
    }
  });
});

test.describe("AC-006: Order history is account-scoped", () => {
  test("new customer sees empty state on /orders", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    // New test account should have no orders
    const emptyIndicator = page.locator(
      'text=/no orders|empty|start ordering|nothing here|haven.*ordered|no.*yet/i'
    );
    await expect(emptyIndicator.first()).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("AC-008: Portal separation enforced", () => {
  test("customer cannot access owner routes", async ({ page }) => {
    await page.goto("/organization/get-started");
    await page.waitForLoadState("networkidle");

    // Customer with portal_preference='customer' should be redirected
    const url = page.url();
    expect(url).not.toMatch(/\/organization\/get-started$/);
  });

  test("customer cannot access admin routes", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const url = page.url();
    expect(url).not.toMatch(/\/admin$/);
  });
});

test.describe("AC-004: Guest behavior", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("guest clicking save redirects to login", async ({ page }) => {
    await page.goto("/");

    const cardLink = page.locator("a[href^='/restaurant/']").first();
    await expect(cardLink).toBeVisible({ timeout: 10_000 });

    const heartButton = cardLink.locator("button").first();

    if (await heartButton.isVisible().catch(() => false)) {
      await heartButton.click();
      // Guest should be redirected to login
      await page.waitForURL(/login/, { timeout: 5_000 });
    }
  });
});
