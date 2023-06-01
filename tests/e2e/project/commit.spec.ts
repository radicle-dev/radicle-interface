import {
  test,
  expect,
  sourceBrowsingUrl,
  bobRemote,
  bobHead,
  aliceRemote,
} from "@tests/support/fixtures.js";

const modifiedFileFixture = `${sourceBrowsingUrl}/remotes/${bobRemote.substring(
  8,
)}/commits/${bobHead}`;

test("navigation from commit list", async ({ page }) => {
  await page.goto(sourceBrowsingUrl);
  await page.getByTitle("Change peer").click();
  await page.locator(`text=${bobRemote}`).click();
  await page.locator('role=link[name="7 commits"]').click();

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
    page.locator(`.commit .header >> text=${"Bob Belcher committed now"}`),
  ).toBeVisible();
});

test("modified file", async ({ page }) => {
  await page.goto(modifiedFileFixture);

  // Commit header.
  {
    const header = page.locator(".commit .header");
    await expect(header.locator("text=Update readme")).toBeVisible();
    await expect(header.locator(`text=${bobHead}`)).toBeVisible();
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
    `${sourceBrowsingUrl}/remotes/${aliceRemote.substring(
      8,
    )}/commits/d87e27e38e244fb3346cb9e4df064c080d97647a`,
  );
  await expect(
    page.locator("text=1 file added with 1 insertion and 0 deletions"),
  ).toBeVisible();
  await expect(page.locator("text=.hidden added")).toBeVisible();
});

test("deleted file", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingUrl}/remotes/${aliceRemote.substring(
      8,
    )}/commits/0e2db54dfd47d87202809917e2342655d9e76296`,
  );
  await expect(
    page.locator("text=1 file deleted with 0 insertions and 1 deletion"),
  ).toBeVisible();
  await expect(page.locator("text=.hidden deleted")).toBeVisible();
});

test("navigation to source tree at specific revision", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingUrl}/commits/0801aceeab500033f8d608778218657bd626ef73`,
  );

  // Go to source tree at this revision.
  await page.getByTitle("View file").click();
  await expect(
    page.locator("text=Add a deeply nested directory tree"),
  ).toBeVisible();
  await expect(page).toHaveURL(
    `${sourceBrowsingUrl}/tree/0801aceeab500033f8d608778218657bd626ef73/deep/directory/hierarchy/is/entirely/possible/in/git/repositories/.gitkeep`,
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
