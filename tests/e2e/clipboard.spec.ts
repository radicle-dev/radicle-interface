import type { Page } from "@playwright/test";

import {
  expect,
  sourceBrowsingUrl,
  sourceBrowsingRid,
  test,
} from "@tests/support/fixtures.js";

async function expectClipboard(content: string, page: Page) {
  const clipboardContent = await page.evaluate<string>(
    "navigator.clipboard.readText()",
  );
  expect(clipboardContent).toBe(content);
}

// We explicitly run all clipboard tests withing the context of a single test
// so that we don't run into race conditions, because there is no way to isolate
// the clipboard in Playwright yet.
test("copy to clipboard", async ({ page, browserName, context }) => {
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  } else if (browserName === "webkit") {
    // We aren't able to programmatically change the permissions in webkit.
    test.skip();
  }

  await page.goto(sourceBrowsingUrl);

  // Reset system clipboard to a known state.
  await page.evaluate<string>("navigator.clipboard.writeText('')");

  // Project ID.
  {
    await page.getByLabel("project-id").click();
    const clipboardContent = await page.evaluate<string>(
      "navigator.clipboard.readText()",
    );
    expect(clipboardContent).toBe(sourceBrowsingRid);
  }

  // `rad clone` URL.
  {
    await page.getByRole("button", { name: "Clone" }).first().click();
    await page.getByText("rad clone").locator(".clipboard").first().click();
    await expectClipboard(`rad clone ${sourceBrowsingRid}`, page);
  }

  // `git clone` URL.
  {
    await page.getByRole("button", { name: "Git" }).click();
    await page.getByText("git clone").locator(".clipboard").first().click();
    await expectClipboard(
      `git clone http://127.0.0.1/${sourceBrowsingRid.replace(
        "rad:",
        "",
      )}.git source-browsing`,
      page,
    );
  }

  // Clear the system clipboard contents so developers don't wonder why there's
  // random stuff in their clipboard after running tests.
  await page.evaluate<string>("navigator.clipboard.writeText('')");
});
