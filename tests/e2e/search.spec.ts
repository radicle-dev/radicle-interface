import { test, expect } from "@tests/support/fixtures.js";

test("navigate to existing project", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.getByPlaceholder("Search a name or address…");
  await searchInput.click();
  await searchInput.fill("rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o");
  await searchInput.press("Enter");

  await expect(page).toHaveURL(
    "/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o/tree",
  );
  await expect(searchInput).not.toHaveValue(
    "rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o",
  );
});

test("navigate to a project that does not exist", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.getByPlaceholder("Search a name or address…");
  await searchInput.click();
  await searchInput.fill("rad:git:hnrkn1ah5im83fwt4u3jfs5ndwpt9hrnm9wby");
  await searchInput.press("Enter");

  await page.waitForSelector(".search-bar.shaking");

  await expect(page).toHaveURL("/");
  await expect(searchInput).toHaveValue(
    "rad:git:hnrkn1ah5im83fwt4u3jfs5ndwpt9hrnm9wby",
  );
});
