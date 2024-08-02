import {
  defaultConfig,
  expect,
  shortNodeRemote,
  test,
} from "@tests/support/fixtures.js";

test("node metadata", async ({ page, peerManager }) => {
  const peer = await peerManager.createPeer({
    name: "node-metadata-peer",
  });
  await peer.startNode({
    node: {
      ...defaultConfig.node,
      seedingPolicy: { default: "allow", scope: "all" },
      alias: "palm",
      externalAddresses: ["seed.radicle.test:8123"],
    },
  });
  await peer.startHttpd();

  await page.goto(peer.uiUrl());

  await expect(page.getByText(shortNodeRemote).first()).toBeVisible();
  await expect(page.getByText("/radicle:1.0.0-rc.13/")).toBeVisible();
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

test("show pinned repositories", async ({ page }) => {
  await page.goto("/");
  // Shows pinned project name.
  await expect(page.getByText("source-browsing")).toBeVisible();
  //
  // Shows pinned project description.
  await expect(
    page.getByText("Git repository for source browsing tests"),
  ).toBeVisible();
});

test("no duplicate entry for preferred seeds", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("127.0.0.1").first()).toBeVisible();

  await page.getByTitle("Switch preferred seeds").getByRole("button").click();
  await expect(page.getByRole("button", { name: "127.0.0.1" })).toBeVisible();

  await page.getByPlaceholder("Navigate to seed").fill("127.0.0.1");
  await page.getByPlaceholder("Navigate to seed").press("Enter");
  await expect(page.getByText("Seed node already added.")).toBeVisible();

  await page.getByPlaceholder("Navigate to seed").fill("");
  await expect(page.getByText("Seed node already added.")).toBeHidden();
});

test("adding and removing a new preferred seed", async ({ page }) => {
  // Proxy requests to seed.example.tld to the local test api.
  await page.route(
    url => url.hostname === "seed.example.tld",
    route =>
      route.fulfill({
        status: 301,
        headers: {
          Location: route
            .request()
            .url()
            .replace("seed.example.tld", "127.0.0.1"),
        },
      }),
  );

  await page.goto("/");
  await expect(page.getByText("127.0.0.1").first()).toBeVisible();

  await page.getByTitle("Switch preferred seeds").getByRole("button").click();
  await expect(page.getByRole("button", { name: "127.0.0.1" })).toBeVisible();

  await page.getByPlaceholder("Navigate to seed").fill("seed.example.tld");
  await page.getByPlaceholder("Navigate to seed").press("Enter");
  await expect(page.getByText("seed.example.tld").first()).toBeVisible();

  await page.getByTitle("Switch preferred seeds").getByRole("button").click();
  await expect(
    page.getByRole("button", { name: "seed.example.tld" }),
  ).toBeVisible();

  // Test that removing the selected seed doesn't end in an undefined state.
  await page
    .getByRole("button", { name: "seed.example.tld" })
    .getByRole("button")
    .click();
  await expect(page.getByText("127.0.0.1").first()).toBeVisible();

  await page.getByTitle("Switch preferred seeds").getByRole("button").click();
  await expect(
    page.getByRole("button", { name: "seed.example.tld" }),
  ).toBeHidden();
});
