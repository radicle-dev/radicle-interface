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
  await page.goto(`${cobUrl}/issues/d72196335761c1d5fa7883f6620e7334b34e38f9`, {
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
    `${cobUrl}/patches/dc9d006aa7131b62c14d570d79e079bb130ed2ea`,
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
    `${cobUrl}/patches/1cd7fe9598c0a877c32c516bddb3de70dfb53366`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  // Open patch "Taking another stab at the README"
  await page.goto(
    `${cobUrl}/patches/679b2c84a8e15ce1f73c4c231b55431b89b2559a`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
  await page.goto(
    `${cobUrl}/patches/679b2c84a8e15ce1f73c4c231b55431b89b2559a?tab=changes`,
    { waitUntil: "networkidle" },
  );
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("failed diff loading for a specific revision", async ({ page }) => {
  await page.route(
    "**/api/v1/projects/rad:z3fpY7nttPPa6MBnAv2DccHzQJnqe/diff/38c225e2a0b47ba59def211f4e4825c31d9463ec/9898da6155467adad511f63bf0fb5aa4156b92ef",
    route => route.fulfill({ status: 500 }),
  );

  await page.goto(`${cobUrl}/patches/679b2c84a8e15ce1f73c4c231b55431b89b2559a`);
  await expect(page).toHaveScreenshot({ fullPage: true });
});
