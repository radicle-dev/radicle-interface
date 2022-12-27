import { test, expect } from "@tests/support/fixtures.js";

test("seed metadata", async ({ page }) => {
  await page.goto("/seeds/radicle.local");

  await expect(page.locator("header").getByText("radicle.local")).toBeVisible();
  await expect(
    page.locator(".title >> text=radicle.local").getByRole("img"),
  ).toHaveAttribute("alt", "🚀");

  await expect(page.getByRole("link", { name: "radicle.local" })).toBeVisible();
  await expect(page.locator(".seed-address").getByRole("img")).toHaveAttribute(
    "alt",
    "🚀",
  );
  await expect(page.locator("text=hybuyt…7m4d3o")).toBeVisible();
  await expect(page.locator("text=8777")).toBeVisible();
  await expect(page.locator("text=0.2.0")).toBeVisible();
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
    await expect(
      project.locator("text=fcc929424b82984b7cbff9c01d2e20d9b1249842"),
    ).toBeVisible();
  }

  // Show project ID on hover.
  {
    await expect(
      project.locator("text=rad:git:hnrkdi8be7n4hhqoz9rpzrgd68u9dr3zsxgmy"),
    ).not.toBeVisible();
    await project.hover();
    await expect(
      project.locator("text=rad:git:hnrkdi8be7n4hhqoz9rpzrgd68u9dr3zsxgmy"),
    ).toBeVisible();
  }
});
