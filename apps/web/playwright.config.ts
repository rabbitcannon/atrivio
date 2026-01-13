import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * Test directories:
 * - ./e2e/tests/     - Behavioral E2E tests (run with: pnpm test:e2e)
 * - ./e2e/screenshots/ - Documentation screenshots (run with: pnpm screenshots)
 *
 * Usage:
 * - pnpm --filter @atrivio/web test:e2e          # Run all E2E tests
 * - pnpm --filter @atrivio/web test:e2e:headed   # Run with browser visible
 * - pnpm --filter @atrivio/web test:e2e:debug    # Run in debug mode
 * - pnpm --filter @atrivio/web screenshots       # Run screenshot tests only
 */
export default defineConfig({
  // Default test directory for E2E tests
  testDir: './e2e/tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only is left in code
  forbidOnly: !!process.env.CI,

  // Retry failed tests (more retries in CI)
  retries: process.env.CI ? 2 : 1,

  // Limit parallel workers in CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['html', { open: 'on-failure' }]],

  // Global test timeout
  timeout: 30000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:3000',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshots on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: process.env.CI ? 'on-first-retry' : 'off',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Browser projects
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14'],
      },
    },

    // Screenshot tests (separate project)
    {
      name: 'screenshots',
      testDir: './e2e/screenshots',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },

    // Smoke tests (quick verification suite)
    {
      name: 'smoke',
      testDir: './e2e/smoke',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Run local dev servers before tests (API + Web)
  webServer: [
    // Start API server first (NestJS on port 3001)
    {
      command: 'pnpm --filter @atrivio/api dev',
      url: 'http://localhost:3001/api/v1/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      cwd: '../../', // Run from monorepo root
    },
    // Then start web server (Next.js on port 3000)
    {
      command: 'pnpm --filter @atrivio/web dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      cwd: '../../', // Run from monorepo root
    },
  ],
});
