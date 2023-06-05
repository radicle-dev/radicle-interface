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
  await page.goto(`${cobUrl}/issues/4fc727e722d3979fd2073d9b56b2751658a4ae79`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(`${cobUrl}/issues/4038cc5bf6d38f0a5606982236e2abb113affaea`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(`${cobUrl}/issues/673c51821aee4b780d9661c20d267d66ec43d7ae`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
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
  // Draft patch
  await page.goto(
    `${cobUrl}/patches/f85dce5dced961ee0f47735401cee72a0ee77900`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  // Archived patch
  await page.goto(
    `${cobUrl}/patches/8d83959d9889da0a94129d9ba06b87c8823972a8`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  // Merged patch
  await page.goto(
    `${cobUrl}/patches/a5b1d30035da686ba1c4742f6fd25c43238df671`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  // Open patch
  await page.goto(
    `${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(
    `${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466?tab=commits`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(
    `${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466?tab=files`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
});
