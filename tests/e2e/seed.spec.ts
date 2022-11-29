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
  await expect(page.locator("text=hyb6i8…sg6nn4")).toBeVisible();
  await expect(page.locator("text=8777")).toBeVisible();
  await expect(page.locator("text=0.2.0-40bdc66")).toBeVisible();
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
      project.locator("text=530aabdcc80397af254bc488b767169b92496e81"),
    ).toBeVisible();
  }

  // Show project URN on hover.
  {
    await expect(
      project.locator("text=rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o"),
    ).not.toBeVisible();
    await project.hover();
    await expect(
      project.locator("text=rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o"),
    ).toBeVisible();
  }
});

test("navigation between seed and project pages", async ({ page }) => {
  await page.goto("/seeds/radicle.local");
  const project = page.locator(".project");

  // Navigate to a project.
  await project.click();
  await expect(page).toHaveURL(
    "/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o/tree/530aabdcc80397af254bc488b767169b92496e81",
  );

  // Navigate back to seed.
  await page.locator('role=button[name="Seed"]').click();
  await expect(page).toHaveURL("/seeds/0.0.0.0");
});
