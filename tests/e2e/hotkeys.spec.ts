import { searchPlaceholder } from "@app/lib/shared";
import { test, expect } from "@tests/support/fixtures.js";

test("global hotkeys", async ({ page }) => {
  await page.goto("/");
  await page.locator("body").press(`/`);
  // Delaying the input speed a bit to imitate a real user.
  await page.keyboard.type("searchquery", { delay: 100 });

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
    await expect(page.getByText("⏎")).toBeHidden();
    await expect(page.getByPlaceholder(searchPlaceholder)).not.toBeFocused();
  }
});
