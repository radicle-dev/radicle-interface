import { test, expect } from "@tests/support/fixtures.js";
import {
  addEmbed,
  createProject,
  expectReactionsToWork,
  expectThreadCommentingToWork,
  extractPatchId,
} from "@tests/support/project";

test("leave comments and replies", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(authenticatedPeer, {
    name: "commenting",
  });
  await authenticatedPeer.rad(
    [
      "issue",
      "open",
      "--title",
      "This is an issue to write comments and replies",
      "--description",
      "We'll give it a few comments and replies.",
    ],
    { cwd: projectFolder },
  );
  await page.goto(`${authenticatedPeer.uiUrl()}/${rid}/issues`);
  await page
    .getByRole("link", {
      name: "This is an issue to write comments and replies",
    })
    .click();
  await expectThreadCommentingToWork(page);

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
  await expectThreadCommentingToWork(page);
});

test("add and remove reactions", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(authenticatedPeer, {
    name: "reactions",
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
  const reactionsLocator = page.locator(".actions").first();
  await expectReactionsToWork(page, reactionsLocator);
});

test("handling embeds", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(authenticatedPeer, {
    name: "embeds",
  });
  await authenticatedPeer.rad(
    [
      "issue",
      "open",
      "--title",
      "This is an issue to handle embeds",
      "--description",
      "We'll give it a few comments and replies with embeds.",
    ],
    { cwd: projectFolder },
  );
  await page.goto(`${authenticatedPeer.uiUrl()}/${rid}/issues`);
  await page
    .getByRole("link", {
      name: "This is an issue to handle embeds",
    })
    .click();
  await page.getByRole("button", { name: "Leave your comment" }).click();

  await page
    .getByPlaceholder("Leave your comment")
    .fill("Here is some text\n\n");
  await addEmbed(
    page,
    "./public/images/radicle-228x228.png",
    "radicle-228x228.png",
    "image/png",
  );
  await expect(page.getByPlaceholder("Leave your comment")).toHaveValue(
    "Here is some text\n\n![radicle-228x228.png](bae036309c2182c7304c97956969369823b5c6ad)\n",
  );

  await page.getByRole("button", { name: "Preview" }).click();
  await expect(
    page.getByRole("img", { name: "radicle-228x228.png" }),
  ).toBeVisible();
  expect(
    await page
      .getByRole("img", { name: "radicle-228x228.png" })
      .getAttribute("src"),
  ).toBe(
    "data:image/png;base64,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",
  );

  await page.getByRole("button", { name: "Comment" }).click();
  await expect(page.getByPlaceholder("Leave your comment")).toBeHidden();
  await expect(page.getByText("Here is some text")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "radicle-228x228.png" }),
  ).toBeVisible();
  const { scheme, hostname, port } = authenticatedPeer.httpdBaseUrl;
  expect(
    await page
      .getByRole("img", { name: "radicle-228x228.png" })
      .getAttribute("src"),
  ).toBe(
    `${scheme}://${hostname}:${port}/raw/rad:z2J7s48EbCBckcEmj2dm5eaFVoBsy/blobs/bae036309c2182c7304c97956969369823b5c6ad?mime=image/png`,
  );
  await expect(
    page.locator(".badge").filter({ hasText: "radicle-228x228.png" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "edit comment" }).click();
  await page
    .getByPlaceholder("Leave your comment")
    .fill(
      "Here is some text\n\n![radicle-228x228.png](bae036309c2182c7304c97956969369823b5c6ad)\n\n",
    );
  await addEmbed(
    page,
    "./public/images/apple-touch-icon.png",
    "apple-touch-icon.png",
    "image/png",
  );
  await expect(page.getByPlaceholder("Leave your comment")).toHaveValue(
    "Here is some text\n\n![radicle-228x228.png](bae036309c2182c7304c97956969369823b5c6ad)\n\n![apple-touch-icon.png](c69a66fa4c414c92bf75365fb5c92453fa95dcca)\n",
  );
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeHidden();
  await expect(
    page.locator(".badge").filter({ hasText: "apple-touch-icon.png" }),
  ).toBeVisible();
  await expect(
    page.locator(".badge").filter({ hasText: "radicle-228x228.png" }),
  ).toBeVisible();
});
