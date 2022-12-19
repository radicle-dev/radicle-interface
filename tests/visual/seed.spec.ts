import { test, expect } from "@tests/support/fixtures.js";

test("seed page", async ({ page }) => {
  await page.goto("/seeds/radicle.local", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});
