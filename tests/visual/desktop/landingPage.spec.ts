import { test, expect, appConfigWithFixture } from "@tests/support/fixtures.js";

test.use({
  customAppConfig: true,
});
import sinon from "sinon";

test("pinned projects", async ({ page }) => {
  await page.addInitScript(() => {
    sinon.useFakeTimers({
      now: new Date("November 24 2022 12:00:00").valueOf(),
      shouldClearNativeTimers: true,
      shouldAdvanceTime: false,
    });
  });

  await page.addInitScript(appConfigWithFixture);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});

test("load error", async ({ page }) => {
  await page.addInitScript(() => {
    sinon.useFakeTimers({
      now: new Date("November 24 2022 12:00:00").valueOf(),
      shouldClearNativeTimers: true,
      shouldAdvanceTime: false,
    });
  });

  await page.route(
    ({ pathname }) =>
      pathname === "/api/v1/projects/rad:z4BwwjPCFNVP27FwVbDFgwVwkjcir",
    route => route.fulfill({ status: 500 }),
  );

  await page.addInitScript(appConfigWithFixture, 8090);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});

test("response parse error", async ({ page }) => {
  await page.addInitScript(appConfigWithFixture);
  await page.route("*/**/v1/projects*", route => {
    return route.fulfill({
      json: [{ name: 1337 }],
    });
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});

test("response error", async ({ page }) => {
  await page.addInitScript(appConfigWithFixture);
  await page.route("*/**/v1/projects*", route => {
    return route.fulfill({
      status: 500,
      body: "There is an error in the response",
    });
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});
