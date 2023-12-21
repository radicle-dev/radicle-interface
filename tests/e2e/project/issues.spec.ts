import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createProject } from "@tests/support/project";

test("navigate issue listing", async ({ page }) => {
  await page.goto(cobUrl);
  await page.getByRole("link", { name: "1 issue" }).click();
  await expect(page).toHaveURL(`${cobUrl}/issues`);

  await page.getByRole("button", { name: "filter-dropdown" }).first().click();
  await page.getByRole("link", { name: "2 closed" }).click();
  await expect(page).toHaveURL(`${cobUrl}/issues?state=closed`);
});

test("issue counters", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(authenticatedPeer, {
    name: "issue-counters",
  });
  await authenticatedPeer.rad(
    [
      "issue",
      "open",
      "--title",
      "First issue to test counters",
      "--description",
      "Let's see",
    ],
    { cwd: projectFolder },
  );
  await page.goto(`${authenticatedPeer.uiUrl()}/${rid}/issues`);
  await authenticatedPeer.rad(
    [
      "issue",
      "open",
      "--title",
      "Second issue to test counters",
      "--description",
      "Let's see",
    ],
    { cwd: projectFolder },
  );
  await page.getByRole("button", { name: "filter-dropdown" }).first().click();
  await page.locator(".dropdown-item").getByText("1 open").click();
  await expect(page.getByRole("button", { name: "2 issues" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "filter-dropdown" }).first(),
  ).toHaveText("2 open");
  await expect(page.locator(".list .issue-teaser")).toHaveCount(2);

  await page
    .getByRole("link", { name: "First issue to test counters" })
    .click();
  await page.getByRole("button", { name: "Close issue as solved" }).click();
  await expect(page.getByRole("button", { name: "1 issue" })).toBeVisible();
});

test("create a new issue", async ({ page, authenticatedPeer }) => {
  const { rid } = await createProject(authenticatedPeer, {
    name: "commenting",
  });

  await page.goto(
    `/nodes/${authenticatedPeer.httpdBaseUrl.hostname}:${authenticatedPeer.httpdBaseUrl.port}/${rid}`,
  );
  await page.getByRole("link", { name: "0 issues" }).click();
  await page.getByRole("link", { name: "New issue" }).click();
  await page.getByPlaceholder("Title").fill("This is a title");
  await page
    .getByPlaceholder("Write a description")
    .fill("This is a description");

  await page.getByRole("button", { name: "add assignee" }).click();
  await page.getByPlaceholder("Add assignee").fill(authenticatedPeer.nodeId);
  await page.keyboard.press("Enter");

  await page.getByRole("button", { name: "add label" }).click();
  await page.getByPlaceholder("Add label").fill("bug");
  await page.keyboard.press("Enter");

  await page.getByRole("button", { name: "add label" }).click();
  await page.getByPlaceholder("Add label").fill("documentation");
  await page.keyboard.press("Enter");

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText("This is a title")).toBeVisible();
  await expect(page.getByText("This is a description")).toBeVisible();
  await expect(
    page.getByText(
      `did:key:${authenticatedPeer.nodeId.substring(
        0,
        6,
      )}…${authenticatedPeer.nodeId.slice(-6)}`,
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "documentation" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "bug" })).toBeVisible();
});
