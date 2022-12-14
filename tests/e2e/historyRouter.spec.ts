import {
  test,
  expect,
  appConfigWithFixture,
  projectFixtureUrl,
} from "@tests/support/fixtures.js";
import {
  expectBackAndForwardNavigationWorks,
  expectUrlPersistsReload,
} from "@tests/support/router.js";

test("navigate between landing and project page", async ({ page }) => {
  await page.addInitScript(appConfigWithFixture);

  await page.goto("/");
  await expect(page).toHaveURL("/");

  await page.locator("text=source-browsing").click();
  await expect(page).toHaveURL(
    `${projectFixtureUrl}/tree/530aabdcc80397af254bc488b767169b92496e81`,
  );

  await expectBackAndForwardNavigationWorks("/", page);
  await expectUrlPersistsReload(page);
});

test("navigation between seed and project pages", async ({ page }) => {
  await page.goto("/seeds/radicle.local");

  const project = page.locator(".project");
  await project.click();
  await expect(page).toHaveURL(
    `${projectFixtureUrl}/tree/530aabdcc80397af254bc488b767169b92496e81`,
  );

  await expectBackAndForwardNavigationWorks("/seeds/radicle.local", page);
  await expectUrlPersistsReload(page);

  await page.locator('role=button[name="Seed"]').click();
  await expect(page).toHaveURL("/seeds/0.0.0.0");
});

test.describe("project page navigation", () => {
  test("navigation between commit history and single commit", async ({
    page,
  }) => {
    const projectHistoryURL = `${projectFixtureUrl}/history/530aabdcc80397af254bc488b767169b92496e81`;
    await page.goto(projectHistoryURL);

    await page.locator("text=Add Markdown cheat sheet").click();
    await expect(page).toHaveURL(
      `${projectFixtureUrl}/commits/530aabdcc80397af254bc488b767169b92496e81`,
    );

    await expectBackAndForwardNavigationWorks(projectHistoryURL, page);
    await expectUrlPersistsReload(page);
  });

  test("navigate between tree and commit history", async ({ page }) => {
    const projectTreeURL = `${projectFixtureUrl}/tree/530aabdcc80397af254bc488b767169b92496e81`;

    await page.goto(projectTreeURL);
    await expect(page).toHaveURL(projectTreeURL);

    await page.locator('role=button[name="Commit count"]').click();
    await expect(page).toHaveURL(
      `${projectFixtureUrl}/history/530aabdcc80397af254bc488b767169b92496e81`,
    );

    await expectBackAndForwardNavigationWorks(projectTreeURL, page);
    await expectUrlPersistsReload(page);
  });

  test("navigate project paths", async ({ page }) => {
    const projectTreeURL = `${projectFixtureUrl}/tree/530aabdcc80397af254bc488b767169b92496e81`;

    await page.goto(projectTreeURL);
    await expect(page).toHaveURL(projectTreeURL);

    await page.locator("text=.hidden").click();
    await expect(page).toHaveURL(`${projectTreeURL}/.hidden`);

    await page.locator("text=bin/").click();
    await page.locator("text=true").click();
    await expect(page).toHaveURL(`${projectTreeURL}/bin/true`);

    await expectBackAndForwardNavigationWorks(
      `${projectTreeURL}/.hidden`,
      page,
    );
    await expectUrlPersistsReload(page);
  });

  test("navigate project paths with a selected peer", async ({ page }) => {
    const projectTreeURL = `${projectFixtureUrl}/remotes/hyn1mjueopwzrmb18c3zmgg8ei8qunn5wpg76ouymytfqkfxqx7bun/tree`;

    await page.goto(projectTreeURL);
    await expect(page).toHaveURL(projectTreeURL);

    await page.locator("text=.hidden").click();
    await expect(page).toHaveURL(`${projectTreeURL}/main/.hidden`);

    await page.locator("text=bin/").click();
    await page.locator("text=true").click();
    await expect(page).toHaveURL(`${projectTreeURL}/main/bin/true`);

    await expectBackAndForwardNavigationWorks(
      `${projectTreeURL}/main/.hidden`,
      page,
    );
    await expectUrlPersistsReload(page);
  });
});
