import {
  test,
  expect,
  rid,
  ridPrefix,
  projectFixtureUrl,
} from "@tests/support/fixtures.js";

test("navigate to existing project", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.getByPlaceholder("Search a name…");
  await searchInput.click();
  await searchInput.fill(`${ridPrefix}${rid}`);
  await searchInput.press("Enter");

  await expect(page).toHaveURL(`${projectFixtureUrl}/tree`);
  await expect(searchInput).not.toHaveValue(`${ridPrefix}${rid}`);
});

test("navigate to a project that does not exist", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.getByPlaceholder("Search a name…");
  await searchInput.click();

  const nonExistantId = `${ridPrefix}:zt${rid.substring(2)}`;
  await searchInput.fill(nonExistantId);
  await searchInput.press("Enter");

  await page.waitForSelector(".search-bar.shaking");

  await expect(page).toHaveURL("/");
  await expect(searchInput).toHaveValue(nonExistantId);
});
