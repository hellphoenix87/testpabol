import { defineConfig, devices } from "@playwright/experimental-ct-react";
import dotenv from "dotenv";
import path from "path";

import viteConfig from "./vite.config";

dotenv.config({ path: path.resolve("../../.env.test") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
  snapshotDir: "./__snapshots__",
  /* Maximum time one test can run for: account for potential Cloud Run cold starts. */
  timeout: 25 * 60 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Do not retry by default to avoid flakiness. */
  retries: process.env.CI ? 0 : 0,
  /* Opt out of parallel tests in CI with `1 : undefined`. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /*  Record trace for each test, but remove all traces from successful test runs and keeps for failed ones. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",

    /* Port to use for Playwright component endpoint. */
    ctPort: 3100,
    ctViteConfig: viteConfig({
      mode: "test",
      command: "serve",
      ssrBuild: false,
      resolve: {
        alias: {
          "@shared": path.resolve("../../shared"),
          "@frontend": path.resolve("../frontend"),
          "@app": path.resolve("./src"),
          "@e2e": path.resolve("./tests/e2e"),
        },
      },
    }),
  },
  expect: {
    // Maximum time expect() should wait for the condition to be met (allows Cloud Run cold start).
    timeout: 5000,
  },

  /* Configure projects for major browsers. */
  projects: [
    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"], channel: "chrome" },
      grepInvert: /desktop only/,
      testIgnore: /desktop/,
    },
    {
      name: "Mobile Safari",
      use: devices["iPhone 12"],
      grepInvert: /desktop only/,
      testIgnore: /desktop/,
    },

    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
      grepInvert: /mobile only/,
      testIgnore: /mobile/,
    },
    {
      name: "webkit",
      use: devices["Desktop Safari"],
      grepInvert: /mobile only/,
      testIgnore: /mobile/,
    },
    {
      name: "firefox",
      use: devices["Desktop Firefox"],
      grepInvert: /mobile only/,
      testIgnore: /mobile/,
    },
  ],
});
