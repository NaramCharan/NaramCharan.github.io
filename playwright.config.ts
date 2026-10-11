import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:8188', headless: true, trace: 'retain-on-failure' },
  webServer: {
    command: 'python3 -m http.server 8188 --bind 127.0.0.1 --directory out',
    url: 'http://127.0.0.1:8188',
    reuseExistingServer: !process.env.CI,
  },
});
