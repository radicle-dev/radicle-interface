import { test, expect } from "@tests/support/fixtures.js";

test("seed page", async ({ page }) => {
  await page.goto("/seeds/radicle.local");
  await expect(page).toHaveScreenshot();
});
