import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Auth credentials for the test user:
 *   TEST_USER_EMAIL    (defaults to habibjutt868@gmail.com)
 *   TEST_USER_PASSWORD (defaults to 12345678)
 */

const authFile = path.join(__dirname, "playwright/.auth/user.json");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    // 1. Authenticate once and persist session state to disk.
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // 2. Auth flow tests — must start unauthenticated, no stored session.
    {
      name: "auth-flows",
      testMatch: /auth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // 4. Billing boundary logic tests — creates its own fresh account, no stored session.
    {
      name: "billing",
      testMatch: /billing\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        // Force en-US locale so date.toLocaleDateString() in the browser matches
        // the en-US format used in the test helpers (M/D/YYYY).
        locale: "en-US",
        // Force UTC browser timezone so DayPicker's toISOString() stores the same
        // calendar date the test picked — without this, UTC+N machines store
        // "March 11 local midnight" as "March 10 UTC", breaking boundary assertions.
        timezoneId: "UTC",
      },
    },

    // 3. All other tests — reuse the saved session so login is skipped.
    {
      name: "chromium",
      testMatch: /ui-consistency\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
