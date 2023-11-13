import { test } from "@tests/support/fixtures.js";
import {
  createProject,
  expectReactionsToWork,
  expectThreadCommentingToWork,
  extractPatchId,
} from "@tests/support/project";

test("leave comments and replies", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "commenting",
  );
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
  await page.goto(
    `${authenticatedPeer.uiUrl()}/${rid}/issues/017f0c6827fb19e4cfd5103e452ba58665f01798`,
  );
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
  await expectReactionsToWork(page);
});
