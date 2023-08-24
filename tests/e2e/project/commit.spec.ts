import {
  aliceRemote,
  bobHead,
  expect,
  shortBobRemote,
  sourceBrowsingUrl,
  test,
} from "@tests/support/fixtures.js";

const commitUrl = `${sourceBrowsingUrl}/commits/${bobHead}`;

test("navigation from commit list", async ({ page }) => {
  await page.goto(sourceBrowsingUrl);
  await page.getByTitle("Change peer").click();
  await page.getByRole("link", { name: `${shortBobRemote} (bob)` }).click();
  await page.getByRole("link", { name: "7 commits" }).click();

  await page.getByText("Update readme").click();
  await expect(page).toHaveURL(commitUrl);
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
  await page.goto(commitUrl);
  await expect(page.getByText("committed now by Bob Belcher")).toBeVisible();
});

test("modified file", async ({ page }) => {
  await page.goto(commitUrl);

  // Commit header.
  {
    await expect(page.getByText("Update readme")).toBeVisible();
    await expect(page.getByText(bobHead)).toBeVisible();
  }

  // Diff header.
  await expect(
    page.getByText("1 file changed with 1 insertion and 4 deletions"),
  ).toBeVisible();

  // Diff.
  await expect(page.getByText("-	# Git test repository")).toBeVisible();
  await expect(page.getByText("+	Updated readme")).toBeVisible();
});

test("created file", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingUrl}/remotes/${aliceRemote.substring(
      8,
    )}/commits/d87e27e38e244fb3346cb9e4df064c080d97647a`,
  );
  await expect(
    page.getByText("1 file added with 1 insertion and 0 deletions"),
  ).toBeVisible();
  await expect(page.getByText(".hidden added")).toBeVisible();
});

test("deleted file", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingUrl}/remotes/${aliceRemote.substring(
      8,
    )}/commits/0e2db54dfd47d87202809917e2342655d9e76296`,
  );
  await expect(
    page.getByText("1 file deleted with 0 insertions and 1 deletion"),
  ).toBeVisible();
  await expect(page.getByText(".hidden deleted")).toBeVisible();
});

test("moved file", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingUrl}/remotes/${aliceRemote}/commits/835d9a52066c46d86cdee88f2863e9a804c7fa50/commits/`,
  );
  await expect(
    page.locator("header").filter({ hasText: "moves/111.txt → moves/222.txt" }),
  ).toBeVisible();
});

// TODO: Add copy operation detection spec.

test("navigation to source tree at specific revision", async ({ page }) => {
  await page.goto(
    `${sourceBrowsingUrl}/commits/0801aceeab500033f8d608778218657bd626ef73`,
  );

  // Go to source tree at this revision.
  await page.getByTitle("View file").click();
  await expect(
    page.getByText("Add a deeply nested directory tree"),
  ).toBeVisible();
  await expect(page).toHaveURL(
    `${sourceBrowsingUrl}/tree/0801aceeab500033f8d608778218657bd626ef73/deep/directory/hierarchy/is/entirely/possible/in/git/repositories/.gitkeep`,
  );
  await expect(page.getByTitle("Current branch")).toContainText("0801ace");
  await expect(page.locator(".source-tree >> text=.gitkeep")).toBeVisible();
  await expect(
    page.locator(
      "text=deep/directory/hierarchy/is/entirely/possible/in/git/repositories/",
    ),
  ).toBeVisible();
});
