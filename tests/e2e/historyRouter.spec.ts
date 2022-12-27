import {
  aliceMainHead,
  aliceRemote,
  appConfigWithFixture,
  expect,
  projectFixtureUrl,
  test,
} from "@tests/support/fixtures.js";
import {
  expectBackAndForwardNavigationWorks,
  expectBackAndTryMiddleClickWorks,
  expectUrlPersistsReload,
} from "@tests/support/router.js";

test("navigate between landing and project page", async ({ context, page }) => {
  await context.addInitScript(appConfigWithFixture);

  await page.goto("/");
  await expect(page).toHaveURL("/");

  await page.locator("text=source-browsing").click();
  await expect(page).toHaveURL(`${projectFixtureUrl}/tree/${aliceMainHead}`);

  await expectBackAndForwardNavigationWorks("/", page);
  await expectBackAndTryMiddleClickWorks(
    "/",
    "text=source-browsing",
    page,
    context,
  );
  await expectUrlPersistsReload(page);
});

test("navigation between seed and project pages", async ({ context, page }) => {
  await context.addInitScript(appConfigWithFixture);
  await page.goto("/seeds/radicle.local");

  const project = page.locator(".project");
  await project.click();
  await expect(page).toHaveURL(`${projectFixtureUrl}/tree/${aliceMainHead}`);

  await expectBackAndForwardNavigationWorks("/seeds/radicle.local", page);
  await expectBackAndTryMiddleClickWorks(
    "/seeds/radicle.local",
    ".project",
    page,
    context,
  );
  await expectUrlPersistsReload(page);

  await page.locator('role=button[name="Seed"]').click();
  await expect(page).toHaveURL("/seeds/0.0.0.0");
});

test.describe("project page navigation", () => {
  test("navigation between commit history and single commit", async ({
    context,
    page,
  }) => {
    await context.addInitScript(appConfigWithFixture);
    const projectHistoryURL = `${projectFixtureUrl}/history/${aliceMainHead}`;
    await page.goto(projectHistoryURL);

    await page.locator("text=Add Markdown cheat sheet").click();
    await expect(page).toHaveURL(
      `${projectFixtureUrl}/commits/f0b8db68847b01f0964380507a9db6800e5b5342`,
    );

    await expectBackAndForwardNavigationWorks(projectHistoryURL, page);
    await expectBackAndTryMiddleClickWorks(
      projectHistoryURL,
      "text=Add Markdown cheat sheet",
      page,
      context,
    );
    await expectUrlPersistsReload(page);
  });

  test("navigate between tree and commit history", async ({
    context,
    page,
  }) => {
    await context.addInitScript(appConfigWithFixture);
    const projectTreeURL = `${projectFixtureUrl}/tree/${aliceMainHead}`;

    await page.goto(projectTreeURL);
    await expect(page).toHaveURL(projectTreeURL);

    await page.locator('role=button[name="Commit count"]').click();
    await expect(page).toHaveURL(
      `${projectFixtureUrl}/history/${aliceMainHead}`,
    );

    await expectBackAndForwardNavigationWorks(projectTreeURL, page);
    await expectBackAndTryMiddleClickWorks(
      projectTreeURL,
      'role=button[name="Commit count"]',
      page,
      context,
    );
    await expectUrlPersistsReload(page);
  });

  test("navigate project paths", async ({ context, page }) => {
    await context.addInitScript(appConfigWithFixture);
    const projectTreeURL = `${projectFixtureUrl}/tree/${aliceMainHead}`;

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
    await expectBackAndTryMiddleClickWorks(
      `${projectTreeURL}/.hidden`,
      "text=true",
      page,
      context,
    );
    await expectUrlPersistsReload(page);
  });

  test("navigate project paths with a selected peer", async ({
    context,
    page,
  }) => {
    await context.addInitScript(appConfigWithFixture);
    const projectTreeURL = `${projectFixtureUrl}/remotes/${aliceRemote}/tree`;

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
    await expectBackAndTryMiddleClickWorks(
      `${projectTreeURL}/main/.hidden`,
      "text=true",
      page,
      context,
    );
    await expectUrlPersistsReload(page);
  });
});
