import { test, expect, gitOptions } from "@tests/support/fixtures.js";

test.beforeAll(async ({ peerManager }) => {
  const alice = await peerManager.startPeer({
    name: "alice",
    gitOptions: gitOptions["alice"],
  });
  alice.startHttpd(8081).catch(console.error);
  await alice.startNode();

  const { projectFolder } = await alice.createProject("issue-test");
  alice.setCwd(projectFolder);
  await alice.rad([
    "issue",
    "open",
    "--title",
    "Some improvements to new patch page",
    "--description",
    [
      "We've implemented a temporary fix for the missing `WindowResize` in `tuirealms` backend adapter for `termion`. We should add this to upstream.",
      "",
      "We could create a thread that listens on signals and then send over a channel to the UI thread:",
      "```",
      "pub fn signals(channel: chan::Sender<Signal>) -> Result<(), Error> {",
      "    use signal_hook::consts::signal::*;",
      "",
      "    Ok(())",
      "}",
      "",
      "```",
    ].join("\n"),
    "--tag",
    "bug",
    "--tag",
    "enhancement",
    "--tag",
    "features",
  ]);
  await alice.rad([
    "assign",
    "d9777a731b784a4e691904f9abaaac4774669afe",
    "--to",
    `did:key:${alice.nodeId}`,
  ]);
  await alice.rad([
    "issue",
    "open",
    "--title",
    "An issue to be closed",
    "--description",
    "",
  ]);
  await alice.rad([
    "issue",
    "open",
    "--title",
    "This issue will be solved",
    "--description",
    "",
  ]);
  await alice.rad([
    "issue",
    "state",
    "74f8eb8e1310f3f65faa08052059694b312bacdf",
    "--closed",
  ]);
  await alice.rad([
    "issue",
    "state",
    "586ca911fec6ba7eac6642fa824e17861d004367",
    "--solved",
  ]);
});

test("issues page", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("November 24 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  await page.goto(
    `/seeds/0.0.0.0:8081/rad:z3Rht7jLeDa7T3pS1dY1Z4UrDaNnh/issues`,
  );
  await expect(
    page.locator("text=Some improvements to new patch page"),
  ).toBeVisible();
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("issue page", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("November 24 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  await page.goto(
    `/seeds/0.0.0.0:8081/rad:z3Rht7jLeDa7T3pS1dY1Z4UrDaNnh/issues/d9777a731b784a4e691904f9abaaac4774669afe`,
  );
  await expect(
    page.locator(
      "text=We could create a thread that listens on signals and then send over a channel to the UI thread:",
    ),
  ).toBeVisible();
  await expect(page).toHaveScreenshot({ fullPage: true });
});
