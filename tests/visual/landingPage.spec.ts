import { test, expect, appConfigWithFixture } from "@tests/support/fixtures.js";

test.use({
  customAppConfig: true,
});

test("landing page", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("November 24 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  await page.addInitScript(appConfigWithFixture);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});
