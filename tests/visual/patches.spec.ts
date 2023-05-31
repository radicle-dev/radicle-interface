import { test, gitOptions } from "@tests/support/fixtures.js";

test.beforeAll(async ({ peerManager }) => {
  const alice = await peerManager.startPeer({
    name: "alice",
    gitOptions: gitOptions["alice"],
  });
  alice.startHttpd(8081).catch(console.error);
  await alice.startNode();

  const { projectFolder } = await alice.createProject("patches-test");
  alice.setCwd(projectFolder);
});

test("patches page", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("November 24 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  await page.goto(`/seeds/0.0.0.0:8081/rad:z4FokkQfKsUqrxMDSUzVTpEoQs69T`);
  await page.pause();
});
