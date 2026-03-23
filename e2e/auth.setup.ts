/**
 * Auth setup: authenticates once as the test user and saves the browser storage
 * state (cookies + localStorage) to disk so that subsequent test projects can
 * skip the login flow entirely.
 *
 * Run order in playwright.config.ts:
 *   setup → chromium (uses saved storageState)
 *
 * The auth-flows project intentionally does NOT depend on this setup so that
 * auth tests always start from an unauthenticated state.
 */
import { test as setup, expect } from '@playwright/test';
import { mkdirSync } from 'fs';
import path from 'path';
import { loginAs, TEST_USER } from './fixtures/auth';

export const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as test user', async ({ page }) => {
  mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await loginAs(page, TEST_USER.email, TEST_USER.password);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: AUTH_FILE });
});
