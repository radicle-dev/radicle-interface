import {
  aliceMainHead,
  expect,
  rid,
  seedRemote,
  test,
} from "@tests/support/fixtures.js";

test("seed metadata", async ({ page }) => {
  await page.goto("/seeds/radicle.local");

  await expect(page.locator("header").getByText("radicle.local")).toBeVisible();
  await expect(page.locator("text=radicle.local")).toBeVisible();
  await expect(
    page.locator(`text=${seedRemote.substring(0, 6)}…${seedRemote.slice(-6)}`),
  ).toBeVisible();
  await expect(page.locator(`text=0.1.0-`)).toBeVisible();
});

test("seed projects", async ({ page }) => {
  await page.goto("/seeds/radicle.local");
  const project = page.locator(".project");

  // Project metadata.
  {
    await expect(project.locator("text=source-browsing")).toBeVisible();
    await expect(
      project.locator("text=Git repository for source browsing tests"),
    ).toBeVisible();
    await expect(project.locator(`text=${aliceMainHead}`)).toBeVisible();
  }

  // Show project ID on hover.
  {
    await expect(project.locator(`text=${rid}`)).not.toBeVisible();
    await project.hover();
    await expect(project.locator(`text=${rid}`)).toBeVisible();
  }
});
