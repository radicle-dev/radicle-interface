import type { Page } from "@playwright/test";

import {
  expect,
  sourceBrowsingUrl,
  sourceBrowsingRid,
  seedRemote,
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
  // These tests only work in Chromium, because other browsers don't support
  // changing permissions.
  if (browserName !== "chromium") {
    test.skip();
  }
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto(sourceBrowsingUrl);

  // Reset system clipboard to a known state.
  await page.evaluate<string>("navigator.clipboard.writeText('')");

  // Project ID.
  {
    await page.locator(".id > .clipboard").click();
    const clipboardContent = await page.evaluate<string>(
      "navigator.clipboard.readText()",
    );
    expect(clipboardContent).toBe(sourceBrowsingRid);
  }

  // `rad clone` URL.
  {
    await page.getByText("Clone").click();
    await page
      .locator(`text=rad clone ${sourceBrowsingRid.substring(0, 6)}`)
      .hover();
    await page
      .locator(".clone-url-wrapper > span")
      .first()
      .locator(".clipboard")
      .click();
    await expectClipboard(`rad clone ${sourceBrowsingRid}`, page);
  }

  // `git clone` URL.
  {
    await page.getByText("Clone").click();
    await page
      .locator(
        `text=git clone http://127.0.0.1/${sourceBrowsingRid
          .replace("rad:", "")
          .substring(0, 10)}`,
      )
      .hover();
    await page
      .locator(".clone-url-wrapper > span")
      .last()
      .locator(".clipboard")
      .click();
    await expectClipboard(
      `git clone http://127.0.0.1/${sourceBrowsingRid.replace(
        "rad:",
        "",
      )}.git source-browsing`,
      page,
    );
  }

  await page.goto("/seeds/radicle.local");
  // Seed address.
  {
    await page.locator(".clipboard").first().click();
    await expectClipboard(`${seedRemote}@127.0.0.1:8776`, page);
  }

  // Clear the system clipboard contents so developers don't wonder why there's
  // random stuff in their clipboard after running tests.
  await page.evaluate<string>("navigator.clipboard.writeText('')");
});
