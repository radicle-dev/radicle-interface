import {
  test,
  expect,
  rid,
  projectFixtureUrl,
} from "@tests/support/fixtures.js";

test("navigate to existing project", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.getByPlaceholder("Search a name…");
  await searchInput.click();
  await searchInput.fill(`${rid}`);
  await searchInput.press("Enter");

  await expect(page).toHaveURL(`${projectFixtureUrl}/tree`);
  await expect(searchInput).not.toHaveValue(`${rid}`);
});

test("navigate to a project that does not exist", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.getByPlaceholder("Search a name…");
  await searchInput.click();

  const nonExistantId = "rad:zAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  await searchInput.fill(nonExistantId);
  await searchInput.press("Enter");

  await page.waitForSelector(".search-bar.shaking");

  await expect(page).toHaveURL("/");
  await expect(searchInput).toHaveValue(nonExistantId);
});
