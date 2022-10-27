import { test, expect } from "@tests/support/fixtures.js";

test.describe("custom app configuration example", () => {
  // When `customAppConfig` is set, we also _must_ add a `page.addInitScript`
  // directly in the test.
  test.use({
    customAppConfig: true,
  });

  test("landing page", async ({ page }) => {
    await page.addInitScript(() => {
      window.APP_CONFIG = {
        walletConnect: {
          bridge: "https://radicle.bridge.walletconnect.org",
        },
        reactions: [],
        seeds: {
          pinned: [],
        },
        projects: {
          pinned: [
            {
              name: "radicle-cli",
              urn: "rad:git:hnrkmg77m8tfzj4gi4pa4mbhgysfgzwntjpao",
              seed: "clients.radicle.xyz",
            },
          ],
        },
      };
    });
    await page.goto("/");
    await expect(
      page.locator(
        "text=Radicle 🌱 enables developers 🧙 to securely collaborate 🔐 on software over a peer-to-peer network 🌐 built on Git.",
      ),
    ).toBeVisible();
  });
});

test("landing page", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator(
      "text=Radicle 🌱 enables developers 🧙 to securely collaborate 🔐 on software over a peer-to-peer network 🌐 built on Git.",
    ),
  ).toBeVisible();
});
