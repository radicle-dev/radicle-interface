import type { Page } from "@playwright/test";
import { test, expect, markdownUrl } from "@tests/support/fixtures.js";

async function goToSection(section: string, page: Page) {
  await page.goto(`${markdownUrl}/tree/main/cheatsheet.md`, {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Collapse" }).click();
  await page.locator(`[href="${section}"]`).click();
}

test.describe("markdown rendering basics", async () => {
  test.use({ viewport: { width: 1600, height: 1200 } });

  test("table of contents", async ({ page }) => {
    await page.goto(
      `${markdownUrl}/tree/main/cheatsheet.md#table-of-contents`,
      {
        waitUntil: "networkidle",
      },
    );
    await page.getByRole("button", { name: "Collapse" }).click();
    await expect(page.getByText("Table of Contents")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("headers", async ({ page }) => {
    await goToSection("#headers", page);
    await expect(page.getByText("###### H6")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("emphasis", async ({ page }) => {
    await goToSection("#emphasis", page);
    await expect(page.getByText("Emphasis, aka").first()).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("lists", async ({ page }) => {
    await goToSection("#lists", page);
    await expect(page.getByText("First ordered list").first()).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("links", async ({ page }) => {
    await goToSection("#links", page);
    await expect(page.getByText("There are two ways")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("images", async ({ page }) => {
    await goToSection("#images", page);
    await expect(page.getByText("Here's our logo").first()).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("code and syntax highlighting", async ({ page }) => {
    await goToSection("#code", page);
    await expect(page.getByText("Code blocks are part")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("code clipboard icon on hover", async ({ page }) => {
    await goToSection("#code", page);
    const codeBlock = page
      .locator("div.pre-wrapper")
      .filter({ hasText: "Inline `code` has `back-ticks" });
    await expect(
      codeBlock.locator("radicle-clipboard > .clipboard"),
    ).toBeHidden();
    await codeBlock.hover();
    await expect(page).toHaveScreenshot();
  });

  test("tables", async ({ page }) => {
    await goToSection("#tables", page);
    await expect(page.getByText("Tables aren't part of the")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("blockquotes", async ({ page }) => {
    await goToSection("#blockquotes", page);
    await expect(page.getByText("Blockquotes are").first()).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("inline HTML", async ({ page }) => {
    await goToSection("#html", page);
    await expect(page.getByText("You can also use raw HTML")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("horizontal rule", async ({ page }) => {
    await goToSection("#hr", page);
    await expect(page.getByText("Three or more...").first()).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("line breaks", async ({ page }) => {
    await goToSection("#lines", page);
    await expect(page.getByText("My basic recommendation")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("videos", async ({ page }) => {
    await goToSection("#videos", page);
    await expect(page.getByText("They can't be added")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});

test("footnotes", async ({ page }) => {
  await page.goto(`${markdownUrl}/tree/main/footnotes.md#footnotes`, {
    waitUntil: "networkidle",
  });
  await expect(
    page.locator(
      "text=This is an example footnote[1]. And some radicle[2] examples.[3]",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Collapse" }).click();
  await expect(page.getByText("1. https://example.com ↩")).toBeVisible();
  await expect(page.getByText("2. https://radicle.xyz ↩")).toBeVisible();
  await expect(
    page.getByText(
      "3. A corporeal grounding, though one hardly to the exclusion of the cerebral as in the erroneous sense of a mind/body dichotomy, except insofar as what is most squarely in the cerebral would land here only on the periphery of our focus. ↩",
    ),
  ).toBeVisible();
  await expect(page).toHaveScreenshot({ fullPage: true });

  await page.getByText("Code").click();
  await expect(
    page.locator(
      "text=This is an example footnote[^1]. And some radicle[^2] examples.[^3]",
    ),
  ).toBeVisible();
  await expect(page.getByText("[^1]: https://example.com")).toBeVisible();
  await expect(page.getByText("[^2]: https://radicle.xyz")).toBeVisible();
  await expect(
    page.getByText(
      "[^3]: A corporeal grounding, though one hardly to the exclusion of the _cerebral_ as in the erroneous sense of a mind/body dichotomy, except insofar as what is most squarely in the cerebral would land here only on the periphery of our focus.",
    ),
  ).toBeVisible();
});

test("math", async ({ page }) => {
  await page.goto(`${markdownUrl}/tree/main/math.md`, {
    waitUntil: "networkidle",
  });
  await expect(page.getByText("The Cauchy-Schwarz Inequality")).toBeVisible();
  await page.getByRole("button", { name: "Collapse" }).click();
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("relative image not able to being loaded", async ({ page }) => {
  await page.goto(`${markdownUrl}/tree/main/loading-image.md`, {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Collapse" }).click();
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("markdown in issues is not overflowing", async ({ page }) => {
  await page.goto(`${markdownUrl}/issues`, {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Collapse" }).click();
  await page.getByRole("link", { name: "This title has markdown" }).click();
  await expect(page).toHaveScreenshot({ fullPage: true });
});
