import {
  aliceMainHead,
  aliceRemote,
  appConfigWithFixture,
  expect,
  sourceBrowsingUrl,
  test,
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
  await expect(page).toHaveURL(sourceBrowsingUrl);

  await expectBackAndForwardNavigationWorks("/", page);
  await expectUrlPersistsReload(page);
});

test("navigation between seed and project pages", async ({ page }) => {
  await page.goto("/seeds/radicle.local");

  const project = page.locator(".project", { hasText: "source-browsing" });
  await project.click();
  await expect(page).toHaveURL(sourceBrowsingUrl);

  await expectBackAndForwardNavigationWorks("/seeds/radicle.local", page);
  await expectUrlPersistsReload(page);

  await page.locator('role=link[name="radicle.local"]').click();
  await expect(page).toHaveURL("/seeds/127.0.0.1");
});

test.describe("project page navigation", () => {
  test("navigation between commit history and single commit", async ({
    page,
  }) => {
    const projectHistoryURL = `${sourceBrowsingUrl}/history/${aliceMainHead}`;
    await page.goto(projectHistoryURL);

    await page.locator("text=Add README.md").click();
    await expect(page).toHaveURL(
      `${sourceBrowsingUrl}/commits/${aliceMainHead}`,
    );

    await expectBackAndForwardNavigationWorks(projectHistoryURL, page);
    await expectUrlPersistsReload(page);
  });

  test("navigate between tree and commit history", async ({ page }) => {
    const projectTreeURL = `${sourceBrowsingUrl}/tree/${aliceMainHead}`;

    await page.goto(projectTreeURL);
    await page
      .getByRole("progressbar", { name: "Page loading" })
      .waitFor({ state: "hidden" });
    await expect(page).toHaveURL(projectTreeURL);

    await page.locator('role=link[name="6 commits"]').click();
    await expect(page).toHaveURL(
      `${sourceBrowsingUrl}/history/${aliceMainHead}`,
    );

    await expectBackAndForwardNavigationWorks(projectTreeURL, page);
    await expectUrlPersistsReload(page);
  });

  test("navigate project paths", async ({ page }) => {
    const projectTreeURL = `${sourceBrowsingUrl}/tree/${aliceMainHead}`;

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
    const projectTreeURL = `${sourceBrowsingUrl}/remotes/${aliceRemote.substring(
      8,
    )}`;

    await page.goto(projectTreeURL);
    await expect(page).toHaveURL(projectTreeURL);

    await page.locator("text=.hidden").click();
    await expect(page).toHaveURL(`${projectTreeURL}/tree/main/.hidden`);

    await page.locator("text=bin/").click();
    await page.locator("text=true").click();
    await expect(page).toHaveURL(`${projectTreeURL}/tree/main/bin/true`);

    await expectBackAndForwardNavigationWorks(
      `${projectTreeURL}/tree/main/.hidden`,
      page,
    );
    await expectUrlPersistsReload(page);
  });
});
