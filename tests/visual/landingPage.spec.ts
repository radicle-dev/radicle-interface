import { test, expect, appConfigWithFixture } from "@tests/support/fixtures.js";

test.use({
  customAppConfig: true,
});

test("pinned projects", async ({ page }) => {
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

test("load error", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("November 24 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  await page.route(
    "**/api/v1/projects/rad:z4BwwjPCFNVP27FwVbDFgwVwkjcir",
    route => route.fulfill({ status: 500 }),
  );

  await page.addInitScript(appConfigWithFixture);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});
