import { test, expect, sourceBrowsingUrl } from "@tests/support/fixtures.js";

const sourceBrowsingFixture = `${sourceBrowsingUrl}/tree/main/src/true.c`;

test("default settings", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);

  // Default settings.
  {
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute(
      "data-codefont",
      "jetbrains",
    );
  }
});

test("settings persistance", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);
  await page.locator('button[name="Settings"]').click();

  await page.locator(".theme .toggle").click();
  await page.getByText("Code font").click();
  await page.getByText("System").click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-codefont", "system");

  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-codefont", "system");
});

test("change theme", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);
  await page.locator('button[name="Settings"]').click();

  await page.locator(".theme .toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(243, 246, 253)",
  );
  // Source highlighting reacts to theme change.
  await expect(page.getByText("() {")).toHaveCSS("color", "rgb(26, 26, 44)");

  await page.locator(".theme .toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(11, 19, 26)",
  );
  // Source highlighting reacts to theme change.
  await expect(page.getByText("() {")).toHaveCSS("color", "rgb(255, 255, 255)");
});

test("change code font", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);

  await page.locator('button[name="Settings"]').click();
  await page.getByText("Code font").click();

  await page.getByText("System").click();
  await expect(page.getByText("System")).toHaveClass(/active/);
  await expect(page.locator("html")).toHaveAttribute("data-codefont", "system");

  await page.getByText("JetBrains Mono").click();
  await expect(page.getByText("JetBrains Mono")).toHaveClass(/active/);
  await expect(page.locator("html")).toHaveAttribute(
    "data-codefont",
    "jetbrains",
  );
});
