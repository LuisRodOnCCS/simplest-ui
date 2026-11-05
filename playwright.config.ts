import { defineConfig, devices } from "@playwright/test";

const visualTests = /visual\.spec\.ts/;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // WebKit becomes unreliable on GitHub-hosted Linux runners when it shares
  // CPU and memory with another browser process. Keep CI browser runs serial.
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01
    }
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "chromium", testIgnore: visualTests, use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", testIgnore: visualTests, use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", testIgnore: visualTests, use: { ...devices["Desktop Safari"] } },
    // Baselines are generated and compared on Windows so the fonts and browser
    // rendering match the CI runner used by the visual job.
    { name: "visual", testMatch: visualTests, use: { ...devices["Desktop Chrome"] } }
  ],
  webServer: {
    command: "npm run docs:serve",
    url: "http://127.0.0.1:5173/docs/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
