import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createProject, extractPatchId } from "@tests/support/project";

test("navigate patch details", async ({ page }) => {
  await page.goto(`${cobUrl}/patches`);
  await page.getByText("Add subtitle to README").click();
  await expect(page).toHaveURL(/patches\/[a-f0-9]{40}$/);
  await page.getByRole("link", { name: "Add subtitle to README" }).click();
  await expect(page).toHaveURL(/commits\/[a-f0-9]{40}$/);
  await page.goBack();
  await page.getByRole("link", { name: "Changes" }).click();
  await expect(page).toHaveURL(/patches\/[a-f0-9]{40}\?tab=changes$/);
});

test("use revision selector", async ({ page }) => {
  await page.goto(`${cobUrl}/patches`);
  await page
    .getByRole("link", { name: "Taking another stab at the README" })
    .click();
  await page.getByRole("link", { name: "Changes" }).click();

  // Validating the latest revision state
  await expect(
    page.getByRole("cell", { name: "Had to push a new revision" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Activity" }).click();
  await expect(page.getByLabel("commit-teaser")).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Add more text" })).toBeVisible();

  // Open the first revision and close the latest one
  await page.getByLabel("expand").first().click();
  await page.getByLabel("expand").last().click();

  // Validating the initial revision
  await expect(page.getByLabel("commit-teaser")).toHaveCount(3);
  await expect(
    page.getByRole("link", { name: "Rewrite subtitle to README" }).first(),
  ).toBeVisible();

  await page.getByRole("link", { name: "Changes" }).click();
  // Switching to the initial revision

  await page.getByRole("button", { name: "Revision" }).first().click();
  await page.getByRole("button", { name: "Revision" }).nth(1).click();

  await expect(
    page.getByRole("cell", { name: "Had to push a new revision" }),
  ).toBeHidden();

  await expect(page).toHaveURL(
    /patches\/[a-f0-9]{40}\/[a-f0-9]{40}\?tab=changes$/,
  );
});

test("navigate through revision diffs", async ({ page }) => {
  await page.goto(`${cobUrl}/patches`);
  await page
    .getByRole("link", { name: "Taking another stab at the README" })
    .click();

  const firstRevision = page.locator(".revision").first();
  const firstRevisionId = "59a0821";
  const secondRevision = page.locator(".revision").nth(1);

  // Second revision
  {
    await secondRevision
      .getByRole("button", { name: "toggle-context-menu" })
      .first()
      .click();
    await secondRevision
      .getByRole("link", { name: "Compare to base: 38c225e" })
      .click();
    await expect(
      page.getByRole("button", { name: "Compare 38c225..9e4fea" }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      /patches\/[a-f0-9]{40}\?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec\.\.9e4feab1b2123dfa5f22bd0e4656060ec9296638$/,
    );
    await page.goBack();
    await secondRevision
      .getByRole("button", { name: "toggle-context-menu" })
      .first()
      .click();
    await secondRevision
      .getByRole("link", {
        name: `Compare to previous revision: ${firstRevisionId}`,
      })
      .click();
    await expect(
      page.getByRole("button", { name: "Compare 88b7fd..9e4fea" }),
    ).toBeVisible();

    await expect(page).toHaveURL(
      /patches\/[a-f0-9]{40}\?diff=88b7fd90389c1a629f91ed7bf838d4b947426622\.\.9e4feab1b2123dfa5f22bd0e4656060ec9296638$/,
    );
    await page.goBack();
  }
  // First revision and DiffStatBadge shortcut.
  {
    await firstRevision.getByTitle("Compare 38c225e..88b7fd9").click();
    await expect(
      page.getByRole("button", { name: "Compare 38c225..88b7fd" }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      /patches\/[a-f0-9]{40}\?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec\.\.88b7fd90389c1a629f91ed7bf838d4b947426622$/,
    );
  }
});

test("view file navigation from changes tab", async ({ page }) => {
  await page.goto(`${cobUrl}/patches`);
  await page.getByRole("link", { name: "Add subtitle to README" }).click();
  await page.getByRole("link", { name: "Changes" }).click();
  await page.getByRole("button", { name: "Changes" }).click();
  await page.getByRole("button", { name: "View file at this commit" }).click();
  await expect(page).toHaveURL(
    `${cobUrl}/tree/8c900d6cb38811e099efb3cbbdbfaba817bcf970/README.md`,
  );
});

test("change patch state", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(authenticatedPeer, {
    name: "lifecycle",
  });
  await authenticatedPeer.git(["switch", "-c", "feature-1"], {
    cwd: projectFolder,
  });
  await authenticatedPeer.git(
    ["commit", "--allow-empty", "-m", "Some patch title"],
    {
      cwd: projectFolder,
    },
  );
  const patchId = extractPatchId(
    await authenticatedPeer.git(["push", "rad", "HEAD:refs/patches"], {
      cwd: projectFolder,
    }),
  );
  await page.goto(`${authenticatedPeer.uiUrl()}/${rid}/patches/${patchId}`);
  await page.getByRole("button", { name: "Archive patch" }).first().click();
  await expect(page.getByText("Archived", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Patches 0" })).toBeVisible();

  await page.getByLabel("stateToggle").first().click();
  await page.getByText("Convert to draft").click();
  await page.getByText("Convert to draft").click();
  await expect(page.getByText("Draft", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Patches 0" })).toBeVisible();
});

test("edit patch", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(authenticatedPeer, {
    name: "edit-patch",
  });
  await authenticatedPeer.git(["switch", "-c", "edit-patch"], {
    cwd: projectFolder,
  });
  await authenticatedPeer.git(
    [
      "commit",
      "--allow-empty",
      "-m",
      "Some patch title",
      "-m",
      "This should be a description",
    ],
    {
      cwd: projectFolder,
    },
  );
  const patchId = extractPatchId(
    await authenticatedPeer.git(["push", "rad", "HEAD:refs/patches"], {
      cwd: projectFolder,
    }),
  );
  await page.goto(`${authenticatedPeer.uiUrl()}/${rid}/patches/${patchId}`);

  const titleLocator = page.getByText("Some patch title").first();
  const descriptionLocator = page.getByText("This should be a description");
  await expect(titleLocator).toBeVisible();
  await expect(descriptionLocator).toBeVisible();
  await expect(page.getByPlaceholder("Title")).toBeHidden();
  await expect(page.getByPlaceholder("Leave a description")).toBeHidden();

  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .getByPlaceholder("Title")
    .fill("This is a modified patch title to be dismissed");
  await page
    .getByPlaceholder("Leave a description")
    .fill("This is a modified patch description to be dismissed");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(titleLocator).toBeVisible();
  await expect(descriptionLocator).toBeVisible();

  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByPlaceholder("Title").fill("This is a modified patch title");
  await page
    .getByPlaceholder("Leave a description")
    .fill("This is a modified patch description");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeHidden();
  await expect(page.getByText("This is a modified patch title")).toBeVisible();
  await expect(
    page.getByText("This is a modified patch description"),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("This is a modified patch title")).toBeVisible();
  await expect(
    page.getByText("This is a modified patch description"),
  ).toBeVisible();
});

test("edit revision", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(authenticatedPeer, {
    name: "edit-revision",
  });
  await authenticatedPeer.git(["switch", "-c", "edit-revision"], {
    cwd: projectFolder,
  });
  await authenticatedPeer.git(
    [
      "commit",
      "--allow-empty",
      "-m",
      "Some patch title",
      "-m",
      "This should be a description",
    ],
    {
      cwd: projectFolder,
    },
  );
  const patchId = extractPatchId(
    await authenticatedPeer.git(["push", "rad", "HEAD:refs/patches"], {
      cwd: projectFolder,
    }),
  );
  await authenticatedPeer.git(
    [
      "commit",
      "--allow-empty",
      "-m",
      "Let's create a new revision",
      "-m",
      "More descriptions",
    ],
    {
      cwd: projectFolder,
    },
  );
  await authenticatedPeer.git(["push", "rad"], { cwd: projectFolder });

  await page.goto(`${authenticatedPeer.ridUrl(rid)}/patches/${patchId}`);
  await page.getByRole("button", { name: "edit revision" }).click();
  await page
    .getByPlaceholder("Leave a description")
    .fill("This is an edited second revision");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByText("This is an edited second revision"),
  ).toBeVisible();
});
