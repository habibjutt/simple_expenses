/**
 * End-to-end tests for all authentication flows:
 *   - Login (valid, wrong password, non-existent email, empty fields)
 *   - Signup (valid new account, duplicate email, weak password, mismatched passwords, empty)
 *   - Logout (clears session → /login)
 *   - Session persistence (survives page reload)
 *   - Admin access (admin user allowed, non-admin and unauthenticated denied)
 *   - Forgot password (known email, unknown email — no user enumeration)
 *
 * These tests intentionally run WITHOUT stored session state so that every auth
 * interaction is tested from scratch. See playwright.config.ts for project setup.
 *
 * Credentials are read from env vars (TEST_USER_EMAIL / TEST_USER_PASSWORD)
 * with fallback to the default test account defined in e2e/fixtures/auth.ts.
 */
import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from './fixtures/auth';

// ─── Login ────────────────────────────────────────────────────────────────────

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('valid credentials redirect to /dashboard', async ({ page }) => {
    await page.locator('#email').fill(TEST_USER.email);
    await page.locator('#password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('wrong password shows error message', async ({ page }) => {
    await page.locator('#email').fill(TEST_USER.email);
    await page.locator('#password').fill('wrong_password_xyz');
    await page.getByRole('button', { name: 'Login' }).click();
    // Wait for the request to complete (button re-enables) before asserting error
    await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled({ timeout: 15_000 });
    await expect(page.locator('.bg-red-50')).toBeVisible();
  });

  test('non-existent email shows error message', async ({ page }) => {
    await page.locator('#email').fill('nobody@nonexistent.example.com');
    await page.locator('#password').fill('somepassword123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 8_000 });
  });

  test('empty fields prevent submission (browser validation)', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();
    // HTML5 required attributes prevent form submission; URL stays on /login
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── Signup ───────────────────────────────────────────────────────────────────

test.describe('Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
  });

  test('valid new account redirects to /dashboard', async ({ page }) => {
    // Use a timestamp-based email to avoid duplicate conflicts across runs
    const uniqueEmail = `testuser+${Date.now()}@example.com`;
    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill('password123');
    await page.locator('#confirm-password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('duplicate email shows error message', async ({ page }) => {
    await page.locator('#name').fill('Duplicate User');
    await page.locator('#email').fill(TEST_USER.email);
    await page.locator('#password').fill('password123');
    await page.locator('#confirm-password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 8_000 });
  });

  test('weak password (< 8 chars) shows validation error', async ({ page }) => {
    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill('weaktest@example.com');
    await page.locator('#password').fill('short');
    await page.locator('#confirm-password').fill('short');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('.bg-red-50')).toContainText(/8 characters/);
  });

  test('mismatched passwords show validation error', async ({ page }) => {
    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill('mismatch@example.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirm-password').fill('different456');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('.bg-red-50')).toContainText(/do not match/i);
  });

  test('empty fields prevent submission (browser validation)', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/signup/);
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

test.describe('Logout', () => {
  test('logout clears session and redirects to /login', async ({ page }) => {
    await loginAs(page);
    // The user avatar button in the header is the DropdownMenuTrigger;
    // Radix sets aria-haspopup="menu" on the trigger element.
    await page.locator('header [aria-haspopup="menu"]').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await page.waitForURL('**/login', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── Session Persistence ──────────────────────────────────────────────────────

test.describe('Session Persistence', () => {
  test('authenticated session survives page reload', async ({ page }) => {
    await loginAs(page);
    // Use domcontentloaded — the dashboard has background activity that prevents networkidle
    await page.reload({ waitUntil: 'domcontentloaded' });
    // If session is persisted, dashboard does not redirect to /login
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

// ─── Admin Access ─────────────────────────────────────────────────────────────

test.describe('Admin Access', () => {
  test('unauthenticated user visiting /admin is redirected to /login', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('**/login', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('non-admin user visiting /admin is redirected to /dashboard', async ({ page }) => {
    // Sign up a fresh user — new accounts are non-admin by default
    const uniqueEmail = `nonadmin+${Date.now()}@example.com`;
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.locator('#name').fill('Non Admin User');
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill('password123');
    await page.locator('#confirm-password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15_000 });

    await page.goto('/admin');
    await page.waitForURL('**/dashboard', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('admin user can access /admin panel', async ({ page }) => {
    await loginAs(page);
    await page.goto('/admin');
    await page.waitForURL('**/admin**', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/admin/);
  });
});

// ─── Forgot Password ──────────────────────────────────────────────────────────

test.describe('Forgot Password', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
  });

  test('known email shows confirmation message', async ({ page }) => {
    await page.locator('#email').fill(TEST_USER.email);
    await page.getByRole('button', { name: 'Send reset link' }).click();
    await expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.bg-green-50')).toContainText('Check your inbox');
  });

  test('unknown email shows same confirmation (no user enumeration)', async ({ page }) => {
    await page.locator('#email').fill('nobody_unknown@nonexistent.example.com');
    await page.getByRole('button', { name: 'Send reset link' }).click();
    // Better Auth returns the same success response for unknown emails to
    // prevent email enumeration attacks.
    await expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.bg-green-50')).toContainText('Check your inbox');
  });
});
