import type { Page } from "@playwright/test";
import { test, expect } from "@tests/support/fixtures.js";

const sourceBrowsingFixture =
  "/seeds/0.0.0.0/rad:git:hnrkdi8be7n4hhqoz9rpzrgd68u9dr3zsxgmy";

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
  context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto(sourceBrowsingFixture);

  // Reset system clipboard to a known state.
  await page.evaluate<string>("navigator.clipboard.writeText('')");

  // Project URN.
  {
    await page.locator(".urn > .clipboard").click();
    const clipboardContent = await page.evaluate<string>(
      "navigator.clipboard.readText()",
    );
    expect(clipboardContent).toBe(
      "rad:git:hnrkdi8be7n4hhqoz9rpzrgd68u9dr3zsxgmy",
    );
  }

  // `rad clone` URL.
  {
    await page.getByText("Clone").click();
    await page.locator("text=rad clone rad://0.0.0.0/hnrkdi").hover();
    await page
      .locator(".clone-url-wrapper > span")
      .first()
      .locator(".clipboard")
      .click();
    await expectClipboard(
      "rad clone rad://0.0.0.0/hnrkdi8be7n4hhqoz9rpzrgd68u9dr3zsxgmy",
      page,
    );
  }

  // `git clone` URL.
  {
    await page.getByText("Clone").click();
    await page.locator("text=https://0.0.0.0/hnrkdi").hover();
    await page
      .locator(".clone-url-wrapper > span")
      .last()
      .locator(".clipboard")
      .click();
    await expectClipboard(
      "https://0.0.0.0/hnrkdi8be7n4hhqoz9rpzrgd68u9dr3zsxgmy.git",
      page,
    );
  }

  await page.goto("/seeds/radicle.local");
  // Seed address.
  {
    await page.locator(".clipboard").first().click();
    await expectClipboard("0.0.0.0", page);

    await page.locator(".clipboard").last().click();
    await expectClipboard(
      "hybuytx44z9cfsm5739wecia9j4b7expgc15qkazph59szp57m4d3o",
      page,
    );
  }

  // Clear the system clipboard contents so developers don't wonder why there's
  // random stuff in their clipboard after running tests.
  await page.evaluate<string>("navigator.clipboard.writeText('')");
});
