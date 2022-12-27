import type { BrowserContext, Page } from "@playwright/test";
import { expect } from "@tests/support/fixtures.js";

// Reloads the current page and verifies that the URL stays correct
export const expectUrlPersistsReload = async (page: Page) => {
  const url = page.url();
  await page.reload();
  await expect(page).toHaveURL(url);
};

// Navigates back, checks the URL and navigates forward back to the initial page
export const expectBackAndForwardNavigationWorks = async (
  beforeURL: string,
  page: Page,
) => {
  const currentURL = page.url();
  await page.goBack();
  await expect(page).toHaveURL(beforeURL);
  await page.goForward();
  await expect(page).toHaveURL(currentURL);
};

export const expectBackAndTryMiddleClickWorks = async (
  beforeURL: string,
  clickLocator: string,
  page: Page,
  context: BrowserContext,
) => {
  const currentURL = page.url();
  await page.goBack();
  await expect(page).toHaveURL(beforeURL);

  const pagePromise = context.waitForEvent("page");
  await page.locator(clickLocator).click({ button: "middle" });
  const newPage = await pagePromise;
  await newPage.waitForLoadState();
  await expect(newPage).toHaveURL(currentURL);

  await page.goForward();
};
