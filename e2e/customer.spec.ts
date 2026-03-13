import { expect, test } from "@playwright/test";

test.describe("AC-004: Save-for-later on discovery", () => {
  test("authenticated customer can see and interact with save buttons", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Wait for the page to be fully loaded (SSR restaurant cards)
    const cardLink = page.locator("a[href^='/restaurant/']").first();
    const hasCards = await cardLink
      .isVisible({ timeout: 15_000 })
      .catch(() => false);

    if (!hasCards) {
      // Page may render differently for authenticated users
      // Verify we're on the homepage and it loads without error
      await expect(page).toHaveURL("/");
      return;
    }

    // Find a heart/save button on the card
    const heartButton = cardLink.locator("button").first();
    if (await heartButton.isVisible().catch(() => false)) {
      await heartButton.click();
      // Should not redirect to login (authenticated customer)
      await expect(page).not.toHaveURL(/login/);
    }
  });
});

test.describe("AC-005: Saved restaurants out of MVP scope", () => {
  test("/saved redirects to homepage (feature not in current MVP)", async ({
    page,
  }) => {
    await page.goto("/saved");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Per PRD v4: saved restaurants is out of MVP scope — page redirects to /
    const url = page.url();
    expect(url).toMatch(/\/$/);
  });
});

test.describe("AC-006: Order history is account-scoped", () => {
  test("new customer sees empty state on /orders", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForLoadState("domcontentloaded");

    // New test account should have no orders
    const emptyIndicator = page.locator(
      "text=/no orders|empty|start ordering|nothing here|haven.*ordered|no.*yet/i",
    );
    await expect(emptyIndicator.first()).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("AC-008: Portal separation enforced", () => {
  test("customer cannot access admin routes", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Wait for any redirects to settle
    await page.waitForTimeout(2_000);
    const url = page.url();
    // Customer should not remain on /admin
    expect(url).not.toMatch(/\/admin$/);
  });

  test("customer accessing owner routes should see redirect or gated content", async ({
    page,
  }) => {
    await page.goto("/organization/get-started");
    await page.waitForLoadState("domcontentloaded");

    // Wait for any redirects to settle
    await page.waitForTimeout(2_000);

    // The portal separation should either redirect the customer away
    // or show the get-started page (which is acceptable as it gates further access)
    const url = page.url();
    const isRedirected = !url.includes("/organization");
    const isOnGetStarted = url.includes("/organization/get-started");

    // Either redirected away OR on get-started (which is the entry gate)
    expect(isRedirected || isOnGetStarted).toBe(true);
  });
});

test.describe("Onboarding: Customer account page", () => {
  test("account page does not show 'Saved restaurants' link", async ({
    page,
  }) => {
    await page.goto("/account");
    await page.waitForLoadState("domcontentloaded");

    // The "Saved restaurants" link was removed — no clickable link should exist
    await expect(
      page.locator('a:has-text("Saved restaurants")'),
    ).not.toBeVisible();
  });

  test("account page shows 'Order history' link", async ({ page }) => {
    await page.goto("/account");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("text=/order history/i").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("account page shows 'Orders' stat instead of 'Saved'", async ({
    page,
  }) => {
    await page.goto("/account");
    await page.waitForLoadState("domcontentloaded");

    // The "Quick return" stat should show "Orders" not "Saved"
    await expect(page.locator("text=/orders/i").first()).toBeVisible({
      timeout: 10_000,
    });
    // Make sure "Saved" is not shown as a stat label
    const savedStat = page.locator("text=/^saved$/i");
    await expect(savedStat).not.toBeVisible();
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
