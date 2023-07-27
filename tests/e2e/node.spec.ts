import {
  aliceMainHead,
  expect,
  sourceBrowsingRid,
  nodeRemote,
  test,
} from "@tests/support/fixtures.js";

test("node metadata", async ({ page }) => {
  await page.goto("/nodes/radicle.local");

  await expect(
    page.locator(".header").getByText("radicle.local"),
  ).toBeVisible();
  await expect(
    page.getByText(`${nodeRemote.substring(0, 6)}…${nodeRemote.slice(-6)}`),
  ).toBeVisible();
  await expect(page.getByText("0.1.0-")).toBeVisible();
});

test("node projects", async ({ page }) => {
  await page.goto("/nodes/radicle.local");
  const project = page.locator(".project", { hasText: "source-browsing" });

  // Project metadata.
  {
    await expect(project.getByText("source-browsing")).toBeVisible();
    await expect(
      project.getByText("Git repository for source browsing tests"),
    ).toBeVisible();
    await expect(project.getByText(aliceMainHead)).toBeVisible();
  }

  // Show project ID on hover.
  {
    await expect(project.getByText(sourceBrowsingRid)).not.toBeVisible();
    await project.hover();
    await expect(project.getByText(sourceBrowsingRid)).toBeVisible();
  }
});
