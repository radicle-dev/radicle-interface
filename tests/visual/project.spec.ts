import {
  test,
  expect,
  cobUrl,
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
    )}/commits/1aded56c3ad55299df9f06c326af50b802a05949`,
  );
  await expect(page.getByText("subconscious.txt added")).toBeVisible();
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("diff selection", async ({ page }) => {
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
    `${cobUrl}/patches/013f8b2734df1840b2e33d52ff5632c8d66b199a?tab=files#README.md:H0L0H0L3`,
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
});
