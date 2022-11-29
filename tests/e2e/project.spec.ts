import type { Page } from "@playwright/test";
import { test, expect } from "@tests/support/fixtures.js";

const sourceBrowsingFixture =
  "/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o";

async function expectCounts(
  params: { commits: number; contributors: number },
  page: Page,
) {
  await expect(page.locator('role=button[name="Commit count"]')).toContainText(
    `${params.commits} commit(s)`,
  );
  await expect(
    page.locator('role=button[name="Contributor count"]'),
  ).toContainText(`${params.contributors} contributor(s)`);
}

test("navigate to project", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);

  // Header.
  {
    const name = page.locator("text=source-browsing");
    const urn = page.locator(
      "text=rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o",
    );
    const description = page.locator(
      "text=Git repository for source browsing tests",
    );

    await expect(name).toBeVisible();
    await expect(urn).toBeVisible();
    await expect(description).toBeVisible();
  }

  // Project menu shows default selected branch and commit and contributor counts.
  {
    await expect(page.getByTitle("Current branch")).toContainText(
      "main 530aabd",
    );
    await expectCounts({ commits: 7, contributors: 1 }, page);
  }

  // Navigate to the project README.md by default.
  await expect(page.locator(".file-name")).toContainText("README.md");

  // Show a commit teaser.
  await expect(page.locator("text=dd068e9 Add README.md")).toBeVisible();

  // Show rendered README.md contents.
  await expect(page.locator("text=Git test repository")).toBeVisible();
});

test("show source tree at specific revision", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);
  await page.locator('role=button[name="Commit count"]').click();

  await page
    .locator(".commit-teaser", { hasText: "335dd6d" })
    .getByTitle("Browse the repository at this point in the history")
    .click();

  await expect(page.getByTitle("Current branch")).toContainText(
    "335dd6dc89b535a4a31e9422c803199bb6b0a09a",
  );
  expect(page.locator(".source-tree")).toHaveText("bin/ src/");
  await expectCounts({ commits: 2, contributors: 1 }, page);
});

test("source file highlighting", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);

  await page.getByText("src/").click();
  await page.getByText("true.c").click();

  await expect(page.getByText("return")).toHaveCSS(
    "color",
    "rgb(180, 142, 173)",
  );
});

test("navigate deep file hierarchies", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);

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
  await page.goto(sourceBrowsingFixture);

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
  await page.goto(sourceBrowsingFixture);

  await page.getByText("bin/").click();
  await page.getByText("true").click();

  await expect(page.locator("text=Binary content")).toBeVisible();
});

test("hidden files", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);

  await page.getByText(".hidden").click();

  await expect(page.locator("text=I'm a hidden file.")).toBeVisible();
});

test("markdown files", async ({ page }) => {
  await page.goto(`${sourceBrowsingFixture}/tree/main/markdown/cheatsheet.md`);

  await expect(
    page.locator("text=This is intended as a quick reference and showcase."),
  ).toBeVisible();

  // Switch between raw and rendered modes.
  {
    const rawButton = page.locator('role=button[name="Raw"]');

    await rawButton.click();
    await expect(rawButton).toHaveClass(/active/);
    await expect(page.locator("text=##### Table of Contents")).toBeVisible();

    await rawButton.click();
    await expect(rawButton).not.toHaveClass("active");
  }

  // Internal links go to anchor.
  {
    await page.getByRole("link", { name: "YouTube Videos" }).click();
    await expect(page).toHaveURL(
      "/seeds/0.0.0.0/rad:git:hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o/tree/main/markdown/cheatsheet.md#videos",
    );
  }
});

test("peer and branch switching", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);

  // Alice's peer.
  {
    await page.getByTitle("Change peer").click();
    await page.locator("text=alice").click();
    await expect(page.getByTitle("Change peer")).toHaveText("alice delegate");
    await expect(
      page.locator("text=source-browsing / hyn1mj…qx7bun"),
    ).toBeVisible();

    // Default `main` branch.
    {
      await expect(page.getByTitle("Current branch")).toContainText(
        "main 530aabd",
      );
      await expectCounts({ commits: 7, contributors: 1 }, page);
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
      "main 530aabd",
    );
    await expect(page.locator("text=Git test repository")).toBeVisible();
  }

  // Bob's peer.
  {
    await page.getByTitle("Change peer").click();
    await page.locator("text=bob").click();

    await expect(page.getByTitle("Change peer")).toHaveText("bob");
    await expect(page.getByTitle("Change peer")).not.toHaveText("delegate");

    // Default `main` branch.
    {
      await expect(page.getByTitle("Current branch")).toContainText(
        "main 0be0f03",
      );
      await expectCounts({ commits: 8, contributors: 2 }, page);
      await expect(page.locator("text=0be0f03 Update readme")).toBeVisible();
    }
  }
});

test("clone modal", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);

  await page.getByText("Clone").click();
  await expect(
    page.locator(
      "text=rad clone rad://0.0.0.0/hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o",
    ),
  ).toBeVisible();
  await expect(
    page.locator(
      "text=https://0.0.0.0/hnrkgd7sjt79k4j59ddh11ooxg18rk7soej8o.git",
    ),
  ).toBeVisible();
});

test("only one modal can be open at a time", async ({ page }) => {
  await page.goto(sourceBrowsingFixture);

  await page.getByTitle("Change peer").click();
  await page.locator("text=alice hyn1mj").click();

  await page.getByText("Clone").click();
  await expect(page.locator("text=Code font")).not.toBeVisible();
  await expect(page.locator("text=Use the Radicle CLI")).toBeVisible();
  await expect(page.locator("text=bob hyy1k6g")).not.toBeVisible();
  await expect(page.locator("text=feature/branch")).not.toBeVisible();

  await page.getByTitle("Change branch").click();
  await expect(page.locator("text=Code font")).not.toBeVisible();
  await expect(page.locator("text=Use the Radicle CLI")).not.toBeVisible();
  await expect(page.locator("text=bob hyy1k6g")).not.toBeVisible();
  await expect(page.locator("text=feature/branch")).toBeVisible();

  await page.getByTitle("Change peer").click();
  await expect(page.locator("text=Code font")).not.toBeVisible();
  await expect(page.locator("text=Use the Radicle CLI")).not.toBeVisible();
  await expect(page.locator("text=bob hyy1k6g")).toBeVisible();
  await expect(page.locator("text=feature/branch")).not.toBeVisible();

  page.locator('button[name="Settings"]').click();
  await expect(page.locator("text=Code font")).toBeVisible();
  await expect(page.locator("text=Use the Radicle CLI")).not.toBeVisible();
  await expect(page.locator("text=bob hyy1k6g")).not.toBeVisible();
  await expect(page.locator("text=feature/branch")).not.toBeVisible();
});
