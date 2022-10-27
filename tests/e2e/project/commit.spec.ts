import { test, expect } from "@tests/support/fixtures.js";

const sourceBrowsingFixture =
  "/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o";
const modifiedFileFixture = `${sourceBrowsingFixture}/remotes/hyy1k6ggg45pi7ip7ksyn1wt1ob4w5zh1awtg4qu3cxmbh5mws8pj1/commits/0be0f0302269b362be0bfe72aa4843eceaac5e3f`;

test("navigation from commit list", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);
  await page.getByTitle("Change peer").click();
  await page.locator("text=bob hyy1k6").click();
  await page.locator('role=button[name="Commit count"]').click();

  await page.locator("text=Update readme").click();
  await expect(page).toHaveURL(modifiedFileFixture);
});

test("relative timestamps", async ({ page }) => {
  page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("November 24 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });
  await page.goto(modifiedFileFixture);
  await expect(
    page.locator(".commit header >> text=bob committed 3 days ago"),
  ).toBeVisible();
});

test("modified file", async ({ page }) => {
  await page.goto(modifiedFileFixture);

  // Commit header.
  {
    const header = page.locator(".commit header");
    await expect(header.locator("text=Update readme")).toBeVisible();
    await expect(header.locator("text=Verified")).toBeVisible();
    await expect(
      header.locator("text=0be0f0302269b362be0bfe72aa4843eceaac5e3f"),
    ).toBeVisible();
  }

  // Diff header.
  await expect(
    page.locator("text=1 file(s) changed with 1 addition(s) and 4 deletion(s)"),
  ).toBeVisible();

  // Diff.
  await expect(page.locator("text=-	# Git test repository")).toBeVisible();
  await expect(page.locator("text=+	Updated readme")).toBeVisible();
});

test("created file", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingFixture}/remotes/hyn1mjueopwzrmb18c3zmgg8ei8qunn5wpg76ouymytfqkfxqx7bun/commits/d6318f7f3d9c15b8ac6dd52267c53220d00f0982`,
  );
  await expect(
    page.locator("text=1 file(s) created with 9 addition(s) and 0 deletion(s)"),
  ).toBeVisible();
  await expect(page.locator("text=subconscious.txt created")).toBeVisible();
});

test("deleted file", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingFixture}/remotes/hyn1mjueopwzrmb18c3zmgg8ei8qunn5wpg76ouymytfqkfxqx7bun/commits/cd13c2d9a8a930d64a82b6134b44d1b872e33662`,
  );
  await expect(
    page.locator("text=1 file(s) deleted with 0 addition(s) and 1 deletion(s)"),
  ).toBeVisible();
  await expect(page.locator("text=.hidden deleted")).toBeVisible();
});

test("navigation to source tree at specific revision", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingFixture}/commits/0801aceeab500033f8d608778218657bd626ef73`,
  );

  // Go to source tree at this revision.
  await page.getByTitle("View file").click();
  await expect(
    page.locator("text=Add a deeply nested directory tree"),
  ).toBeVisible();
  await expect(page).toHaveURL(
    `${sourceBrowsingFixture}/tree/0801aceeab500033f8d608778218657bd626ef73/deep/directory/hierarchy/is/entirely/possible/in/git/repositories/.gitkeep`,
  );
  await expect(page.getByTitle("Current branch")).toContainText(
    "0801aceeab500033f8d608778218657bd626ef73",
  );
  await expect(page.locator(".source-tree >> text=.gitkeep")).toBeVisible();
  await expect(
    page.locator(
      "text=deep/directory/hierarchy/is/entirely/possible/in/git/repositories/",
    ),
  ).toBeVisible();
});
