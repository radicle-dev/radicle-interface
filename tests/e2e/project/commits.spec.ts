import { test, expect } from "@tests/support/fixtures.js";

const sourceBrowsingFixture =
  "/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o";

test("peer and branch switching", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);
  await page.locator('role=button[name="Commit count"]').click();

  // Alice's peer.
  {
    await page.getByTitle("Change peer").click();
    await page.locator("text=alice hyn1mj").click();
    await expect(page.getByTitle("Change peer")).toHaveText("alice delegate");

    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(
      page.locator(".commit-group-headers .commit-teaser"),
    ).toHaveCount(7);

    const latestCommit = page.locator(".commit-teaser").first();
    await expect(latestCommit).toContainText("Add Markdown cheat sheet");
    await expect(latestCommit).toContainText("530aabd");

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
    await page.locator("text=bob hyy1k6").click();
    await expect(page.getByTitle("Change peer")).toHaveText("bob");

    await expect(page.getByText("Monday, November 21, 2022")).toBeVisible();
    await expect(
      page.locator(".commit-group-headers").first().locator(".commit-teaser"),
    ).toHaveCount(1);

    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(
      page.locator(".commit-group-headers").last().locator(".commit-teaser"),
    ).toHaveCount(7);

    await page.pause();
    const latestCommit = page.locator(".commit-teaser").first();
    await expect(latestCommit).toContainText("Update readme");
    await expect(latestCommit).toContainText("0be0f03");

    const earliestCommit = page.locator(".commit-teaser").last();
    await expect(earliestCommit).toContainText(
      "Initialize an empty git repository",
    );
    await expect(earliestCommit).toContainText("36d5bbe");
  }
});

test("verified badge", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);
  await page.locator('role=button[name="Commit count"]').click();

  await page.getByTitle("Change peer").click();
  await page.locator("text=bob hyy1k6").click();
  await expect(page.getByTitle("Change peer")).toHaveText("bob");

  await page.locator("text=Verified").hover();

  await expect(
    page.locator(
      "text=This commit was signed with the committer's radicle key.",
    ),
  ).toBeVisible();
  await expect(
    page.locator(
      "text=bob committed hyy1k6ggg45pi7ip7ksyn1wt1ob4w5zh1awtg4qu3cxmbh5mws8pj1",
    ),
  ).toBeVisible();
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

  await page.goto(sourceBrowsingFixture);
  await page.locator('role=button[name="Commit count"]').click();

  await page.getByTitle("Change peer").click();
  await page.locator("text=bob hyy1k6").click();
  await expect(page.getByTitle("Change peer")).toHaveText("bob");

  const latestCommit = page.locator(".commit-teaser").first();
  await expect(latestCommit).toContainText("bob committed 3 days ago");
  await expect(latestCommit).toContainText("0be0f03");

  const earliestCommit = page.locator(".commit").last();
  await expect(earliestCommit).toContainText(
    "Alice Liddell committed 7 days ago",
  );
});
