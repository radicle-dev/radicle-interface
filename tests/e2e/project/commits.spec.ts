import {
  aliceMainHead,
  expect,
  gitOptions,
  shortAliceRemote,
  shortBobRemote,
  sourceBrowsingUrl,
  test,
} from "@tests/support/fixtures.js";
import { createProject } from "@tests/support/project";

test("peer and branch switching", async ({ page }) => {
  await page.goto(sourceBrowsingUrl);
  await page.getByRole("link", { name: "6 commits" }).click();

  // Alice's peer.
  {
    await page.getByTitle("Change peer").click();
    await page
      .getByRole("link", {
        name: `${shortAliceRemote} (alice) delegate`,
      })
      .click();

    await expect(page.getByTitle("Change peer")).toHaveText(
      `${shortAliceRemote} (alice) delegate`,
    );

    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(page.locator(".history .teaser")).toHaveCount(6);

    const latestCommit = page.locator(".teaser").first();
    await expect(latestCommit).toContainText("Add README.md");
    await expect(latestCommit).toContainText(aliceMainHead.substring(0, 7));

    const earliestCommit = page.locator(".teaser").last();
    await expect(earliestCommit).toContainText(
      "Initialize an empty git repository",
    );
    await expect(earliestCommit).toContainText("36d5bbe");

    await page.getByTitle("Change branch").click();
    await page.getByText("feature/branch").click();

    await expect(page.getByTitle("Current branch")).toContainText(
      "feature/branch 1aded56",
    );
    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(page.locator(".history .teaser")).toHaveCount(9);

    await page.getByTitle("Change branch").click();
    await page.getByText("orphaned-branch").click();

    await expect(page.getByTitle("Current branch")).toContainText(
      "orphaned-branch af3641c",
    );
    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(page.locator(".group .teaser")).toHaveCount(1);
  }

  // Bob's peer.
  {
    await page.getByTitle("Change peer").click();
    await page.getByRole("link", { name: `${shortBobRemote} (bob)` }).click();

    await expect(page.getByTitle("Change peer")).toContainText(
      `${shortBobRemote} (bob)`,
    );

    await expect(page.getByText("Wednesday, December 21, 2022")).toBeVisible();
    await expect(page.locator(".group").first().locator(".teaser")).toHaveCount(
      1,
    );

    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(page.locator(".group").last().locator(".teaser")).toHaveCount(
      6,
    );

    const latestCommit = page.locator(".teaser").first();
    await expect(latestCommit).toContainText("Update readme");
    await expect(latestCommit).toContainText("28f3710");

    const earliestCommit = page.locator(".teaser").last();
    await expect(earliestCommit).toContainText(
      "Initialize an empty git repository",
    );
    await expect(earliestCommit).toContainText("36d5bbe");
  }
});

test("expand commit message", async ({ page }) => {
  await page.goto(sourceBrowsingUrl);
  await page.getByRole("link", { name: "6 commits" }).click();
  const commitToggle = page.locator(".expand-toggle").first();

  await commitToggle.click();
  const expandedCommit = page.getByText(
    "Signed-off-by: Alice Liddell <alice@radicle.xyz>",
  );

  await expect(expandedCommit).toBeVisible();
  await commitToggle.click();

  await expect(expandedCommit).toBeHidden();
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

  await page.goto(sourceBrowsingUrl);
  await page.getByRole("link", { name: "6 commits" }).click();

  await page.getByTitle("Change peer").click();
  await page.getByRole("link", { name: `${shortBobRemote} (bob)` }).click();
  await expect(page.getByTitle("Change peer")).toHaveText(
    `${shortBobRemote} (bob)`,
  );
  const latestCommit = page.locator(".teaser").first();
  await expect(latestCommit).toContainText("committed now by Bob Belcher");
  await expect(latestCommit).toContainText("28f3710");
  const earliestCommit = page.locator(".teaser").last();
  await expect(earliestCommit).toContainText(
    "committed last month by Alice Liddell",
  );
});

test("pushing changes while viewing history", async ({ page, peerManager }) => {
  const alice = await peerManager.startPeer({
    name: "alice",
    gitOptions: gitOptions["alice"],
  });
  await alice.startHttpd();
  await alice.startNode();
  const { rid, projectFolder } = await createProject(alice, "alice-project");
  await page.goto(`${alice.uiUrl()}/${rid}`);
  await page.getByRole("link", { name: "1 commit" }).click();
  await expect(page).toHaveURL(`${alice.uiUrl()}/${rid}/history`);

  await alice.git(["commit", "--allow-empty", "--message", "first change"], {
    cwd: projectFolder,
  });
  await alice.git(["push", "rad", "main"], {
    cwd: projectFolder,
  });
  await page.reload();
  await expect(page).toHaveURL(`${alice.uiUrl()}/${rid}/history`);
  await expect(page.getByRole("link", { name: "2 commits" })).toBeVisible();
  await expect(page.getByTitle("Current branch")).toContainText("main 516fa74");

  await page.getByText("alice-project").click();
  await expect(page).toHaveURL(`${alice.uiUrl()}/${rid}`);
  await page.getByRole("link", { name: "2 commits" }).click();

  await alice.git(
    [
      "commit",
      "--allow-empty",
      "--message",
      "after clicking the project title",
    ],
    {
      cwd: projectFolder,
    },
  );
  await alice.git(["push", "rad", "main"], {
    cwd: projectFolder,
  });
  await page.reload();
  await expect(page).toHaveURL(`${alice.uiUrl()}/${rid}/history`);
  await expect(page.getByRole("link", { name: "3 commits" })).toHaveText(
    "3 commits",
  );
  await expect(page.getByTitle("Current branch")).toContainText("main bb9089a");
});
