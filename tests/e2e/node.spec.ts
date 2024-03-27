import { expect, shortNodeRemote, test } from "@tests/support/fixtures.js";
import { createProject } from "@tests/support/project";

test("node metadata", async ({ page, peerManager }) => {
  const peer = await peerManager.createPeer({
    name: "node-metadata-peer",
  });
  await peer.startNode({
    policy: "allow",
    scope: "all",
    alias: "palm",
    externalAddresses: ["seed.radicle.test:8123"],
  });
  await peer.startHttpd();

  await page.goto(peer.uiUrl());

  await expect(page.getByRole("link", { name: "Local Node" })).toBeVisible();
  await expect(
    page.getByText(`${shortNodeRemote}@seed.radicle.test:8123`),
  ).toBeVisible();
  await expect(page.getByText("1.0.0-rc.1-")).toBeVisible();
  await peer.stopHttpd();
  await peer.stopNode();
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

test("seeding projects", async ({ page, authenticatedPeer }) => {
  const { rid } = await createProject(authenticatedPeer, {
    name: "seedProject",
  });

  await page.goto(authenticatedPeer.ridUrl(rid));
  await page.getByRole("button", { name: "Seeding" }).click();
  await page.getByRole("button", { name: "Stop seeding" }).click();
  await expect(page.getByRole("button", { name: "Seed 1" })).toBeVisible();

  await page.getByRole("button", { name: "Seed 1" }).click();
  await expect(page.getByRole("button", { name: "Seeding" })).toBeVisible();
});
