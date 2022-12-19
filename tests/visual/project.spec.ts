import { test, expect, projectFixtureUrl } from "@tests/support/fixtures.js";

test("source tree page", async ({ page }) => {
  await page.goto(projectFixtureUrl, { waitUntil: "networkidle" });
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
    `${projectFixtureUrl}/remotes/hyn1mjueopwzrmb18c3zmgg8ei8qunn5wpg76ouymytfqkfxqx7bun/history`,
    { waitUntil: "networkidle" },
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
    `${projectFixtureUrl}/remotes/hyn1mjueopwzrmb18c3zmgg8ei8qunn5wpg76ouymytfqkfxqx7bun/commits/d6318f7f3d9c15b8ac6dd52267c53220d00f0982`,
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("markdown rendering", async ({ page }) => {
  await page.goto(`${projectFixtureUrl}/tree/main/markdown/cheatsheet.md`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
});
