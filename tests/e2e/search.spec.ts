import { searchPlaceholder } from "@app/lib/shared";
import {
  test,
  expect,
  sourceBrowsingRid,
  sourceBrowsingUrl,
} from "@tests/support/fixtures.js";

test("navigate to existing project", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.getByPlaceholder(searchPlaceholder);
  await searchInput.click();
  await searchInput.fill(sourceBrowsingRid);
  await searchInput.press("Enter");

  await expect(page).toHaveURL(sourceBrowsingUrl);
  await expect(searchInput).not.toHaveValue(sourceBrowsingRid);
});

test("navigate to a project that does not exist", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.getByPlaceholder(searchPlaceholder);
  await searchInput.click();

  const nonExistantId = "rad:zAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  await searchInput.fill(nonExistantId);
  await searchInput.press("Enter");

  await page.waitForSelector(".search-bar.shaking");

  await expect(page).toHaveURL("/");
  await expect(searchInput).toHaveValue(nonExistantId);
});
