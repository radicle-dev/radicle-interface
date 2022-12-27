import {
  test,
  expect,
  projectFixtureUrl,
  bobRemote,
} from "@tests/support/fixtures.js";

test("peer and branch switching", async ({ page }) => {
  if (process.env.HEARTWOOD) {
    test.skip();
  }

  await page.goto(projectFixtureUrl);
  await page.locator('role=button[name="Commit count"]').click();

  // Alice's peer.
  {
    await page.getByTitle("Change peer").click();
    await page.locator("text=alice hybg18").click();
    await expect(page.getByTitle("Change peer")).toHaveText("alice delegate");

    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(
      page.locator(".commit-group-headers .commit-teaser"),
    ).toHaveCount(8);

    const latestCommit = page.locator(".commit-teaser").first();
    await expect(latestCommit).toContainText(
      "Adds a new markdown file with an image with a relative path",
    );
    await expect(latestCommit).toContainText("fcc9294");

    const earliestCommit = page.locator(".commit-teaser").last();
    await expect(earliestCommit).toContainText(
      "Initialize an empty git repository",
    );
    await expect(earliestCommit).toContainText("36d5bbe");

    await page.getByTitle("Change branch").click();
    await page.locator("text=feature/branch").click();

    await expect(page.getByTitle("Current branch")).toContainText(
      "feature/branch d6318f7",
    );
    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(page.locator(".commit-group-headers .commit")).toHaveCount(10);

    await page.getByTitle("Change branch").click();
    await page.locator("text=orphaned-branch").click();

    await expect(page.getByTitle("Current branch")).toContainText(
      "orphaned-branch af3641c",
    );
    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(
      page.locator(".commit-group-headers .commit-teaser"),
    ).toHaveCount(1);
  }

  // Bob's peer.
  {
    await page.getByTitle("Change peer").click();
    await page.locator("text=bob hyyzz9").click();
    await expect(page.getByTitle("Change peer")).toHaveText("bob");

    await expect(page.getByText("Tuesday, December 20, 2022")).toBeVisible();
    await expect(
      page.locator(".commit-group-headers").first().locator(".commit-teaser"),
    ).toHaveCount(3);

    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(
      page.locator(".commit-group-headers").last().locator(".commit-teaser"),
    ).toHaveCount(6);

    await page.pause();
    const latestCommit = page.locator(".commit-teaser").first();
    await expect(latestCommit).toContainText("Update readme");
    await expect(latestCommit).toContainText("2b32f6f");

    const earliestCommit = page.locator(".commit-teaser").last();
    await expect(earliestCommit).toContainText(
      "Initialize an empty git repository",
    );
    await expect(earliestCommit).toContainText("36d5bbe");
  }
});

test("verified badge", async ({ page }) => {
  if (process.env.HEARTWOOD) {
    test.skip();
  }

  await page.goto(projectFixtureUrl);
  await page.locator('role=button[name="Commit count"]').click();

  await page.getByTitle("Change peer").click();
  await page.locator("text=bob hyyzz9").click();
  await expect(page.getByTitle("Change peer")).toHaveText("bob");

  await page.locator("text=Verified").hover();

  await expect(
    page.locator(
      "text=This commit was signed with the committer's radicle key.",
    ),
  ).toBeVisible();
  await expect(page.locator(`text=bob committed ${bobRemote}`)).toBeVisible();
});

test("relative timestamps", async ({ page }) => {
  if (process.env.HEARTWOOD) {
    test.skip();
  }

  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("December 21 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  await page.goto(projectFixtureUrl);
  await page.locator('role=button[name="Commit count"]').click();

  await page.getByTitle("Change peer").click();
  await page.locator("text=bob hyyzz9").click();
  await expect(page.getByTitle("Change peer")).toHaveText("bob");

  const latestCommit = page.locator(".commit-teaser").first();
  await expect(latestCommit).toContainText("bob committed 22 hours ago");
  await expect(latestCommit).toContainText("2b32f6f");

  const earliestCommit = page.locator(".commit").last();
  await expect(earliestCommit).toContainText(
    "Alice Liddell committed last month",
  );
});
