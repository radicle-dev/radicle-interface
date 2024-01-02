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

  await page.getByText("source-browsing").click();
  await expect(page).toHaveURL(sourceBrowsingUrl);

  await expectBackAndForwardNavigationWorks("/", page);
  await expectUrlPersistsReload(page);
});

test("navigation between node and project pages", async ({ page }) => {
  await page.goto("/nodes/radicle.local");

  const project = page
    .locator(".project", { hasText: "source-browsing" })
    .nth(0);
  await project.click();
  await expect(page).toHaveURL(sourceBrowsingUrl);

  await expectBackAndForwardNavigationWorks("/nodes/radicle.local", page);
  await expectUrlPersistsReload(page);

  await page.getByRole("link", { name: "Local Node" }).click();
  await expect(page).toHaveURL("/nodes/127.0.0.1");
});

test.describe("project page navigation", () => {
  test("navigation between commit history and single commit", async ({
    page,
  }) => {
    const projectHistoryURL = `${sourceBrowsingUrl}/history/${aliceMainHead}`;
    await page.goto(projectHistoryURL);

    await page.getByText("Add README.md").click();
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

    await page.getByRole("link", { name: "Commits 6" }).click();
    await expect(page).toHaveURL(
      `${sourceBrowsingUrl}/history/${aliceMainHead}`,
    );

    await expectBackAndForwardNavigationWorks(projectTreeURL, page);
    await expectUrlPersistsReload(page);
  });

  test("navigate between tree and commit history while a file is selected", async ({
    page,
  }) => {
    const projectTreeURL = `${sourceBrowsingUrl}`;

    await page.goto(projectTreeURL);
    await page
      .getByRole("progressbar", { name: "Page loading" })
      .waitFor({ state: "hidden" });
    await expect(page).toHaveURL(projectTreeURL);

    await page.getByText(".hidden").click();
    await expect(page).toHaveURL(`${projectTreeURL}/tree/.hidden`);

    await page.getByRole("link", { name: "Commits 6" }).click();
    await expect(page).toHaveURL(`${sourceBrowsingUrl}/history`);
  });

  test("navigate project paths", async ({ page }) => {
    const projectTreeURL = `${sourceBrowsingUrl}/tree/${aliceMainHead}`;

    await page.goto(projectTreeURL);
    await expect(page).toHaveURL(projectTreeURL);

    await page.getByText(".hidden").click();
    await expect(page).toHaveURL(`${projectTreeURL}/.hidden`);

    await page.getByText("bin").click();
    await page.getByText("true").click();
    await expect(page).toHaveURL(`${projectTreeURL}/bin/true`);

    await expectBackAndForwardNavigationWorks(
      `${projectTreeURL}/.hidden`,
      page,
    );
    await expectUrlPersistsReload(page);
  });

  test("navigate project paths with an explicitly selected peer", async ({
    page,
  }) => {
    // If a branch isn't explicitly specified, the code assumes the project
    // default branch is selected. We omit showing the default branch in the URL.

    const projectTreeURL = `${sourceBrowsingUrl}/remotes/${aliceRemote.substring(
      8,
    )}`;

    await page.goto(projectTreeURL);
    await expect(page).toHaveURL(projectTreeURL);

    await page.getByText(".hidden").click();
    await expect(page).toHaveURL(`${projectTreeURL}/tree/.hidden`);

    await page.getByText("bin").click();
    await page.getByText("true").click();
    await expect(page).toHaveURL(`${projectTreeURL}/tree/bin/true`);

    await expectBackAndForwardNavigationWorks(
      `${projectTreeURL}/tree/.hidden`,
      page,
    );
    await expectUrlPersistsReload(page);
  });

  test("navigate project paths with an explicitly selected peer and branch", async ({
    page,
  }) => {
    const projectTreeURL = `${sourceBrowsingUrl}/remotes/${aliceRemote.substring(
      8,
    )}/tree/main`;

    await page.goto(projectTreeURL);
    await expect(page).toHaveURL(projectTreeURL);

    await page.getByText(".hidden").click();
    await expect(page).toHaveURL(`${projectTreeURL}/.hidden`);

    await page.getByText("bin").click();
    await page.getByText("true").click();
    await expect(page).toHaveURL(`${projectTreeURL}/bin/true`);

    await expectBackAndForwardNavigationWorks(
      `${projectTreeURL}/.hidden`,
      page,
    );
    await expectUrlPersistsReload(page);
  });
});
