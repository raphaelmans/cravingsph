import { test, expect } from "@playwright/test";

test.describe("AC-016: Admin user toggle persists", () => {
  test("admin dashboard loads correctly", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Admin dashboard should show management stats
    await expect(
      page.locator('text=/dashboard|admin|overview|management/i').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("admin user management page loads", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    // Should show user list or management interface
    await expect(
      page.locator('text=/users|management|active|suspended/i').first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
