import { expect, test } from "@playwright/test";

test.describe("AC-001: Discovery shows live data", () => {
  test("homepage shows restaurant cards from database", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // SSR page renders restaurant cards with links
    const restaurantLinks = page.locator('a[href^="/restaurant/"]');
    await expect(restaurantLinks.first()).toBeVisible({ timeout: 10_000 });

    const count = await restaurantLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("clicking a restaurant card navigates to working page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const restaurantLink = page.locator('a[href^="/restaurant/"]').first();
    await expect(restaurantLink).toBeVisible({ timeout: 10_000 });

    const href = await restaurantLink.getAttribute("href");
    expect(href).toBeTruthy();

    await restaurantLink.click();
    await page.waitForURL(/\/restaurant\//, { timeout: 10_000 });

    // Page should render restaurant content, not an error
    await expect(page.locator("text=not found")).not.toBeVisible();
  });
});

test.describe("AC-002: Search filters by location", () => {
  test("search page renders and has filter controls", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("domcontentloaded");

    // Search input should be present
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });

    // Location filter (combobox or select) should be present
    const locationFilter = page.getByRole("combobox");
    await expect(locationFilter).toBeVisible({ timeout: 5_000 });

    // Cuisine filter pills should be present
    const cuisinePills = page.locator("text=/Filipino|Chicken|Seafood/i");
    await expect(cuisinePills.first()).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("AC-003: QR scanner", () => {
  test("QR scan button is present on homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // The fixed-position scan button should be visible
    const scanButton = page.getByRole("button", { name: /scan cravings qr/i });
    await expect(scanButton).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("AC-015: Breadcrumb hydration clean", () => {
  test("homepage loads without hydration errors in console", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const hydrationErrors = consoleErrors.filter(
      (e) =>
        e.includes("Hydration") ||
        e.includes("hydration") ||
        e.includes("did not match") ||
        e.includes("cannot appear as") ||
        e.includes("validateDOMNesting"),
    );
    expect(hydrationErrors).toHaveLength(0);
  });
});

test.describe("AC-018: No image URL crashes", () => {
  test("restaurant page loads images without hostname errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Use the discovery API to get a valid slug, then navigate directly
    const res = await page.request.get(
      "/api/trpc/discovery.nearby?input=%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D",
    );
    const body = await res.json();
    const slug = body?.result?.data?.[0]?.slug;

    if (slug) {
      await page.goto(`/restaurant/${slug}`);
      await page.waitForLoadState("domcontentloaded");

      // Check no "hostname" or "not configured" image errors
      const imageErrors = consoleErrors.filter(
        (e) =>
          e.includes("hostname") ||
          e.includes("not configured") ||
          (e.includes("next/image") && e.includes("Error")),
      );
      expect(imageErrors).toHaveLength(0);
    }
  });
});
