import { test, expect } from "@tests/support/fixtures.js";
import {
  expectBackAndForwardNavigationWorks,
  expectUrlPersistsReload,
} from "@tests/support/router.js";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.HASH_ROUTING = true;
  });
});

test("navigate between landing and project page", async ({ page }) => {
  await page.addInitScript(() => {
    window.APP_CONFIG = {
      walletConnect: {
        bridge: "https://radicle.bridge.walletconnect.org",
      },
      reactions: [],
      seeds: {
        pinned: [{ host: "0.0.0.0", emoji: "🚀" }],
      },
      projects: {
        pinned: [
          {
            name: "source-browsing",
            urn: "rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o",
            seed: "0.0.0.0",
          },
        ],
      },
    };
  });

  await page.goto("/#/");
  await expect(page).toHaveURL("/#/");

  await page.locator("text=source-browsing").click();
  await expect(page).toHaveURL(
    "/#/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o/tree/530aabdcc80397af254bc488b767169b92496e81",
  );

  await expectBackAndForwardNavigationWorks("/#/", page);
  await expectUrlPersistsReload(page);
});

test("navigation between seed and project pages", async ({ page }) => {
  await page.goto("/#/seeds/radicle.local");

  const project = page.locator(".project");
  await project.click();
  await expect(page).toHaveURL(
    "/#/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o/tree/530aabdcc80397af254bc488b767169b92496e81",
  );

  await expectBackAndForwardNavigationWorks("/#/seeds/radicle.local", page);
  await expectUrlPersistsReload(page);

  await page.locator('role=button[name="Seed"]').click();
  await expect(page).toHaveURL("/#/seeds/0.0.0.0");
});

test.describe("project page navigation", () => {
  test("navigation between commit history and single commit", async ({
    page,
  }) => {
    const projectHistoryURL =
      "/#/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o/history/530aabdcc80397af254bc488b767169b92496e81";
    await page.goto(projectHistoryURL);

    await page.locator("text=Add Markdown cheat sheet").click();
    await expect(page).toHaveURL(
      "/#/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o/commits/530aabdcc80397af254bc488b767169b92496e81",
    );

    await expectBackAndForwardNavigationWorks(projectHistoryURL, page);
    await expectUrlPersistsReload(page);
  });

  test("navigate between tree and commit history", async ({ page }) => {
    const projectTreeURL =
      "/#/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o/tree/530aabdcc80397af254bc488b767169b92496e81";

    await page.goto(projectTreeURL);
    await expect(page).toHaveURL(projectTreeURL);

    await page.locator('role=button[name="Commit count"]').click();
    await expect(page).toHaveURL(
      "/#/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o/history/530aabdcc80397af254bc488b767169b92496e81",
    );

    await expectBackAndForwardNavigationWorks(projectTreeURL, page);
    await expectUrlPersistsReload(page);
  });

  test("navigate project paths", async ({ page }) => {
    const projectTreeURL =
      "/#/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o/tree/530aabdcc80397af254bc488b767169b92496e81";

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
    const projectTreeURL =
      "/#/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o/remotes/hyn1mjueopwzrmb18c3zmgg8ei8qunn5wpg76ouymytfqkfxqx7bun/tree";

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
