import { expect, shortNodeRemote, test } from "@tests/support/fixtures.js";

test("node metadata", async ({ page, peerManager }) => {
  const peer = await peerManager.createPeer({
    name: "node-metadata-peer",
  });
  await peer.startNode({
    seedingPolicy: { default: "allow", scope: "all" },
    alias: "palm",
    externalAddresses: ["seed.radicle.test:8123"],
  });
  await peer.startHttpd();

  await page.goto(peer.uiUrl());

  await expect(page.getByRole("link", { name: "Local Node" })).toBeVisible();
  await expect(
    page.getByText(`${shortNodeRemote}@seed.radicle.test:8123`),
  ).toBeVisible();
  await expect(page.getByText("pre-release")).toBeVisible();
});

test("node projects", async ({ page }) => {
  await page.goto("/nodes/radicle.local");
  const project = page
    .locator(".project-card", { hasText: "source-browsing" })
    .nth(0);

  // Project metadata.
  {
    await expect(project.getByText("source-browsing")).toBeVisible();
    await expect(
      project.getByText("Git repository for source browsing tests"),
    ).toBeVisible();
  }
});
