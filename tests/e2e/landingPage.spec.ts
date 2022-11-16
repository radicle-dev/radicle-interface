import { test, expect } from "@tests/support/fixtures.js";

test.describe("custom app configuration example", () => {
  test.use({
    customAppConfig: true,
  });

  test("landing page shows pinned projects", async ({ page }) => {
    await page.addInitScript(() => {
      window.APP_CONFIG = {
        walletConnect: {
          bridge: "https://radicle.bridge.walletconnect.org",
        },
        reactions: [],
        seeds: {
          pinned: [{ host: "0.0.0.0", emoji: "🚀" }],
        },
        projects: {
          pinned: [
            {
              name: "source-browsing",
              urn: "rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o",
              seed: "0.0.0.0",
            },
          ],
        },
      };
    });
    await page.goto("/");
    await expect(
      page.locator("text=Explore projects on the Radicle network."),
    ).toBeVisible();

    // Shows pinned project.
    await expect(page.locator("text=source-browsing")).toBeVisible();

    // Shows latest commit.
    await expect(page.locator("text=530aabd")).toBeVisible();
  });
});
