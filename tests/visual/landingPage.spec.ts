import { test, expect, appConfigWithFixture } from "@tests/support/fixtures.js";

test.use({
  customAppConfig: true,
});

test("landing page", async ({ page }) => {
  await page.addInitScript(appConfigWithFixture);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});
