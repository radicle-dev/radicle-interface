import { test, expect, projectFixtureUrl } from "@tests/support/fixtures.js";

test("source tree page", async ({ page }) => {
  await page.goto(projectFixtureUrl);
  await expect(page).toHaveScreenshot();
});

test("commits page", async ({ page }) => {
  await page.goto(
    `${projectFixtureUrl}/remotes/hyn1mjueopwzrmb18c3zmgg8ei8qunn5wpg76ouymytfqkfxqx7bun/history`,
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("commit page", async ({ page }) => {
  await page.goto(
    `${projectFixtureUrl}/remotes/hyn1mjueopwzrmb18c3zmgg8ei8qunn5wpg76ouymytfqkfxqx7bun/commits/d6318f7f3d9c15b8ac6dd52267c53220d00f0982`,
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("markdown rendering", async ({ page }) => {
  await page.goto(`${projectFixtureUrl}/tree/main/markdown/cheatsheet.md`);
  await expect(page).toHaveScreenshot({ fullPage: true });
});
