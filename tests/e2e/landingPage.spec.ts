import {
  aliceMainHead,
  appConfigWithFixture,
  expect,
  test,
} from "@tests/support/fixtures.js";

test.use({
  customAppConfig: true,
});

test("show pinned projects", async ({ page }) => {
  await page.addInitScript(appConfigWithFixture);
  await page.goto("/");
  await expect(
    page.getByText("Explore projects on the Radicle network."),
  ).toBeVisible();

  // Shows pinned project name.
  await expect(page.getByText("source-browsing")).toBeVisible();
  //
  // Shows pinned project description.
  await expect(
    page.getByText("Git repository for source browsing tests"),
  ).toBeVisible();

  // Shows latest commit.
  await expect(page.getByText(aliceMainHead.substring(0, 7))).toBeVisible();
});
