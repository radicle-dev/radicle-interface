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
  // Open patch "Add subtitle to README"
  await page.goto(
    `${cobUrl}/patches/e35c10c370de7fb94e95dbdf05ab93000132683f`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  // Open patch "Taking another stab at the README"
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

test("failed diff loading for a specific revision", async ({ page }) => {
  await page.route(
    "**/api/v1/projects/rad:z3fpY7nttPPa6MBnAv2DccHzQJnqe/diff/38c225e2a0b47ba59def211f4e4825c31d9463ec/9898da6155467adad511f63bf0fb5aa4156b92ef",
    route => route.fulfill({ status: 500 }),
  );

  await page.goto(`${cobUrl}/patches/687c3268119d23c5da32055c0b44c03e0e4088b8`);
  await expect(page).toHaveScreenshot({ fullPage: true });
});
