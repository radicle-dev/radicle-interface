import { test, expect, sourceBrowsingUrl } from "@tests/support/fixtures.js";

const sourceBrowsingFixture = `${sourceBrowsingUrl}/tree/main/src/true.c`;

test("default theme", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);

  {
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute(
      "data-codefont",
      "jetbrains",
    );
  }
});

test("theme persistance", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);
  await page.getByRole("button", { name: "Theme" }).first().click();

  await page.getByText("System").click();
  await page.getByRole("button", { name: "Light Mode" }).click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-codefont", "system");

  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-codefont", "system");
});

test("change theme", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);
  await page.getByRole("button", { name: "Theme" }).first().click();

  await page.getByRole("button", { name: "Light Mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(245, 245, 255)",
  );
  // Source highlighting reacts to theme change.
  await expect(page.getByText("() {")).toHaveCSS("color", "rgb(20, 21, 26)");

  await page.getByRole("button", { name: "Dark Mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(10, 13, 16)",
  );
  // Source highlighting reacts to theme change.
  await expect(page.getByText("() {")).toHaveCSS("color", "rgb(249, 249, 251)");
});

test("change code font", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);

  await page.getByRole("button", { name: "Theme" }).first().click();

  await page.getByText("System").click();
  await expect(page.getByText("System")).toHaveClass(/gray-white/);
  await expect(page.locator("html")).toHaveAttribute("data-codefont", "system");

  await page.getByText("JetBrains Mono").click();
  await expect(page.getByText("JetBrains Mono")).toHaveClass(/gray-white/);
  await expect(page.locator("html")).toHaveAttribute(
    "data-codefont",
    "jetbrains",
  );
});
