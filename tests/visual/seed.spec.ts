import { test, expect } from "@tests/support/fixtures.js";

test("seed page", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("January 21 2023 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  await page.goto("/seeds/radicle.local", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});
