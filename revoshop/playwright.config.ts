import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Load .env.local so E2E_ADMIN_* (and any other local env) are available to
// the tests. Next.js loads this for the app; Playwright runs in its own
// process, so we load it here too.
loadEnv({ path: ".env.local" });

/**
 * Playwright config for RevoShop E2E tests.
 *
 * The tests drive the real app against the live Flask API, so timeouts are
 * generous: the free Render backend can cold-start and take ~50s on the first
 * request. `webServer` starts `npm run dev` automatically and reuses an
 * already-running dev server locally.
 *
 * Admin credentials come from env vars (E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD)
 * so no real credentials live in the committed source. See README / .env.example.
 */
const PORT = 3000;
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // A single worker: the admin CRUD flow mutates shared backend data, so
  // running specs in parallel against one database invites interference.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],

  // Per-test timeout and assertion timeout kept high for backend cold starts.
  timeout: 90_000,
  expect: { timeout: 20_000 },

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Start the Next dev server for the tests (reused if already running).
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
