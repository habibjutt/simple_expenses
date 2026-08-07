import { test, expect } from "@playwright/test";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

test.describe("Blog CMS", () => {
  test("admin can publish a post and view it live", async ({ page }) => {
    const title = `E2E Published Post ${Date.now()}`;

    await page.goto("/admin/blog/new");
    await page.waitForLoadState("networkidle");

    await page.locator("#post-title").fill(title);
    await page.locator("#post-excerpt").fill("Excerpt written by the e2e test.");
    await page.locator('[contenteditable="true"]').first().click();
    await page.keyboard.type(
      "Body of the e2e test post, including a <script> tag string to confirm sanitization.",
    );

    await page.getByRole("button", { name: "Publish" }).click();
    await page.waitForURL("**/admin/blog", { timeout: 10_000 });
    await expect(page.getByText(title)).toBeVisible();

    const slug = slugify(title);
    await page.goto(`/blog/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    // The literal "<script>" text typed above must render as text, not execute.
    await expect(page.locator("script[src]")).toHaveCount(0);
  });

  test("draft posts 404 on the public site", async ({ page }) => {
    const title = `E2E Draft Post ${Date.now()}`;

    await page.goto("/admin/blog/new");
    await page.waitForLoadState("networkidle");

    await page.locator("#post-title").fill(title);
    await page.locator("#post-excerpt").fill("Draft excerpt.");
    await page.locator('[contenteditable="true"]').first().click();
    await page.keyboard.type("Draft body.");

    await page.getByRole("button", { name: "Save draft" }).click();
    await page.waitForURL("**/admin/blog", { timeout: 10_000 });

    const slug = slugify(title);
    const response = await page.goto(`/blog/${slug}`);
    expect(response?.status()).toBe(404);
  });
});
