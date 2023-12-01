import type { Page } from "@playwright/test";
import {
  test,
  expect,
  markdownUrl,
  viewportSizes,
} from "@tests/support/fixtures.js";

async function goToSection(section: string, page: Page) {
  await page.goto(`${markdownUrl}/tree/main/cheatsheet.md`, {
    waitUntil: "networkidle",
  });
  await page.locator(`[href="${section}"]`).click();
}

const viewportWidth = viewportSizes["Desktop"].width;

test.describe("markdown rendering", async () => {
  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 450 } });
    test("table of contents", async ({ page }) => {
      await page.goto(
        `${markdownUrl}/tree/main/cheatsheet.md#table-of-contents`,
        {
          waitUntil: "networkidle",
        },
      );
      await expect(page.getByText("Table of Contents")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({
      viewport: { width: viewportWidth, height: 1030 },
    });
    test("headers", async ({ page }) => {
      await goToSection("#headers", page);
      await expect(page.getByText("###### H6")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 470 } });
    test("emphasis", async ({ page }) => {
      await goToSection("#emphasis", page);
      await expect(page.getByText("Emphasis, aka").first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 1100 } });
    test("lists", async ({ page }) => {
      await goToSection("#lists", page);
      await expect(page.getByText("First ordered list").first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 1024 } });
    test("links", async ({ page }) => {
      await goToSection("#links", page);
      await expect(page.getByText("There are two ways")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 520 } });
    test("images", async ({ page }) => {
      await goToSection("#images", page);
      await expect(page.getByText("Here's our logo").first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 1130 } });
    test("code and syntax highlighting", async ({ page }) => {
      await goToSection("#code", page);
      await expect(page.getByText("Code blocks are part")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test("footnotes", async ({ page }) => {
      await page.goto(`${markdownUrl}/tree/main/footnotes.md#footnotes`, {
        waitUntil: "networkidle",
      });
      await expect(
        page.locator(
          "text=This is an example footnote[0]. And some radicle[1] examples.",
        ),
      ).toBeVisible();
      await expect(page.getByText("0. https://example.com ↩")).toBeVisible();
      await expect(page.getByText("1. https://radicle.xyz ↩")).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });

      await page.getByText("Plain").click();
      await expect(
        page.locator(
          "text=This is an example footnote[^0]. And some radicle[^1] examples.",
        ),
      ).toBeVisible();
      await expect(page.getByText("[^0]: https://example.com")).toBeVisible();
      await expect(page.getByText("[^1]: https://radicle.xyz")).toBeVisible();
    });
  });

  test.describe(async () => {
    test("math", async ({ page }) => {
      await page.goto(`${markdownUrl}/tree/main/math.md`, {
        waitUntil: "networkidle",
      });
      await expect(
        page.getByText("The Cauchy-Schwarz Inequality"),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 1100 } });
    test("tables", async ({ page }) => {
      await goToSection("#tables", page);
      await expect(page.getByText("Tables aren't part of the")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 450 } });
    test("blockquotes", async ({ page }) => {
      await goToSection("#blockquotes", page);
      await expect(page.getByText("Blockquotes are").first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 510 } });
    test("inline HTML", async ({ page }) => {
      await goToSection("#html", page);
      await expect(page.getByText("You can also use raw HTML")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 710 } });
    test("horizontal rule", async ({ page }) => {
      await goToSection("#hr", page);
      await expect(page.getByText("Three or more...").first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 625 } });
    test("line breaks", async ({ page }) => {
      await goToSection("#lines", page);
      await expect(page.getByText("My basic recommendation")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: viewportWidth, height: 500 } });
    test("videos", async ({ page }) => {
      await goToSection("#videos", page);
      await expect(page.getByText("They can't be added")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });
});

test("relative image not able to being loaded", async ({ page }) => {
  await page.goto(`${markdownUrl}/tree/main/loading-image.md`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("markdown in issues is not overflowing", async ({ page }) => {
  await page.goto(`${markdownUrl}/issues`, {
    waitUntil: "networkidle",
  });
  await page.getByRole("link", { name: "This title has markdown" }).click();
  await expect(page).toHaveScreenshot({ fullPage: true });
});
