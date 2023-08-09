import {
  test,
  expect,
  cobUrl,
  sourceBrowsingUrl,
  aliceRemote,
} from "@tests/support/fixtures.js";

test("source page", async ({ page }) => {
  await page.goto(sourceBrowsingUrl, { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});

test("history page", async ({ page }) => {
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
    `${cobUrl}/patches/687c3268119d23c5da32055c0b44c03e0e4088b8?tab=files#README.md:H0L0H0L3`,
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("project load error", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingUrl}/remotes/zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot();
});

test("project not found", async ({ page }) => {
  await page.goto(`/nodes/127.0.0.1/rad:z4Vzzzzzzzzzzzzzzzzzzzzzzzzzz`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot();
});

test("file not found", async ({ page }) => {
  await page.goto(`${sourceBrowsingUrl}/tree/this.file.does.not.exist`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot();
});

test("commit not found", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingUrl}/commits/0000000000000000000000000000000000000000`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot();
});

test("issue not found", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingUrl}/issues/0000000000000000000000000000000000000000`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot();
});

test("patch not found", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingUrl}/patches/0000000000000000000000000000000000000000`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot();
});
