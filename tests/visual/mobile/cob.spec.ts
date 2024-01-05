import { test, expect, cobUrl } from "@tests/support/fixtures.js";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("November 24 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });
});

test("issues page", async ({ page }) => {
  await page.goto(`${cobUrl}/issues`, { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });

  await page.goto(`${cobUrl}/issues?state=closed`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("issue page", async ({ page }) => {
  const issues = [
    ["This title has markdown", "open"],
    ["A closed issue", "closed"],
    ["A solved issue", "closed"],
  ];
  for (const [name, state] of issues) {
    await page.goto(`${cobUrl}/issues?state=${state}`);
    await page.getByRole("link", { name }).click();
    await page.getByRole("heading", { name }).waitFor();
    await expect(page).toHaveScreenshot({ fullPage: true });
  }
});

test("patches page", async ({ page }) => {
  await page.goto(`${cobUrl}/patches`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(`${cobUrl}/patches?state=draft`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(`${cobUrl}/patches?state=archived`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(`${cobUrl}/patches?state=merged`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("patch page", async ({ page }) => {
  const patches = [
    ["This patch is going to be reverted to draft", "draft"],
    ["This patch is going to be archived", "archived"],
    ["Let's add a README", "merged"],
    ["Add subtitle to README", "open"],
  ];

  for (const [name, state] of patches) {
    await page.goto(`${cobUrl}/patches?state=${state}`, {
      waitUntil: "networkidle",
    });
    await page.getByRole("link", { name }).click();
    await page.getByRole("heading", { name }).waitFor();
    await expect(page).toHaveScreenshot({ fullPage: true });
  }
});
