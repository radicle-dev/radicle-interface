import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createProject } from "@tests/support/project";

test("navigate patch listing", async ({ page }) => {
  await page.goto(cobUrl);
  await page.getByRole("link", { name: "2 patches" }).click();
  await expect(page).toHaveURL(`${cobUrl}/patches`);

  await page.getByRole("button", { name: "filter-dropdown" }).first().click();
  await page.getByRole("link", { name: "1 merged" }).click();
  await expect(page).toHaveURL(`${cobUrl}/patches?state=merged`);
  await expect(
    page.locator(".comments").filter({ hasText: "5" }),
  ).toBeVisible();
});

test("patches counters", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder, defaultBranch } = await createProject(
    authenticatedPeer,
    "patch-counters",
  );
  await authenticatedPeer.git(["switch", "-c", "feature-1"], {
    cwd: projectFolder,
  });
  await authenticatedPeer.git(["commit", "--allow-empty", "-m", "1th"], {
    cwd: projectFolder,
  });
  await authenticatedPeer.git(["push", "rad", "HEAD:refs/patches"], {
    cwd: projectFolder,
  });
  await page.goto(`${authenticatedPeer.uiUrl()}/${rid}/patches`);
  await authenticatedPeer.git(["switch", defaultBranch], {
    cwd: projectFolder,
  });
  await authenticatedPeer.git(["switch", "-c", "feature-2"], {
    cwd: projectFolder,
  });
  await authenticatedPeer.git(["commit", "--allow-empty", "-m", "2nd"], {
    cwd: projectFolder,
  });
  await authenticatedPeer.git(["push", "rad", "HEAD:refs/patches"], {
    cwd: projectFolder,
  });
  await page.getByRole("button", { name: "filter-dropdown" }).first().click();
  await page.locator(".dropdown-item").getByText("1 open").click();
  await expect(page.getByRole("button", { name: "2 patches" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "filter-dropdown" }).first(),
  ).toHaveText("2 open");
  await expect(page.locator(".list .patch-teaser")).toHaveCount(2);
});
