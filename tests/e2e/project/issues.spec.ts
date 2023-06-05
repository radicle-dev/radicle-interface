import { test, cobUrl, expect } from "@tests/support/fixtures.js";

test("navigate issue listing", async ({ page }) => {
  await page.goto(cobUrl);
  await page.locator('role=link[name="1 issue"]').click();
  await expect(page).toHaveURL(`${cobUrl}/issues`);

  await page.locator('role=link[name="2 closed"]').click();
  await expect(page).toHaveURL(`${cobUrl}/issues?state=closed`);
});

test("navigate single issue", async ({ page }) => {
  await page.goto(`${cobUrl}/issues`);
  await page.locator("text=This title has markdown").click();

  await expect(page).toHaveURL(
    `${cobUrl}/issues/4fc727e722d3979fd2073d9b56b2751658a4ae79`,
  );
});
