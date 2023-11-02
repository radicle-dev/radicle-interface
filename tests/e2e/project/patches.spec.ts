import type { ExecaReturnValue } from "execa";
import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createProject } from "@tests/support/project";

function extractPatchId(cmdOutput: ExecaReturnValue<string>) {
  const match = cmdOutput.stderr.match(/[0-9a-f]{40}/);
  if (match) {
    return match[0];
  } else {
    throw new Error("Could not get patch id");
  }
}

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

test("edit a patch", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "commenting",
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
  await expect(page.getByRole("button", { name: "1 patch" })).toBeVisible();
  await expect(page.getByText("open", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "edit labels" }).click();
  await page.getByPlaceholder("Add label").fill("bug");
  await page.getByPlaceholder("Add label").press("Enter");
  await page.getByPlaceholder("Add label").fill("documentation");
  await page.getByPlaceholder("Add label").press("Enter");
  await page.getByRole("button", { name: "save labels" }).click();

  await expect(
    page.locator(".badge").filter({ hasText: "documentation" }),
  ).toBeVisible();
  await expect(page.locator(".badge").filter({ hasText: "bug" })).toBeVisible();
});

test("leave a comment and reply", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "commenting",
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
  await page.getByRole("button", { name: "Leave your comment" }).click();
  await page.getByPlaceholder("Leave your comment").fill("This is a comment");
  await page.getByRole("button", { name: "Comment" }).click();
  await expect(page.getByText("This is a comment")).toBeVisible();

  await page.getByRole("button", { name: "Reply to comment" }).click();
  await page.getByPlaceholder("Reply to comment").fill("This is a reply");
  await page.getByRole("button", { name: "Comment", exact: true }).click();
  await expect(page.getByText("This is a reply")).toBeVisible();
});

test("add and remove reactions", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "reactions",
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
  await page.getByRole("button", { name: "Leave your comment" }).click();
  await page.getByPlaceholder("Leave your comment").fill("This is a comment");
  await page.getByRole("button", { name: "Comment" }).click();
  const commentReactionToggle = page.getByTitle("toggle-reaction").first();
  await commentReactionToggle.click();
  await page.getByRole("button", { name: "👍" }).click();
  await expect(page.getByRole("button", { name: "👍 1" })).toBeVisible();

  await commentReactionToggle.click();
  await page.getByRole("button", { name: "🎉" }).click();
  await expect(page.getByRole("button", { name: "🎉 1" })).toBeVisible();
  await expect(page.locator(".reaction")).toHaveCount(2);

  await page.getByRole("button", { name: "👍" }).click();
  await expect(page.locator("span").filter({ hasText: "👍 1" })).toBeHidden();
  await expect(page.locator(".reaction")).toHaveCount(1);

  await commentReactionToggle.click();
  await page.getByRole("button", { name: "🎉" }).first().click();
  await expect(page.getByRole("button", { name: "🎉 1" })).toBeHidden();
  await expect(page.locator(".reaction")).toHaveCount(0);
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

test("use revision selector", async ({ page }) => {
  await page.goto(`${cobUrl}/patches/679b2c84a8e15ce1f73c4c231b55431b89b2559a`);
  await page.getByRole("link", { name: "Changes" }).click();

  // Validating the latest revision state
  await expect(
    page.getByRole("cell", { name: "Had to push a new revision" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Activity" }).click();
  await expect(page.locator(".commits .teaser")).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Add more text" })).toBeVisible();

  // Open the first revision and close the latest one
  await page.getByLabel("expand").first().click();
  await page.getByLabel("expand").last().click();

  // Validating the initial revision
  await expect(page.locator(".commits .teaser")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Rewrite subtitle to README" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Changes" }).click();
  // Switching to the initial revision
  await page.getByText("Revision 2c2f036").click();
  await expect(page.locator(".dropdown")).toBeVisible();
  await page.getByRole("link", { name: "Revision 679b2c8" }).click();
  await expect(page.locator(".dropdown")).toBeHidden();

  await expect(
    page.getByRole("cell", { name: "Had to push a new revision" }),
  ).toBeHidden();

  await expect(page).toHaveURL(
    `${cobUrl}/patches/679b2c84a8e15ce1f73c4c231b55431b89b2559a/679b2c84a8e15ce1f73c4c231b55431b89b2559a?tab=changes`,
  );
});

test("navigate through revision diffs", async ({ page }) => {
  await page.goto(`${cobUrl}/patches/679b2c84a8e15ce1f73c4c231b55431b89b2559a`);

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
      page.getByRole("link", { name: "Compare 38c225..9898da" }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/679b2c84a8e15ce1f73c4c231b55431b89b2559a?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec..9898da6155467adad511f63bf0fb5aa4156b92ef`,
    );
    await page.goBack();
    await secondRevision
      .getByRole("button", { name: "toggle-context-menu" })
      .first()
      .click();
    await secondRevision
      .getByRole("link", { name: "Compare to previous revision: 679b2c8" })
      .click();
    await expect(
      page.getByRole("link", { name: "Compare 0dc373..9898da" }),
    ).toBeVisible();

    await expect(page).toHaveURL(
      `${cobUrl}/patches/679b2c84a8e15ce1f73c4c231b55431b89b2559a?diff=0dc373db601ccbcffa80dec932e4006516709ca6..9898da6155467adad511f63bf0fb5aa4156b92ef`,
    );
    await page.goBack();

    await secondRevision
      .getByRole("link", { name: "Compare 0dc373d..9898da6" })
      .click();
    await expect(
      page.getByRole("link", { name: "Compare 0dc373..9898da" }),
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
      page.getByRole("link", { name: "Compare 38c225..0dc373" }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/679b2c84a8e15ce1f73c4c231b55431b89b2559a?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec..0dc373db601ccbcffa80dec932e4006516709ca6`,
    );
  }
});

test("view file navigation from changes tab", async ({ page }) => {
  await page.goto(`${cobUrl}/patches/679b2c84a8e15ce1f73c4c231b55431b89b2559a`);
  await page.getByRole("button", { name: "Changes" }).click();
  await page.getByRole("button", { name: "View file" }).click();
  await expect(page).toHaveURL(
    `${cobUrl}/tree/9898da6155467adad511f63bf0fb5aa4156b92ef/README.md`,
  );
});
