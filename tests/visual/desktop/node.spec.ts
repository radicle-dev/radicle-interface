import { test, expect } from "@tests/support/fixtures.js";

test("node page", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("November 24 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  await page.goto("/nodes/radicle.local", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});

test("empty pinned projects", async ({ page }) => {
  await page.route(
    ({ hostname, pathname }) =>
      pathname === "/api/v1/projects" && hostname === "seed.radicle.garden",
    async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: [],
      });
    },
  );
  await page.goto("/", {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot();
});

test("node not found", async ({ page }) => {
  await page.goto("/nodes/this.node.does.not.exist.xyz", {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot();
});

test("response parse error", async ({ page }) => {
  await page.route("*/**/v1/projects*", route => {
    return route.fulfill({
      json: [{ name: 1337 }],
    });
  });

  await page.goto("/nodes/radicle.local", {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot();
});

test("response error", async ({ page }) => {
  await page.route("*/**/v1/projects*", route => {
    return route.fulfill({
      status: 500,
    });
  });

  await page.goto("/nodes/radicle.local", {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot();
});
