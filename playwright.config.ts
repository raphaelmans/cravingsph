import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "public",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /public\.spec\.ts/,
    },
    {
      name: "customer",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/customer.json",
      },
      testMatch: /customer\.spec\.ts/,
      dependencies: ["setup"],
    },
    {
      name: "owner",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/owner.json",
      },
      testMatch: /owner\.spec\.ts/,
      dependencies: ["setup"],
    },
    {
      name: "admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/admin.json",
      },
      testMatch: /admin\.spec\.ts/,
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
