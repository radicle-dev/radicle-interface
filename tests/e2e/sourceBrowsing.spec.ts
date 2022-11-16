import { test, expect } from "@tests/support/fixtures.js";

test.describe("project source browsing", () => {
  test("project root opens README.md", async ({ page }) => {
    await page.goto(
      "/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o",
    );
    await expect(
      page.locator(
        "text=This repository contains all kinds of edge cases for testing radicle source browsing UIs. ",
      ),
    ).toBeVisible();
  });
});
