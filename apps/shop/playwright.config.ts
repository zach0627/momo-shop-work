import { defineConfig } from '@playwright/test';

const PORT = 4300;

// E2E 跑的是 build 出來的產物（vite preview），不是 dev server：要驗的是真的會出貨的東西。
export default defineConfig({
  testDir: './e2e',
  outputDir: './test-output/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
    // 用機器上已有的瀏覽器，不另外下載：CI 的 runner 內建 Chrome，本機（Windows）用 Edge
    channel: process.env.CI ? 'chrome' : 'msedge',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm exec nx preview shop',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // 常駐的 daemon 會讓這個子行程收不掉（見 docs/agent-workflow.md §4）
    env: { NX_DAEMON: 'false' },
  },
});
