import { test, expect, rid } from "@tests/support/fixtures.js";

test("navigate to existing project", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.getByPlaceholder("Search a name or address…");
  await searchInput.click();
  await searchInput.fill(`rad:${rid}`);
  await searchInput.press("Enter");

  await expect(page).toHaveURL(`/seeds/0.0.0.0/rad:${rid}/tree`);
  await expect(searchInput).not.toHaveValue(`rad:${rid}`);
});

test("navigate to a project that does not exist", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.getByPlaceholder("Search a name or address…");
  await searchInput.click();
  await searchInput.fill(`rad:zt${rid.substring(2)}`);
  await searchInput.press("Enter");

  await page.waitForSelector(".search-bar.shaking");

  await expect(page).toHaveURL("/");
  await expect(searchInput).toHaveValue(`rad:zt${rid.substring(2)}`);
});
