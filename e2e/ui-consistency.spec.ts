import { test, expect } from '@playwright/test';

test.describe('UI Consistency Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page first
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Try to login if login form exists
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign in")');
    
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();
      await page.waitForURL('**/', { timeout: 5000 }).catch(() => {});
    }
  });

  test('Home page has consistent layout and footer padding', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check footer is fixed at bottom
    const footerBox = await footer.boundingBox();
    const viewportHeight = page.viewport()?.height || 800;
    expect(footerBox?.y).toBeGreaterThan(viewportHeight - 150);

    // Check main content has bottom padding
    const main = page.locator('main');
    const mainBox = await main.boundingBox();
    if (mainBox) {
      // Main content should not be hidden by footer
      expect(mainBox.height + mainBox.y).toBeLessThan(viewportHeight - 80);
    }

    // Check footer buttons are visible
    const homeButton = footer.locator('a[href="/"]');
    const transactionsButton = footer.locator('a[href="/transactions"]');
    const addButton = footer.locator('button');
    
    await expect(homeButton).toBeVisible();
    await expect(transactionsButton).toBeVisible();
    await expect(addButton).toBeVisible();
  });

  test('Credit card detail page has consistent layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to find and click a credit card link
    const cardLink = page.locator('a[href*="/credit-card/"]').first();
    if (await cardLink.count() > 0) {
      await cardLink.click();
      await page.waitForLoadState('networkidle');

      // Check footer exists
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Check main content has bottom padding
      const main = page.locator('main');
      const mainBox = await main.boundingBox();
      const viewportHeight = page.viewport()?.height || 800;
      
      if (mainBox) {
        // Content should not be hidden by footer
        expect(mainBox.height + mainBox.y).toBeLessThan(viewportHeight - 80);
      }

      // Check transactions are visible (not hidden by footer)
      const transactions = page.locator('[class*="transaction"], [class*="Transaction"]');
      if (await transactions.count() > 0) {
        const lastTransaction = transactions.last();
        const transactionBox = await lastTransaction.boundingBox();
        const footerBox = await footer.boundingBox();
        
        if (transactionBox && footerBox) {
          expect(transactionBox.y + transactionBox.height).toBeLessThan(footerBox.y);
        }
      }
    }
  });

  test('Bank account detail page has consistent layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to find and click a bank account link
    const accountLink = page.locator('a[href*="/bank-account/"]').first();
    if (await accountLink.count() > 0) {
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Check footer exists
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Check main content has bottom padding
      const main = page.locator('main');
      const mainBox = await main.boundingBox();
      const viewportHeight = page.viewport()?.height || 800;
      
      if (mainBox) {
        expect(mainBox.height + mainBox.y).toBeLessThan(viewportHeight - 80);
      }
    }
  });

  test('Transactions page has consistent layout', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // Check footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check main content has bottom padding
    const main = page.locator('main');
    const mainBox = await main.boundingBox();
    const viewportHeight = page.viewport()?.height || 800;
    
    if (mainBox) {
      expect(mainBox.height + mainBox.y).toBeLessThan(viewportHeight - 80);
    }

    // Check transactions list is visible
    const transactions = page.locator('[class*="transaction"], [class*="Transaction"]');
    if (await transactions.count() > 0) {
      const lastTransaction = transactions.last();
      const transactionBox = await lastTransaction.boundingBox();
      const footerBox = await footer.boundingBox();
      
      if (transactionBox && footerBox) {
        expect(transactionBox.y + transactionBox.height).toBeLessThan(footerBox.y);
      }
    }
  });

  test('Manage cards page has consistent layout', async ({ page }) => {
    await page.goto('/manage-cards');
    await page.waitForLoadState('networkidle');

    // Check footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check main content has bottom padding
    const main = page.locator('main');
    const mainBox = await main.boundingBox();
    const viewportHeight = page.viewport()?.height || 800;
    
    if (mainBox) {
      expect(mainBox.height + mainBox.y).toBeLessThan(viewportHeight - 80);
    }
  });

  test('Manage accounts page has consistent layout', async ({ page }) => {
    await page.goto('/manage-accounts');
    await page.waitForLoadState('networkidle');

    // Check footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check main content has bottom padding
    const main = page.locator('main');
    const mainBox = await main.boundingBox();
    const viewportHeight = page.viewport()?.height || 800;
    
    if (mainBox) {
      expect(mainBox.height + mainBox.y).toBeLessThan(viewportHeight - 80);
    }
  });

  test('All pages have footer with consistent styling', async ({ page }) => {
    const pages = ['/', '/transactions', '/manage-cards', '/manage-accounts'];
    
    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Check footer has consistent styling
      const footerClasses = await footer.getAttribute('class');
      expect(footerClasses).toContain('fixed');
      expect(footerClasses).toContain('bottom-0');
      expect(footerClasses).toContain('bg-white');

      // Check footer buttons exist
      const buttons = footer.locator('button, a');
      await expect(buttons.first()).toBeVisible();
    }
  });

  test('Footer does not hide action buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for floating action buttons
    const floatingButtons = page.locator('button[class*="fixed"], button[aria-label*="Add"], button[aria-label*="transaction"]');
    const count = await floatingButtons.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const button = floatingButtons.nth(i);
        const buttonBox = await button.boundingBox();
        const footer = page.locator('footer');
        const footerBox = await footer.boundingBox();
        
        if (buttonBox && footerBox) {
          // Button should be above footer
          expect(buttonBox.y + buttonBox.height).toBeLessThan(footerBox.y);
        }
      }
    }
  });
});

