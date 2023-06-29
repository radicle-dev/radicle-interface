import type { Project } from "@httpd-client";
import { test, expect } from "@tests/support/fixtures.js";

test("seed page", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("November 24 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  // Repos in heartwood are read from storage with `fs::read_dir`
  // which has no deterministic ordering, it depends on
  // the filesystem and the operating system.
  //
  // > The order in which this iterator returns entries is platform and filesystem dependent.
  // source: https://doc.rust-lang.org/std/fs/fn.read_dir.html
  //
  // So we sort the request here, to get a visually persistent listing.
  // TODO: If at some point project sorting is introduced we can probably remove this.
  await page.route("**/api/v1/projects?page=0&perPage=10", async route => {
    const response = await route.fetch();
    const json: Project[] = await response.json();
    json.sort((a, b) => a.name.localeCompare(b.name));
    await route.fulfill({ response, json });
  });

  await page.goto("/seeds/radicle.local", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot();
});
