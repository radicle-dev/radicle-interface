import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createProject } from "@tests/support/project";

test("navigate patch listing", async ({ page }) => {
  await page.goto(cobUrl);
  await page.getByRole("link", { name: "Patches 2" }).click();
  await expect(page).toHaveURL(`${cobUrl}/patches`);

  await page.getByRole("button", { name: "filter-dropdown" }).first().click();
  await page.getByRole("link", { name: "Merged 1" }).click();
  await expect(page).toHaveURL(`${cobUrl}/patches?status=merged`);
  await expect(
    page.locator(".comments").filter({ hasText: "5" }),
  ).toBeVisible();
});

test("patches counters", async ({ page, peer }) => {
  const { rid, projectFolder, defaultBranch } = await createProject(peer, {
    name: "patch-counters",
  });
  await peer.git(["switch", "-c", "feature-1"], {
    cwd: projectFolder,
  });
  await peer.git(["commit", "--allow-empty", "-m", "1th"], {
    cwd: projectFolder,
  });
  await peer.git(["push", "rad", "HEAD:refs/patches"], {
    cwd: projectFolder,
  });
  await page.goto(`${peer.uiUrl()}/${rid}/patches`);
  await peer.git(["switch", defaultBranch], {
    cwd: projectFolder,
  });
  await peer.git(["switch", "-c", "feature-2"], {
    cwd: projectFolder,
  });
  await peer.git(["commit", "--allow-empty", "-m", "2nd"], {
    cwd: projectFolder,
  });
  await peer.git(["push", "rad", "HEAD:refs/patches"], {
    cwd: projectFolder,
  });
  await page.getByRole("button", { name: "filter-dropdown" }).first().click();
  await page.locator(".dropdown-item").getByText("Open 1").click();
  await expect(page.getByRole("button", { name: "Patches 2" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "filter-dropdown" }).first(),
  ).toHaveText("Open 2");
  await expect(page.locator(".patch-teaser")).toHaveCount(2);
});
