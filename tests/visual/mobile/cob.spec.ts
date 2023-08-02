import {
  test,
  expect,
  cobUrl,
  viewportSizes,
} from "@tests/support/fixtures.js";

test.use({ viewport: viewportSizes["iPhoneXR"] });

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
  await page.goto(`${cobUrl}/issues/9cedac832f0791bea5c9cf8fa32db8a68c592166`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(`${cobUrl}/issues/278bbe0bf3af51e5de1dfe20fefbbec4e1121343`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(`${cobUrl}/issues/61d2dbe81411ee6a9cce75451bc637541ea6a7c2`, {
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
    `${cobUrl}/patches/416d2f95f32a5fdee958172b724c8439ce5334e2`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  // Archived patch
  await page.goto(
    `${cobUrl}/patches/43ae785a9ceaf289b2445fb5b8e01036d456b2be`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  // Merged patch
  await page.goto(
    `${cobUrl}/patches/6a51e1d2e350136e7bcfad8f13d16488c1f1c99a`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  // Open patch
  await page.goto(
    `${cobUrl}/patches/687c3268119d23c5da32055c0b44c03e0e4088b8`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(
    `${cobUrl}/patches/687c3268119d23c5da32055c0b44c03e0e4088b8?tab=commits`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(
    `${cobUrl}/patches/687c3268119d23c5da32055c0b44c03e0e4088b8?tab=files`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
});
