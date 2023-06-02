import type { Page } from "@playwright/test";

import {
  aliceMainHead,
  aliceRemote,
  bobRemote,
  expect,
  projectFixtureUrl,
  rid,
  test,
} from "@tests/support/fixtures.js";
import { expectUrlPersistsReload } from "@tests/support/router";

async function expectCounts(
  params: { commits: number; contributors: number },
  page: Page,
) {
  await expect(
    page.locator(
      `role=link[name="${params.commits} ${
        params.commits === 1 ? "commit" : "commits"
      }"]`,
    ),
  ).toBeVisible();

  await expect(
    page.locator(
      `text=${params.contributors} ${
        params.contributors === 1 ? "contributor" : "contributors"
      }`,
    ),
  ).toBeVisible();
}

test("navigate to project", async ({ page }) => {
  await page.goto(projectFixtureUrl);

  // Header.
  {
    const name = page.locator("text=source-browsing");
    const id = page.locator(`text=${rid}`);
    const description = page.locator(
      "text=Git repository for source browsing tests",
    );

    await expect(name).toBeVisible();
    await expect(id).toBeVisible();
    await expect(description).toBeVisible();
  }

  // Project menu shows default selected branch and commit and contributor counts.
  {
    await expect(page.getByTitle("Current branch")).toContainText(
      `main ${aliceMainHead.substring(0, 7)}`,
    );
    await expectCounts({ commits: 8, contributors: 1 }, page);
  }

  // Navigate to the project README.md by default.
  await expect(page.locator(".file-name")).toContainText("README.md");

  // Show a commit teaser.
  await expect(page.locator("text=dd068e9 Add README.md")).toBeVisible();

  // Show rendered README.md contents.
  await expect(page.locator("text=Git test repository")).toBeVisible();

  // Number of nodes tracking this project.
  await expect(page.locator("text=3 nodes")).toBeVisible();
});

test("show source tree at specific revision", async ({ page }) => {
  await page.goto(projectFixtureUrl);
  await page.locator('role=link[name="8 commits"]').click();

  await page
    .locator(".teaser", { hasText: "335dd6d" })
    .getByTitle("Browse the repository at this point in the history")
    .click();

  await expect(page.getByTitle("Current branch")).toContainText(
    "335dd6dc89b535a4a31e9422c803199bb6b0a09a",
  );
  await expect(page.locator(".source-tree")).toHaveText("bin/ src/");
  await expectCounts({ commits: 2, contributors: 1 }, page);
});

test("source file highlighting", async ({ page }) => {
  await page.goto(projectFixtureUrl);

  await page.getByText("src/").click();
  await page.getByText("true.c").click();

  await expect(page.getByText("return")).toHaveCSS(
    "color",
    "rgb(255, 123, 114)",
  );
});

test("navigate line numbers", async ({ page }) => {
  await page.goto(`${projectFixtureUrl}/tree/main/markdown/cheatsheet.md`);
  await page.locator('text="Plain"').click();

  await page.locator('[href="#L5"]').click();
  await expect(page.locator("#L5")).toHaveClass("line highlight");
  await expect(page).toHaveURL(
    `${projectFixtureUrl}/tree/main/markdown/cheatsheet.md#L5`,
  );

  await expectUrlPersistsReload(page);
  await expect(page.locator("#L5")).toHaveClass("line highlight");

  await page.locator('[href="#L30"]').click();
  await expect(page.locator("#L5")).not.toHaveClass("line highlight");
  await expect(page.locator("#L30")).toHaveClass("line highlight");
  await expect(page).toHaveURL(
    `${projectFixtureUrl}/tree/main/markdown/cheatsheet.md#L30`,
  );

  await page.getByText(".hidden").click();
  await expect(page).toHaveURL(`${projectFixtureUrl}/tree/main/.hidden`);
});

test("navigate deep file hierarchies", async ({ page }) => {
  await page.goto(projectFixtureUrl);

  const sourceTree = page.locator(".source-tree");

  await sourceTree.getByText("deep/").click();
  await sourceTree.getByText("directory/").click();
  await sourceTree.getByText("hierarchy/").click();
  await sourceTree.getByText("is/").click();
  await sourceTree.getByText("entirely/").click();
  await sourceTree.getByText("possible/").click();
  await sourceTree.getByText("in/").nth(1).click();
  await sourceTree.getByText("git/").click();
  await sourceTree.getByText("repositories/").click();
  await sourceTree.getByText(".gitkeep").click();
  await expect(
    page.locator("text=0801ace Add a deeply nested directory tree"),
  ).toBeVisible();

  // After a page reload the tree browser is still expanded and we're still
  // showing the .gitkeep file.
  {
    await page.reload();

    const sourceTree = page.locator(".source-tree");

    await expect(sourceTree.getByText("deep/")).toBeVisible();
    await expect(sourceTree.getByText("directory/")).toBeVisible();
    await expect(sourceTree.getByText("hierarchy/")).toBeVisible();
    await expect(sourceTree.getByText("is/")).toBeVisible();
    await expect(sourceTree.getByText("entirely/")).toBeVisible();
    await expect(sourceTree.getByText("possible/")).toBeVisible();
    await expect(sourceTree.getByText("in/").nth(1)).toBeVisible();
    await expect(sourceTree.getByText("git/")).toBeVisible();
    await expect(sourceTree.getByText("repositories/")).toBeVisible();
    await expect(sourceTree.getByText(".gitkeep")).toBeVisible();

    await expect(
      page.locator("text=0801ace Add a deeply nested directory tree"),
    ).toBeVisible();
  }
});

test("files with special characters in the filename", async ({ page }) => {
  await page.goto(projectFixtureUrl);

  const sourceTree = page.locator(".source-tree");
  await sourceTree.getByText("special/").click();

  await sourceTree.getByText("+plus+").click();
  await expect(page.locator(".file-name")).toContainText("+plus");

  await sourceTree.getByText("-dash-").click();
  await expect(page.locator(".file-name")).toContainText("-dash-");

  await sourceTree.getByText(":colon:").click();
  await expect(page.locator(".file-name")).toContainText(":colon:");

  await sourceTree.getByText(";semicolon;").click();
  await expect(page.locator(".file-name")).toContainText(";semicolon;");

  await sourceTree.getByText("@at@").click();
  await expect(page.locator(".file-name")).toContainText("@at@");

  await sourceTree.getByText("_underscore_").click();
  await expect(page.locator(".file-name")).toContainText("_underscore_");

  // TODO: fix these errors in `racdicle-client-services/http-api` for the
  // following edge cases.
  //
  // await sourceTree.getByText("back\\slash").click();
  // await expect(page.locator(".file-name")).toContainText("back\\slash");
  // await sourceTree.getByText("qs?param1=value?param2=value2#hash").click();
  // await expect(page.locator(".file-name")).toContainText(
  //   "qs?param1=value?param2=value2#hash",
  // );

  await sourceTree.getByText("spaces are okay").click();
  await expect(page.locator(".file-name")).toContainText("spaces are okay");

  await sourceTree.getByText("~tilde~").click();
  await expect(page.locator(".file-name")).toContainText("~tilde~");

  await sourceTree.getByText("👹👹👹").click();
  await expect(page.locator(".file-name")).toContainText("👹👹👹");
});

test("binary files", async ({ page }) => {
  await page.goto(projectFixtureUrl);

  await page.getByText("bin/").click();
  await page.getByText("true").click();

  await expect(page.locator("text=Binary content")).toBeVisible();
});

test("hidden files", async ({ page }) => {
  await page.goto(projectFixtureUrl);

  await page.getByText(".hidden").click();

  await expect(page.locator("text=I'm a hidden file.")).toBeVisible();
});

test("markdown files", async ({ page }) => {
  await page.goto(`${projectFixtureUrl}/tree/main/markdown/cheatsheet.md`);

  await expect(
    page.locator("text=This is intended as a quick reference and showcase."),
  ).toBeVisible();

  // Switch between raw and rendered modes.
  {
    const plainButton = page.locator('text="Plain"');
    await plainButton.click();
    await expect(page.locator("text=##### Table of Contents")).toBeVisible();

    const markdownButton = page.locator('text="Markdown"');
    await markdownButton.click();
  }

  // Internal links go to anchor.
  {
    await page.getByRole("link", { name: "YouTube Videos" }).click();
    await expect(page).toHaveURL(
      `${projectFixtureUrl}/tree/main/markdown/cheatsheet.md#videos`,
    );
  }
});

test("clone modal", async ({ page }) => {
  await page.goto(projectFixtureUrl);

  await page.getByText("Clone").click();
  await expect(page.locator(`text=rad clone ${rid}`)).toBeVisible();
  await expect(
    page.locator(`text=http://127.0.0.1/${rid.replace("rad:", "")}.git`),
  ).toBeVisible();
});

test("peer and branch switching", async ({ page }) => {
  await page.goto(projectFixtureUrl);

  // Alice's peer.
  {
    await page.getByTitle("Change peer").click();
    await page.locator(`text=${aliceRemote}`).click();
    await expect(page.getByTitle("Change peer")).toHaveText(
      `  did:key:${aliceRemote
        .substring(8)
        .substring(0, 6)}…${aliceRemote.slice(-6)} delegate`,
    );
    await expect(
      page.locator(
        `text=source-browsing / did:key:${aliceRemote
          .substring(8)
          .substring(0, 6)}…${aliceRemote.slice(-6)}`,
      ),
    ).toBeVisible();

    // Default `main` branch.
    {
      await expect(page.getByTitle("Current branch")).toContainText(
        "main fcc9294",
      );
      await expectCounts({ commits: 8, contributors: 1 }, page);
    }

    // Feature branch with a slash in the name.
    {
      await page.getByTitle("Change branch").click();
      await page.locator("text=feature/branch").click();

      await expect(page.getByTitle("Current branch")).toContainText(
        "feature/branch d6318f7",
      );
      await expectCounts({ commits: 10, contributors: 1 }, page);
    }

    // Branch without a history or files in it.
    {
      await page.getByTitle("Change branch").click();
      await page.locator("text=orphaned-branch").click();

      await expect(page.getByTitle("Current branch")).toContainText(
        "orphaned-branch af3641c",
      );
      await expectCounts({ commits: 1, contributors: 1 }, page);

      await expect(
        page.locator("text=We couldn't find any files at this revision."),
      ).toBeVisible();
    }
  }

  // Reset the source browser by clicking the project title.
  {
    await page.locator("text=source-browsing").click();

    await expect(page.getByTitle("Change peer")).not.toContainText("alice");
    await expect(page.getByTitle("Change peer")).not.toContainText("bob");

    await expect(page.getByTitle("Current branch")).toContainText(
      "main fcc9294",
    );
    await expect(page.locator("text=Git test repository")).toBeVisible();
  }

  // Bob's peer.
  {
    await page.getByTitle("Change peer").click();
    await page.locator(`text=${bobRemote}`).click();
    await expect(page.getByTitle("Change peer")).toHaveText(
      ` did:key:${bobRemote.substring(8).substring(0, 6)}…${bobRemote.slice(
        -6,
      )} `,
    );
    await expect(page.getByTitle("Change peer")).not.toHaveText("delegate");

    // Default `main` branch.
    {
      await expect(page.getByTitle("Current branch")).toContainText(
        "main ec5eb0b",
      );
      await expectCounts({ commits: 9, contributors: 2 }, page);
      await expect(page.locator("text=ec5eb0b Update readme")).toBeVisible();
    }
  }
});

test("only one modal can be open at a time", async ({ page }) => {
  await page.goto(projectFixtureUrl);

  await page.getByTitle("Change peer").click();
  await page.locator(`text=${aliceRemote}`).click();

  await page.getByText("Clone").click();
  await expect(page.locator("text=Code font")).not.toBeVisible();
  await expect(page.locator("text=Use the Radicle CLI")).toBeVisible();
  await expect(page.locator("text=bob hyyzz9")).not.toBeVisible();
  await expect(page.locator("text=feature/branch")).not.toBeVisible();

  await page.locator('button[name="Settings"]').click();
  await expect(page.locator("text=Code font")).toBeVisible();
  await expect(page.locator("text=Use the Radicle CLI")).not.toBeVisible();
  await expect(page.locator("text=bob hyyzz9")).not.toBeVisible();
  await expect(page.locator("text=feature/branch")).not.toBeVisible();

  await page.getByTitle("Change branch").click();
  await expect(page.locator("text=Code font")).not.toBeVisible();
  await expect(page.locator("text=Use the Radicle CLI")).not.toBeVisible();
  await expect(page.locator("text=bob hyyzz9")).not.toBeVisible();
  await expect(page.locator("text=feature/branch")).toBeVisible();

  await page.getByTitle("Change peer").click();
  await expect(page.locator("text=Code font")).not.toBeVisible();
  await expect(page.locator("text=Use the Radicle CLI")).not.toBeVisible();
  await expect(page.locator(`text=${bobRemote}`)).toBeVisible();
  await expect(page.locator("text=feature/branch")).not.toBeVisible();
});

test.describe("browser error handling", () => {
  test("error appears when folder can't be loaded", async ({ page }) => {
    await page.route(
      `**/v1/projects/${rid}/tree/${aliceMainHead}/markdown/`,
      route => route.fulfill({ status: 500 }),
    );

    await page.goto(projectFixtureUrl);

    const sourceTree = page.locator(".source-tree");
    await sourceTree.locator("text=markdown/").click();

    await expect(
      page.locator("text=Not able to expand directory"),
    ).toBeVisible();
  });
  test("error appears when file can't be loaded", async ({ page }) => {
    await page.route(
      `**/v1/projects/${rid}/blob/${aliceMainHead}/.hidden`,
      route => route.fulfill({ status: 500 }),
    );

    await page.goto(projectFixtureUrl);
    await page.locator("text=.hidden").click();

    await expect(page.locator("text=Not able to load file")).toBeVisible();
  });
  test("error appears when README can't be loaded", async ({ page }) => {
    await page.route(`**/v1/projects/${rid}/readme/${aliceMainHead}`, route =>
      route.fulfill({ status: 500 }),
    );

    await page.goto(projectFixtureUrl);
    await expect(
      page.locator("text=The README could not be loaded."),
    ).toBeVisible();
  });
  test("error appears when navigating to missing file", async ({ page }) => {
    await page.route(
      `**/v1/projects/${rid}/blob/${aliceMainHead}/.hidden`,
      route => route.fulfill({ status: 500 }),
    );

    await page.goto(`${projectFixtureUrl}/tree/master/.hidden`);

    await expect(page.locator("text=Not able to load file")).toBeVisible();
  });
});
