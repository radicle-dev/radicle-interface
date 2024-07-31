import {
  test,
  expect,
  aliceRemote,
  bobRemote,
} from "@tests/support/fixtures.js";
import sinon from "sinon";

test("user page", async ({ page }) => {
  await page.addInitScript(() => {
    sinon.useFakeTimers({
      now: new Date("November 24 2022 12:00:00").valueOf(),
      shouldClearNativeTimers: true,
      shouldAdvanceTime: false,
    });
  });

  await page.goto(`/nodes/radicle.local/users/${aliceRemote}`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot();
});

test("empty pinned projects", async ({ page }) => {
  await page.goto(`/nodes/radicle.local/users/${bobRemote}`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot();
});

test("response parse error", async ({ page }) => {
  await page.route("*/**/v1/nodes/*", route => {
    return route.fulfill({
      json: [{ name: 1337 }],
    });
  });

  await page.goto(`/nodes/radicle.local/users/${bobRemote}`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot();
});

test("response error", async ({ page }) => {
  await page.route("*/**/v1/nodes/*", route => {
    return route.fulfill({
      status: 500,
    });
  });

  await page.goto(`/nodes/radicle.local/users/${bobRemote}`, {
    waitUntil: "networkidle",
  });
  await expect(page).toHaveScreenshot();
});
