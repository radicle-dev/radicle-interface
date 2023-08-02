import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createProject } from "@tests/support/project";

test("navigate patch listing", async ({ page }) => {
  await page.goto(cobUrl);
  await page.getByRole("link", { name: "2 patches" }).click();
  await expect(page).toHaveURL(`${cobUrl}/patches`);

  await page.getByRole("link", { name: "1 merged" }).click();
  await expect(page).toHaveURL(`${cobUrl}/patches?state=merged`);
  await expect(
    page.locator(".comments").filter({ hasText: "5" }),
  ).toBeVisible();
});

test("navigate patch details", async ({ page }) => {
  await page.goto(`${cobUrl}/patches`);
  await page.getByText("Add subtitle to README").click();
  await expect(page).toHaveURL(
    `${cobUrl}/patches/e35c10c370de7fb94e95dbdf05ab93000132683f`,
  );
  await page.getByRole("link", { name: "Add subtitle to README" }).click();
  await expect(page).toHaveURL(
    `${cobUrl}/commits/8c900d6cb38811e099efb3cbbdbfaba817bcf970`,
  );
  await page.goBack();
  {
    await page.getByRole("link", { name: "Commits" }).click();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/e35c10c370de7fb94e95dbdf05ab93000132683f?tab=commits`,
    );
  }
  {
    await page.getByRole("link", { name: "Files" }).click();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/e35c10c370de7fb94e95dbdf05ab93000132683f?tab=files`,
    );
  }
});

test("test patches counters", async ({ page, authenticatedPeer }) => {
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
  await page.getByRole("button", { name: "1 open" }).click();

  await expect(page.getByRole("button", { name: "2 patches" })).toBeVisible();
  await expect(page.getByRole("button", { name: "2 open" })).toBeVisible();
  await expect(page.locator(".patches-list .teaser")).toHaveCount(2);
});

test("use revision selector", async ({ page }) => {
  await page.goto(`${cobUrl}/patches/687c3268119d23c5da32055c0b44c03e0e4088b8`);
  await page.getByRole("link", { name: "Files" }).click();

  // Validating the latest revision state
  await expect(
    page.getByRole("cell", { name: "Had to push a new revision" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Commits" }).click();
  await expect(page.locator(".commit-list .teaser")).toHaveCount(2);
  await expect(
    page.locator(".commit-list .teaser .markdown").first(),
  ).toHaveText("Add more text");

  // Switching to the initial revision
  await page.getByText("Revision 0535843").click();
  await expect(page.locator(".dropdown")).toBeVisible();
  await page.getByRole("link", { name: "Revision 687c326" }).click();
  await expect(page.locator(".dropdown")).toBeHidden();

  // Validating the initial revision
  await expect(page.locator(".commit-list .teaser")).toHaveCount(1);
  await expect(
    page.locator(".commit-list .teaser .markdown").first(),
  ).toHaveText("Rewrite subtitle to README");
  await page.getByRole("link", { name: "Files" }).click();
  await expect(
    page.getByRole("cell", { name: "Had to push a new revision" }),
  ).toBeHidden();

  await expect(page).toHaveURL(
    `${cobUrl}/patches/687c3268119d23c5da32055c0b44c03e0e4088b8/687c3268119d23c5da32055c0b44c03e0e4088b8?tab=files`,
  );
});

test("navigate through revision diffs", async ({ page }) => {
  await page.goto(`${cobUrl}/patches/687c3268119d23c5da32055c0b44c03e0e4088b8`);

  const firstRevision = page.locator(".revision").first();
  const secondRevision = page.locator(".revision").nth(1);

  // Second revision
  {
    await secondRevision.locator(".toggle").click();
    await secondRevision
      .getByRole("link", { name: "Compare to main (38c225e)" })
      .click();
    await expect(
      page.getByRole("link", { name: "Diff 38c225..9898da" }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/687c3268119d23c5da32055c0b44c03e0e4088b8?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec..9898da6155467adad511f63bf0fb5aa4156b92ef`,
    );
    await page.goBack();
    await secondRevision.locator(".toggle").click();
    await secondRevision
      .getByRole("link", { name: "Compare to previous revision (687c326)" })
      .click();
    await expect(
      page.getByRole("link", { name: "Diff 0dc373..9898da" }),
    ).toBeVisible();

    await expect(page).toHaveURL(
      `${cobUrl}/patches/687c3268119d23c5da32055c0b44c03e0e4088b8?diff=0dc373db601ccbcffa80dec932e4006516709ca6..9898da6155467adad511f63bf0fb5aa4156b92ef`,
    );
    await page.goBack();

    await secondRevision
      .getByRole("link", { name: "Compare 0dc373d..9898da6" })
      .click();
    await expect(
      page.getByRole("link", { name: "Diff 0dc373..9898da" }),
    ).toBeVisible();
    await page.goBack();
  }
  // First revision
  {
    await firstRevision.locator(".toggle").click();
    await firstRevision
      .getByRole("link", { name: "Compare to main (38c225e)" })
      .click();
    await expect(
      page.getByRole("link", { name: "Diff 38c225..0dc373" }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/687c3268119d23c5da32055c0b44c03e0e4088b8?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec..0dc373db601ccbcffa80dec932e4006516709ca6`,
    );
  }
});
