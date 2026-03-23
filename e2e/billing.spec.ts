/**
 * Billing Logic E2E Tests (GitHub Issue #63)
 *
 * Verifies the credit card invoice boundary logic. A credit card with
 * billGenerationDate=10 generates a monthly "cut-off" on the 10th. Transactions
 * on or before the 10th belong to that month's invoice; transactions after the
 * 10th belong to the next invoice.
 *
 * Test cases covered:
 *   TC-01  Day AFTER  bill gen date  → appears in next   invoice only
 *   TC-02  Day BEFORE bill gen date  → appears in current invoice
 *   TC-04  Exactly ON bill gen date  → appears in current invoice  (boundary fix)
 *   TC-09  3 installments ON bill gen date → 1st in current, 2nd/3rd in successive invoices
 *   TC-15  installments = 0  → rejected by HTML5 form validation
 *   TC-16  installments = −1 → rejected by HTML5 form validation
 *
 * Each test creates a fresh account; no stored session state is used.
 */

import { test, expect, type Page } from '@playwright/test';

// ─── Constants ────────────────────────────────────────────────────────────────

const BILL_GEN_DAY = 10;
const CARD_NAME    = 'Test Billing Card';

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the most recent occurrence of BILL_GEN_DAY — i.e. the billStartDate
 * of the invoice that is currently "active" in the UI.
 *
 * Uses the LOCAL calendar day (matching the server's own `new Date().getDate()`
 * check) but returns a UTC-midnight Date so that calendar interactions and DB
 * storage are consistent with the server's `Date.UTC(year, month, billGenDay)`
 * boundary values.  The Playwright billing project sets `timezoneId:'UTC'` in
 * the browser so `DayPicker.onSelect` → `d.toISOString().split("T")[0]` always
 * produces the same date the test intended.
 */
function getBillPeriodStart(): Date {
  const today = new Date();
  const localDay = today.getDate();   // matches server's `new Date().getDate()`
  if (localDay >= BILL_GEN_DAY) {
    return new Date(Date.UTC(today.getFullYear(), today.getMonth(), BILL_GEN_DAY));
  }
  // Before the cut-off: previous month's bill start
  return new Date(Date.UTC(today.getFullYear(), today.getMonth() - 1, BILL_GEN_DAY));
}

// ─── Page-interaction helpers ──────────────────────────────────────────────────

/**
 * Creates a pre-verified test user via the seed-user API endpoint.
 * The endpoint calls Better Auth's signInEmail internally (bypassing the
 * IP-based rate limiter) and forwards the session Set-Cookie header.
 * Playwright's page.request automatically stores those cookies in the
 * browser's cookie jar — so the next page.goto('/dashboard') is authenticated
 * without any manual cookie injection.
 */
async function signUpFresh(page: Page): Promise<void> {
  const res = await page.request.post('/api/test-utils/seed-user');
  if (!res.ok()) {
    throw new Error(`seed-user failed: ${res.status()} ${await res.text()}`);
  }

  // Session cookie is already in the browser's cookie jar from the Set-Cookie
  // response header forwarded by seed-user.
  await page.goto('/dashboard');
  await page.waitForURL('**/dashboard', { timeout: 30_000 });
}

async function createCreditCard(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Add Card' }).click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });
  await page.getByLabel('Credit card name').fill(CARD_NAME);
  await page.getByLabel('Bill generation date').fill(String(BILL_GEN_DAY));
  await page.getByLabel('Payment due date').fill('5');
  await page.getByLabel('Card limit').fill('50000');
  await page.getByRole('dialog').getByRole('button', { name: 'Add Card' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 30_000 });
}

/**
 * Select a date in the react-day-picker calendar that opens inside
 * `[data-slot="calendar"]`. Uses the month/year `<select>` dropdowns
 * (captionLayout="dropdown") to navigate directly to the target month/year,
 * then clicks the day button by its `data-day` attribute.
 */
async function selectCalendarDate(page: Page, date: Date): Promise<void> {
  const calendar = page.locator('[data-slot="calendar"]');
  await expect(calendar).toBeVisible({ timeout: 5_000 });

  // react-day-picker renders two native <select> elements in dropdown caption mode:
  //   nth(0) = month  (option value = "0"…"11")
  //   nth(1) = year   (option value = "2024", "2025", …)
  // The selects are styled with opacity-0 (overlaid on the visible caption labels)
  // but are still fully interactive.
  // Use UTC month/year because the browser runs with timezoneId:'UTC', so the
  // calendar renders days keyed by their UTC date.
  const selects = calendar.locator('select');
  if ((await selects.count()) >= 2) {
    await selects.nth(0).selectOption({ value: String(date.getUTCMonth()) }, { force: true });
    await selects.nth(1).selectOption({ value: String(date.getUTCFullYear()) }, { force: true });
  }

  // Format using UTC timezone so the string matches the browser calendar's
  // data-day attributes (browser is UTC-pinned via timezoneId:'UTC').
  const dayStr = date.toLocaleDateString('en-US', { timeZone: 'UTC' });
  await calendar.locator(`button[data-day="${dayStr}"]`).click();
}

/**
 * Open a FormCombobox (identified by its current display text) and select an option.
 * The combobox renders with role="combobox" on the trigger button and a
 * `[cmdk-input]` search field inside the popover.
 *
 * Uses `.last()` for the cmdk input because Radix UI portals append newest-last,
 * so when a previous popover is still animating out there may be two inputs.
 * After selection, waits for all popovers to close before returning so the
 * next call never encounters stale cmdk inputs.
 */
async function pickCombobox(page: Page, placeholder: string, optionText: string): Promise<void> {
  await page
    .locator('button[role="combobox"]')
    .filter({ hasText: placeholder })
    .first()
    .click();

  // Use .last() – Radix portals append newest last, avoiding strict-mode
  // violations when a previous popover is still animating closed.
  const cmdInput = page.locator('[cmdk-input]').last();
  await expect(cmdInput).toBeVisible({ timeout: 5_000 });
  await cmdInput.fill(optionText);

  // cmdk items have role="option" on the CommandItem elements
  await page
    .getByRole('option', { name: new RegExp(escapeRegex(optionText), 'i') })
    .first()
    .click();

  // Wait for ALL open popovers to close so the next pickCombobox call does
  // not find stale cmdk inputs from this one still in the DOM.
  await page.waitForFunction(
    () => document.querySelectorAll('[cmdk-input]').length === 0,
    { timeout: 5_000 },
  ).catch(() => { /* ignore if already gone */ });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface TxInput {
  name:         string;
  amount:       number;
  date:         Date;
  category?:    string;
  installments?: number;
}

/**
 * Add a credit-card expense from the dashboard's "Add Transaction" button.
 * Waits for the dialog to close before returning.
 */
async function addExpense(page: Page, tx: TxInput): Promise<void> {
  await page.getByRole('button', { name: 'Add Transaction' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 5_000 });

  await page.getByLabel('Transaction amount').fill(String(tx.amount));
  await page.getByLabel('Transaction description').fill(tx.name);

  // Open the date picker and select the date
  await page.getByLabel('Select transaction date').click();
  await selectCalendarDate(page, tx.date);

  // Category combobox
  await pickCombobox(page, 'Select category…', tx.category ?? 'Shopping');

  // Pay With = Credit Card  (default is "Bank Account", so find by current text)
  await pickCombobox(page, 'Bank Account', 'Credit Card');

  // Credit card selector
  await pickCombobox(page, 'Select card…', CARD_NAME);

  // Installments (requires expanding Advanced options; only available for CC expenses)
  if (tx.installments && tx.installments > 1) {
    await page.locator('button').filter({ hasText: 'Advanced options' }).click();
    // The installments switch is the first role="switch" inside the dialog
    await dialog.locator('[role="switch"]').first().click();
    await page.getByLabel('Number of installments').fill(String(tx.installments));
  }

  await dialog.getByRole('button', { name: 'Add Expense' }).click();
  await expect(dialog).not.toBeVisible({ timeout: 20_000 });
}

/** Navigate to the credit card detail page by clicking the card on the dashboard. */
async function goToCreditCardPage(page: Page): Promise<void> {
  // The card is rendered as a <button> with an accessible name containing the card
  // name. Use getByRole to avoid matching non-navigating text (e.g., Upcoming Bills).
  await page
    .getByRole('button', { name: new RegExp(escapeRegex(CARD_NAME)) })
    .click();
  await page.waitForURL('**/credit-card/**', { timeout: 15_000 });
  // Wait for the month navigation bar to confirm the page has loaded
  await expect(page.getByLabel('Next month')).toBeVisible({ timeout: 15_000 });
}

/** Wait for invoice data to reload after month navigation. */
async function waitForInvoiceReload(page: Page): Promise<void> {
  // The page replaces its content with a full-page spinner (animate-spin) while
  // loading, then shows the invoice content. Wait for the spinner to be gone.
  // If it never appears (very fast response) we skip the wait gracefully.
  const spinner = page.locator('.animate-spin').first();
  await spinner.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {/* ignore if never shown */});
  // Ensure the navigation bar is visible (confirms full content is rendered)
  await expect(page.getByLabel('Next month')).toBeVisible({ timeout: 10_000 });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

// Give each test 2 minutes — DB cold-start + multiple server-action round-trips
// can take well over the 30 s Playwright default.
test.beforeEach(async () => {
  test.setTimeout(120_000);
});

test.describe('Billing boundary – single transactions (Issue #63)', () => {
  /**
   * TC-02: transaction one day BEFORE bill gen date → in current invoice
   * TC-04: transaction exactly ON  bill gen date   → in current invoice  (bug fix)
   * TC-01: transaction one day AFTER  bill gen date → in NEXT invoice only
   */
  test('TC-02, TC-04, TC-01: transactions land in the correct invoices', async ({ page }) => {
    await signUpFresh(page);
    await createCreditCard(page);

    const billStart = getBillPeriodStart();

    // TC-02: the day before the cut-off (UTC midnight)
    const tc02Date = new Date(Date.UTC(billStart.getUTCFullYear(), billStart.getUTCMonth(), BILL_GEN_DAY - 1));
    // TC-04: exactly on the cut-off date (UTC midnight)
    const tc04Date = new Date(billStart);
    // TC-01: the day after the cut-off (UTC midnight) – belongs to the NEXT billing period
    const tc01Date = new Date(Date.UTC(billStart.getUTCFullYear(), billStart.getUTCMonth(), BILL_GEN_DAY + 1));

    await test.step('Add TC-02 (day before boundary)', async () => {
      await addExpense(page, { name: 'TC02 Before Boundary', amount: 100, date: tc02Date });
    });

    await test.step('Add TC-04 (exactly on boundary)', async () => {
      await addExpense(page, { name: 'TC04 On Boundary', amount: 200, date: tc04Date });
    });

    await test.step('Add TC-01 (day after boundary)', async () => {
      await addExpense(page, { name: 'TC01 After Boundary', amount: 300, date: tc01Date });
    });

    await test.step('Navigate to credit card detail page', async () => {
      await goToCreditCardPage(page);
    });

    await test.step('Current invoice contains TC-02 and TC-04 but NOT TC-01', async () => {
      await expect(page.getByText('TC02 Before Boundary')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('TC04 On Boundary')).toBeVisible();
      await expect(page.getByText('TC01 After Boundary')).not.toBeVisible();
    });

    await test.step('Next invoice contains TC-01, but not TC-02 or TC-04', async () => {
      await page.getByLabel('Next month').click();
      // Wait for TC-01 to appear (confirms the new invoice has loaded)
      await expect(page.getByText('TC01 After Boundary')).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText('TC02 Before Boundary')).not.toBeVisible();
      await expect(page.getByText('TC04 On Boundary')).not.toBeVisible();
    });
  });
});

test.describe('Billing boundary – installments (Issue #63)', () => {
  /**
   * TC-09: 3 installments created on the bill gen date.
   * Installment 1 must land in the current invoice (same month as bill gen date).
   * Installment 2 must land in the next invoice.
   * Installment 3 must land in the invoice after that.
   */
  test('TC-09: installments on bill gen date split across successive invoices', async ({ page }) => {
    await signUpFresh(page);
    await createCreditCard(page);

    // Transaction date = exactly on the bill gen date
    const tc09Date = getBillPeriodStart();

    await test.step('Add TC-09 (3 installments on boundary date)', async () => {
      await addExpense(page, {
        name:         'TC09 Installment',
        amount:       300,
        date:         tc09Date,
        installments: 3,
      });
    });

    await test.step('Navigate to credit card detail page', async () => {
      await goToCreditCardPage(page);
    });

    await test.step('Current invoice shows installment 1/3 only', async () => {
      await expect(page.getByText('TC09 Installment (1/3)')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('TC09 Installment (2/3)')).not.toBeVisible();
      await expect(page.getByText('TC09 Installment (3/3)')).not.toBeVisible();
    });

    await test.step('Next invoice shows installment 2/3 only', async () => {
      await page.getByLabel('Next month').click();
      await expect(page.getByText('TC09 Installment (2/3)')).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText('TC09 Installment (1/3)')).not.toBeVisible();
      await expect(page.getByText('TC09 Installment (3/3)')).not.toBeVisible();
    });

    await test.step('Invoice two months ahead shows installment 3/3 only', async () => {
      await page.getByLabel('Next month').click();
      await expect(page.getByText('TC09 Installment (3/3)')).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText('TC09 Installment (1/3)')).not.toBeVisible();
      await expect(page.getByText('TC09 Installment (2/3)')).not.toBeVisible();
    });
  });
});

test.describe('Installment count validation (Issue #63 TC-15 / TC-16)', () => {
  /** Shared setup: sign up and create a credit card, then open the transaction modal. */
  async function openInstallmentsForm(page: Page): Promise<ReturnType<typeof page.getByRole>> {
    await signUpFresh(page);
    await createCreditCard(page);

    await page.getByRole('button', { name: 'Add Transaction' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Fill in the minimum required fields
    await page.getByLabel('Transaction amount').fill('100');
    await page.getByLabel('Transaction description').fill('Validation Test');
    await page.getByLabel('Select transaction date').click();
    await selectCalendarDate(page, getBillPeriodStart());
    await pickCombobox(page, 'Select category…', 'Shopping');
    await pickCombobox(page, 'Bank Account', 'Credit Card');
    await pickCombobox(page, 'Select card…', CARD_NAME);

    // Expand Advanced options and enable installments
    await page.locator('button').filter({ hasText: 'Advanced options' }).click();
    await dialog.locator('[role="switch"]').first().click();

    return dialog;
  }

  /**
   * TC-15: installments = 0
   * The <input type="number" min=2> prevents submission via HTML5 validation.
   */
  test('TC-15: installments=0 is rejected – dialog stays open', async ({ page }) => {
    const dialog = await openInstallmentsForm(page);

    await page.getByLabel('Number of installments').fill('0');
    await dialog.getByRole('button', { name: 'Add Expense' }).click();

    // HTML5 constraint (min=2) blocks the submit event; dialog must still be visible
    await expect(dialog).toBeVisible();
  });

  /**
   * TC-16: installments = −1
   * Same constraint applies for negative values.
   */
  test('TC-16: installments=-1 is rejected – dialog stays open', async ({ page }) => {
    const dialog = await openInstallmentsForm(page);

    await page.getByLabel('Number of installments').fill('-1');
    await dialog.getByRole('button', { name: 'Add Expense' }).click();

    await expect(dialog).toBeVisible();
  });
});
