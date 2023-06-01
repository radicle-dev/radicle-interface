import {
  test,
  expect,
  sourceBrowsingUrl,
  aliceRemote,
} from "@tests/support/fixtures.js";

test("source tree page", async ({ page }) => {
  await page.goto(sourceBrowsingUrl, { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});

test("commits page", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("November 24 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  await page.goto(
    `${sourceBrowsingUrl}/remotes/${aliceRemote.substring(8)}/history`,
    {
      waitUntil: "networkidle",
    },
  );

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("commit page", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("November 24 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  await page.goto(
    `${sourceBrowsingUrl}/remotes/${aliceRemote.substring(
      8,
    )}/commits/d6318f7f3d9c15b8ac6dd52267c53220d00f0982`,
  );
  await expect(page.locator("text=subconscious.txt added")).toBeVisible();
  await expect(page).toHaveScreenshot({ fullPage: true });
});
