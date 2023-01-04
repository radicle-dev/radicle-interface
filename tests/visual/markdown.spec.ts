import type { Page } from "@playwright/test";
import { test, expect, projectFixtureUrl } from "@tests/support/fixtures.js";

async function goToSection(section: string, page: Page) {
  await page.goto(`${projectFixtureUrl}/tree/main/markdown/cheatsheet.md`, {
    waitUntil: "networkidle",
  });
  await page.locator(`[href="${section}"]`).click();
}

test.describe("markdown rendering", async () => {
  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 450 } });
    test("table of contents", async ({ page }) => {
      await page.goto(
        `${projectFixtureUrl}/tree/main/markdown/cheatsheet.md#table-of-contents`,
        {
          waitUntil: "networkidle",
        },
      );
      await expect(page.locator("text=Table of Contents")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 1030 } });
    test("headers", async ({ page }) => {
      await goToSection("#headers", page);
      await expect(page.locator("text=###### H6")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 470 } });
    test("emphasis", async ({ page }) => {
      await goToSection("#emphasis", page);
      await expect(page.locator("text=Emphasis, aka").first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 1100 } });
    test("lists", async ({ page }) => {
      await goToSection("#lists", page);
      await expect(
        page.locator("text=First ordered list").first(),
      ).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 1024 } });
    test("links", async ({ page }) => {
      await goToSection("#links", page);
      await expect(page.locator("text=There are two ways")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 520 } });
    test("images", async ({ page }) => {
      await goToSection("#images", page);
      await expect(page.locator("text=Here's our logo").first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 1130 } });
    test("code and syntax highlighting", async ({ page }) => {
      await goToSection("#code", page);
      await expect(page.locator("text=Code blocks are part")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 590 } });
    test("footnotes", async ({ page }) => {
      await goToSection("#footnotes", page);
      await expect(page.locator("text=Footnotes aren't part")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 1100 } });
    test("tables", async ({ page }) => {
      await goToSection("#tables", page);
      await expect(
        page.locator("text=Tables aren't part of the"),
      ).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 450 } });
    test("blockquotes", async ({ page }) => {
      await goToSection("#blockquotes", page);
      await expect(page.locator("text=Blockquotes are").first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 510 } });
    test("inline HTML", async ({ page }) => {
      await goToSection("#html", page);
      await expect(
        page.locator("text=You can also use raw HTML"),
      ).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 710 } });
    test("horizontal rule", async ({ page }) => {
      await goToSection("#hr", page);
      await expect(page.locator("text=Three or more...").first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 625 } });
    test("line breaks", async ({ page }) => {
      await goToSection("#lines", page);
      await expect(page.locator("text=My basic recommendation")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe(async () => {
    test.use({ viewport: { width: 1280, height: 500 } });
    test("videos", async ({ page }) => {
      await goToSection("#videos", page);
      await expect(page.locator("text=They can't be added")).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });
});
