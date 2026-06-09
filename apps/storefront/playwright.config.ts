import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const envFile = path.resolve(__dirname, '.env.local')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim())
    if (match && match[1] && !process.env[match[1]]) {
      process.env[match[1]] = match[2]
    }
  }
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  timeout: 90_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      // Enables test-mode order completion (bypasses Razorpay/Stripe).
      // Active when the server is started fresh by Playwright (e.g. CI).
      // For local runs with a pre-existing dev server, start it manually with
      // CHECKOUT_TEST_MODE=true pnpm dev --filter=storefront
      CHECKOUT_TEST_MODE: 'true',
    },
  },
})
