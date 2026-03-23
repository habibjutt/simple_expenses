import { type Page, expect } from '@playwright/test';

export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL ?? 'habibjutt868@gmail.com',
  password: process.env.TEST_USER_PASSWORD ?? '12345678',
  name: 'Habib',
};

/** Log in via the UI and wait for the dashboard. */
export async function loginAs(
  page: Page,
  email = TEST_USER.email,
  password = TEST_USER.password,
) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

/**
 * Log out via the header user dropdown.
 * Opens the Radix DropdownMenu trigger (aria-haspopup="menu") in the header,
 * then clicks the "Logout" menu item.
 */
export async function logout(page: Page) {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  // Open user dropdown — Radix DropdownMenuTrigger adds aria-haspopup="menu"
  await page.locator('header [aria-haspopup="menu"]').click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
  await page.waitForURL('**/login', { timeout: 10_000 });
}

/**
 * Assert a visible error message on the page.
 * Auth forms render errors in a div with class bg-red-50.
 */
export async function expectError(page: Page, text: string | RegExp) {
  const alert = page
    .locator('[role="alert"], .bg-red-50, .text-destructive, .text-red-500')
    .filter({ hasText: text });
  await expect(alert.first()).toBeVisible({ timeout: 8_000 });
}
