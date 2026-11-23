import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/packed",
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5178",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "node scripts/serve-packed-matrix.mjs",
    url: "http://127.0.0.1:5178/",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
