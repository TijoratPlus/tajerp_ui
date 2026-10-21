import { defineConfig, devices } from "@playwright/test";

/**
 * Story smoke test: renders every Storybook story in Chromium (light and
 * dark), fails on runtime errors and on serious/critical axe violations
 * (colour contrast included — jsdom unit tests cannot check it).
 * Run after `npm run build-storybook`.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 10 * 60 * 1000,
  use: {
    baseURL: "http://localhost:6007",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "node scripts/serve-static.mjs storybook-static 6007",
    url: "http://localhost:6007/index.json",
    reuseExistingServer: !process.env.CI,
  },
});
