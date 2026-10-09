import { defineConfig } from "@playwright/test";

const port = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${port}`,
    viewport: { width: 360, height: 740 },
    isMobile: true,
    hasTouch: true,
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : undefined,
  },
  webServer: {
    command: `npm run build && npx next start -p ${port}`,
    port,
    timeout: 240_000,
    reuseExistingServer: true,
    // Test-only key (production refuses to store BVNs without a real DATA_ENCRYPTION_KEY)
    env: { DATA_ENCRYPTION_KEY: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=", SESSION_SECRET: "test-session-secret-0123456789abcdefghij" },
  },
});
