import { test } from "@tests/support/fixtures.js";
import {
  createProject,
  expectLabelEditingToWork,
  extractPatchId,
} from "@tests/support/project";

test("add and remove labels", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "handle-labels",
  );
  await authenticatedPeer.rad(
    [
      "issue",
      "open",
      "--title",
      "This is an issue to test label handling",
      "--description",
      "We'll add and remove labels to them",
    ],
    { cwd: projectFolder },
  );

  await page.goto(`${authenticatedPeer.uiUrl()}/${rid}/issues`);
  await page.getByRole("link", { name: "This is an issue to test" }).click();
  await expectLabelEditingToWork(page);

  await authenticatedPeer.git(["switch", "-c", "handle-labels"], {
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
  await expectLabelEditingToWork(page);
});
