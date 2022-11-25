import { test, expect, appConfigWithFixture } from "@tests/support/fixtures.js";

test.use({
  customAppConfig: true,
});

test("show pinned projects", async ({ page }) => {
  await page.addInitScript(appConfigWithFixture);
  await page.goto("/");
  await expect(
    page.locator("text=Explore projects on the Radicle network."),
  ).toBeVisible();

  // Shows pinned project name.
  await expect(page.locator("text=source-browsing")).toBeVisible();
  //
  // Shows pinned project description.
  await expect(
    page.locator("text=Git repository for source browsing tests"),
  ).toBeVisible();

  // Shows latest commit.
  await expect(page.locator("text=fcc9294")).toBeVisible();
});
