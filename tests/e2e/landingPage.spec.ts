import { expect, test } from "@tests/support/fixtures.js";

test("show pinned projects", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("experimental", "true"));
  await page.goto("/");
  await expect(page.getByText("Local projects")).toBeVisible();

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
  await expect(page.getByText("seed.radicle.garden")).toBeVisible();

  await page.getByTitle("Switch preferred seeds").getByRole("button").click();
  await expect(
    page.getByRole("button", { name: "seed.radicle.garden" }),
  ).toBeVisible();

  await page
    .getByPlaceholder("Navigate to seed URL")
    .fill("seed.radicle.garden");
  await page.getByPlaceholder("Navigate to seed URL").press("Enter");
  await expect(page.getByText("Seed node already added.")).toBeVisible();

  await page.getByPlaceholder("Navigate to seed URL").fill("");
  await expect(page.getByText("Seed node already added.")).toBeHidden();
});

test("adding and removing a new preferred seed", async ({ page }) => {
  await page.route(
    ({ hostname }) => hostname === "seed.rhizoma.dev",
    route => route.fulfill({ json: nodeInfo }),
  );

  await page.goto("/");
  await expect(page.getByText("seed.radicle.garden")).toBeVisible();

  await page.getByTitle("Switch preferred seeds").getByRole("button").click();
  await expect(
    page.getByRole("button", { name: "seed.radicle.garden" }),
  ).toBeVisible();

  await page.getByPlaceholder("Navigate to seed URL").fill("seed.rhizoma.dev");
  await page.getByPlaceholder("Navigate to seed URL").press("Enter");
  await expect(page.getByText("seed.rhizoma.dev")).toBeVisible();

  await page.getByTitle("Switch preferred seeds").getByRole("button").click();
  await expect(
    page.getByRole("button", { name: "seed.rhizoma.dev" }),
  ).toBeVisible();

  // Test that removing the selected seed doesn't end in an undefined state.
  await page
    .getByRole("button", { name: "seed.rhizoma.dev" })
    .getByRole("button")
    .click();
  await expect(page.getByText("seed.radicle.garden")).toBeVisible();

  await page.getByTitle("Switch preferred seeds").getByRole("button").click();
  await expect(
    page.getByRole("button", { name: "seed.rhizoma.dev" }),
  ).toBeHidden();
});

test("stored custom preferred seeds in local storage", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "configuredPreferredSeeds",
      '[{"hostname":"seed.radicle.xyz","port":443,"scheme":"https"},{"hostname":"seed.rhizoma.dev","port":443,"scheme":"https"}]',
    ),
  );
  await page.goto("/");
  await expect(page.getByText("seed.radicle.xyz")).toBeVisible();

  await page.getByTitle("Switch preferred seeds").getByRole("button").click();
  await expect(
    page.getByRole("button", { name: "seed.radicle.xyz" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "seed.rhizoma.dev" }),
  ).toBeVisible();
  // Check that the fallback node hasn't been added on load.
  await expect(
    page.getByRole("button", { name: "seed.radicle.garden" }),
  ).toBeHidden();
});

const nodeInfo = {
  id: "z6MkkGfMNQmjrp66Po2n4snzcSyTFRFw1m1fbYhCURxLxZpD",
  version: "1.0.0-rc.9-d56d619f",
  config: {
    alias: "rhizoma",
    listen: [],
    peers: {
      type: "dynamic",
      target: 0,
    },
    connect: [],
    externalAddresses: ["seed.rhizoma.dev:8776"],
    db: {
      journalMode: "wal",
    },
    network: "main",
    log: "INFO",
    relay: "auto",
    limits: {
      routingMaxSize: 1000,
      routingMaxAge: 604800,
      gossipMaxAge: 1209600,
      fetchConcurrency: 1,
      maxOpenFiles: 4096,
      rate: {
        inbound: {
          fillRate: 2,
          capacity: 128,
        },
        outbound: {
          fillRate: 5,
          capacity: 256,
        },
      },
      connection: {
        inbound: 128,
        outbound: 16,
      },
    },
    workers: 32,
    policy: "block",
    scope: "all",
  },
  state: "running",
};
