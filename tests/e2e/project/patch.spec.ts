import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createProject, extractPatchId } from "@tests/support/project";

test("navigate patch details", async ({ page }) => {
  await page.goto(`${cobUrl}/patches`);
  await page.getByText("Add subtitle to README").click();
  await expect(page).toHaveURL(
    `${cobUrl}/patches/1cd7fe9598c0a877c32c516bddb3de70dfb53366`,
  );
  await page.getByRole("link", { name: "Add subtitle to README" }).click();
  await expect(page).toHaveURL(
    `${cobUrl}/commits/8c900d6cb38811e099efb3cbbdbfaba817bcf970`,
  );
  await page.goBack();
  {
    await page.getByRole("link", { name: "Changes" }).click();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/1cd7fe9598c0a877c32c516bddb3de70dfb53366?tab=changes`,
    );
  }
});

test("use revision selector", async ({ page }) => {
  await page.goto(`${cobUrl}/patches/fa393edeb28bdd189bd0c0d7a262cb30d9109595`);
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

  await page.getByRole("button", { name: "Revision 92f6a0c" }).click();
  await page.getByRole("button", { name: "Revision fa393ed" }).click();
  // getByRole("link", { name: "Revision 92f6a0c" })

  await expect(
    page.getByRole("cell", { name: "Had to push a new revision" }),
  ).toBeHidden();

  await expect(page).toHaveURL(
    `${cobUrl}/patches/fa393edeb28bdd189bd0c0d7a262cb30d9109595/fa393edeb28bdd189bd0c0d7a262cb30d9109595?tab=changes`,
  );
});

test("navigate through revision diffs", async ({ page }) => {
  await page.goto(`${cobUrl}/patches/fa393edeb28bdd189bd0c0d7a262cb30d9109595`);

  const firstRevision = page.locator(".revision").first();
  const secondRevision = page.locator(".revision").nth(1);

  // Second revision
  {
    await secondRevision
      .getByRole("button", { name: "toggle-context-menu" })
      .first()
      .click();
    await secondRevision
      .getByRole("link", { name: "Compare to main: 38c225e" })
      .click();
    await expect(
      page.getByRole("button", { name: "Compare 38c225..9e4fea" }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/fa393edeb28bdd189bd0c0d7a262cb30d9109595?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec..9e4feab1b2123dfa5f22bd0e4656060ec9296638`,
    );
    await page.goBack();
    await secondRevision
      .getByRole("button", { name: "toggle-context-menu" })
      .first()
      .click();
    await secondRevision
      .getByRole("link", { name: "Compare to previous revision: fa393ed" })
      .click();
    await expect(
      page.getByRole("button", { name: "Compare 88b7fd..9e4fea" }),
    ).toBeVisible();

    await expect(page).toHaveURL(
      `${cobUrl}/patches/fa393edeb28bdd189bd0c0d7a262cb30d9109595?diff=88b7fd90389c1a629f91ed7bf838d4b947426622..9e4feab1b2123dfa5f22bd0e4656060ec9296638`,
    );
    await page.goBack();

    await secondRevision
      .getByRole("link", { name: "Compare 88b7fd9..9e4feab" })
      .getByRole("button")
      .click();
    await expect(
      page.getByRole("link", { name: "Compare 88b7fd9..9e4fea" }),
    ).toBeVisible();
    await page.goBack();
  }
  // First revision
  {
    await firstRevision
      .getByRole("button", { name: "toggle-context-menu" })
      .first()
      .click();
    await firstRevision
      .getByRole("link", { name: "Compare to main: 38c225e" })
      .click();
    await expect(
      page.getByRole("button", { name: "Compare 38c225..88b7fd" }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/fa393edeb28bdd189bd0c0d7a262cb30d9109595?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec..88b7fd90389c1a629f91ed7bf838d4b947426622`,
    );
  }
});

test("view file navigation from changes tab", async ({ page }) => {
  await page.goto(`${cobUrl}/patches/fa393edeb28bdd189bd0c0d7a262cb30d9109595`);
  await page.getByRole("button", { name: "Changes" }).click();
  await page.getByRole("button", { name: "View file" }).click();
  await expect(page).toHaveURL(
    `${cobUrl}/tree/9e4feab1b2123dfa5f22bd0e4656060ec9296638/README.md`,
  );
});

test("change patch state", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "lifecycle",
  );
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
  await expect(page.getByText("archived", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "0 patches" })).toBeVisible();

  await page.getByLabel("stateToggle").first().click();
  await page.getByText("Convert to draft").click();
  await page.getByText("Convert to draft").click();
  await expect(page.getByText("draft", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "0 patches" })).toBeVisible();
});

test("edit title", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "edit-title",
  );
  await authenticatedPeer.git(["switch", "-c", "edit-title"], {
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

  const titleLocator = page.getByText("Some patch title").first();
  await expect(titleLocator).toBeVisible();
  await expect(page.getByPlaceholder("Title")).toBeHidden();

  await page.getByRole("button", { name: "edit title" }).click();
  await page
    .getByPlaceholder("Title")
    .fill("This is a modified patch title to be dismissed");
  await page.getByRole("button", { name: "dismiss changes" }).click();
  await expect(titleLocator).toBeVisible();

  await page.getByRole("button", { name: "edit title" }).click();
  await page.getByPlaceholder("Title").fill("This is a modified patch title");
  await page.getByRole("button", { name: "save title" }).click();
  await expect(page.getByRole("button", { name: "save title" })).toBeHidden();
  await page.reload();
  await expect(page.getByText("This is a modified patch title")).toBeVisible();
});

test("edit description", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "edit-description",
  );
  await authenticatedPeer.git(["switch", "-c", "edit-description"], {
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

  await expect(page.getByText("No description available")).toBeVisible();
  await expect(page.getByPlaceholder("Leave a description")).toBeHidden();

  await page.getByRole("button", { name: "edit description" }).click();
  await page
    .getByPlaceholder("Leave a description")
    .fill("This is a modified patch description to be dismissed");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("No description available")).toBeVisible();

  await page.getByRole("button", { name: "edit description" }).click();
  await page
    .getByPlaceholder("Leave a description")
    .fill("This is a modified patch description");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeHidden();
  await page.reload();
  await expect(
    page.getByText("This is a modified patch description"),
  ).toBeVisible();
});
