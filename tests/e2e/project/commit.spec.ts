import {
  test,
  expect,
  projectFixtureUrl,
  bobRemote,
} from "@tests/support/fixtures.js";

const modifiedFileFixture = `${projectFixtureUrl}/remotes/${bobRemote.substring(
  8,
)}/commits/1e0bb83a89b63da815f2fc24e7ae3c5ceb30e0eb`;

test("navigation from commit list", async ({ page }) => {
  await page.goto(projectFixtureUrl);
  await page.getByTitle("Change peer").click();
  await page.locator(`text=${bobRemote}`).click();
  await page.locator('role=button[name="Commit count"]').click();

  await page.locator("text=Update readme").click();
  await expect(page).toHaveURL(modifiedFileFixture);
});

test("relative timestamps", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("December 21 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });
  await page.goto(modifiedFileFixture);
  await expect(
    page.locator(`.commit header >> text=${"Bob Belcher committed now"}`),
  ).toBeVisible();
});

test("modified file", async ({ page }) => {
  await page.goto(modifiedFileFixture);

  // Commit header.
  {
    const header = page.locator(".commit header");
    await expect(header.locator("text=Update readme")).toBeVisible();
    await expect(
      header.locator("text=1e0bb83a89b63da815f2fc24e7ae3c5ceb30e0eb"),
    ).toBeVisible();
  }

  // Diff header.
  await expect(
    page.locator("text=1 file changed with 1 insertion and 4 deletions"),
  ).toBeVisible();

  // Diff.
  await expect(page.locator("text=-	# Git test repository")).toBeVisible();
  await expect(page.locator("text=+	Updated readme")).toBeVisible();
});

test("created file", async ({ page }) => {
  await page.goto(
    `${projectFixtureUrl}/remotes/${bobRemote}/commits/d6318f7f3d9c15b8ac6dd52267c53220d00f0982`,
  );
  await expect(
    page.locator("text=1 file added with 9 insertions and 0 deletions"),
  ).toBeVisible();
  await expect(page.locator("text=subconscious.txt added")).toBeVisible();
});

test("deleted file", async ({ page }) => {
  await page.goto(
    `${projectFixtureUrl}/remotes/${bobRemote}/commits/cd13c2d9a8a930d64a82b6134b44d1b872e33662`,
  );
  await expect(
    page.locator("text=1 file deleted with 0 insertions and 1 deletion"),
  ).toBeVisible();
  await expect(page.locator("text=.hidden deleted")).toBeVisible();
});

test("navigation to source tree at specific revision", async ({ page }) => {
  await page.goto(
    `${projectFixtureUrl}/commits/0801aceeab500033f8d608778218657bd626ef73`,
  );

  // Go to source tree at this revision.
  await page.getByTitle("View file").click();
  await expect(
    page.locator("text=Add a deeply nested directory tree"),
  ).toBeVisible();
  await expect(page).toHaveURL(
    `${projectFixtureUrl}/tree/0801aceeab500033f8d608778218657bd626ef73/deep/directory/hierarchy/is/entirely/possible/in/git/repositories/.gitkeep`,
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
