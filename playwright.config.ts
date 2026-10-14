import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testMatch:
    process.env.NEXT_PUBLIC_SAFE_PREVIEW === "true"
      ? "**/preview.spec.ts"
      : "**/*.spec.ts",
  testIgnore:
    process.env.NEXT_PUBLIC_SAFE_PREVIEW === "true"
      ? []
      : ["**/preview.spec.ts"],
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 20000 },
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    env: {
      AI_PROVIDER: "fixture",
      ALLOW_DEMO_MODE: "true",
      LANGSMITH_TRACING: "false",
      LANGSMITH_API_KEY: "",
      TAVILY_API_KEY: "",
      NEBIUS_API_KEY: "",
      DATABASE_URL: "",
      PERSISTENCE_PROVIDER: "browser",
      RATE_LIMIT_BACKEND: "memory",
      LIVE_AI_ACCESS_CODE: "",
      SESSION_SIGNING_SECRET: "",
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
});
