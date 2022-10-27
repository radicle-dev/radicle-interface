import { test, expect } from "@tests/support/fixtures.js";

test("exceptions in production build", async ({ page, browserName }) => {
  // It's enough to check this once.
  if (browserName !== "chromium") {
    test.skip();
  }

  await page.goto("/");
  // Wait for scripts to finish executing, there might be exceptions that
  // happen after the page has been painted.
  await page.waitForTimeout(2000);
  await expect(
    page.locator(
      "text=Radicle enables developers to securely collaborate on software over a peer-to-peer network built on Git.",
    ),
  ).toBeVisible();
});
