import {
  test,
  expect,
  rid,
  remote,
  seedPort,
  seedVersion,
  HEAD,
} from "@tests/support/fixtures.js";

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
  await expect(
    page.locator(`text=${remote.substring(0, 6)}…${remote.substring(42)}`),
  ).toBeVisible();
  await expect(page.locator(`text=${seedPort}`)).toBeVisible();
  await expect(page.locator(`text=${seedVersion}`)).toBeVisible();
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
    await expect(project.locator(`text=${HEAD}`)).toBeVisible();
  }

  // Show project ID on hover.
  {
    await expect(project.locator(`text=rad:${rid}`)).not.toBeVisible();
    await project.hover();
    await expect(project.locator(`text=rad:${rid}`)).toBeVisible();
  }
});
