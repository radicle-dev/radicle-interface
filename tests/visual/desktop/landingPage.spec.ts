import { test, expect } from "@tests/support/fixtures.js";
import sinon from "sinon";

test("pinned projects", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "configuredPreferredSeeds",
      JSON.stringify([{ hostname: "127.0.0.1", port: 8081, scheme: "http" }]),
    );
    sinon.useFakeTimers({
      now: new Date("November 24 2022 12:00:00").valueOf(),
      shouldClearNativeTimers: true,
      shouldAdvanceTime: false,
    });
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});

test("load projects error", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "configuredPreferredSeeds",
      JSON.stringify([{ hostname: "127.0.0.1", port: 8081, scheme: "http" }]),
    );
    sinon.useFakeTimers({
      now: new Date("November 24 2022 12:00:00").valueOf(),
      shouldClearNativeTimers: true,
      shouldAdvanceTime: false,
    });
  });

  await page.route(
    ({ pathname }) => pathname === "/api/v1/projects",
    route => route.fulfill({ status: 500 }),
  );

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});

test("response parse error", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "configuredPreferredSeeds",
      JSON.stringify([{ hostname: "127.0.0.1", port: 8081, scheme: "http" }]),
    );
  });
  await page.route("*/**/v1/projects*", route => {
    return route.fulfill({
      json: [{ name: 1337 }],
    });
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});

test("response error", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "configuredPreferredSeeds",
      JSON.stringify([{ hostname: "127.0.0.1", port: 8081, scheme: "http" }]),
    );
  });
  await page.route("*/**/v1/projects*", route => {
    return route.fulfill({
      status: 500,
      body: "There is an error in the response",
    });
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});
