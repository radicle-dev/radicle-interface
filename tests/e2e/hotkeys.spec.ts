import { test, expect } from "@tests/support/fixtures.js";

const searchPlaceholder = "Search a name or address…";

test("global hotkeys", async ({ page }) => {
  await page.goto("/");
  await page.locator("body").press(`/`);
  await page.keyboard.type("searchquery");

  // Keyboard hint shows up in the search bar.
  {
    await expect(page.getByText("⏎")).toBeVisible();
    await expect(page.getByPlaceholder(searchPlaceholder)).toHaveValue(
      "searchquery",
    );
  }

  // Other hotkeys don't trigger while input is focussed.
  {
    await page.keyboard.type("?");
    await expect(page.getByPlaceholder(searchPlaceholder)).toHaveValue(
      "searchquery?",
    );
    await expect(page.getByText("Keyboard shortcuts")).not.toBeVisible();
  }

  // Hitting `Esc` defocuses the input.
  {
    await page.locator("body").press("Escape");
    await expect(page.getByPlaceholder(searchPlaceholder)).toHaveValue(
      "searchquery?",
    );
    await expect(page.getByText("⏎")).toBeVisible();
    await expect(page.getByPlaceholder(searchPlaceholder)).not.toBeFocused();
  }
});
