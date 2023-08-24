import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createProject } from "@tests/support/project";

test("navigate issue listing", async ({ page }) => {
  await page.goto(cobUrl);
  await page.getByRole("link", { name: "1 issue" }).click();
  await expect(page).toHaveURL(`${cobUrl}/issues`);

  await page.getByRole("link", { name: "2 closed" }).click();
  await expect(page).toHaveURL(`${cobUrl}/issues?state=closed`);
});

test("navigate single issue", async ({ page }) => {
  await page.goto(`${cobUrl}/issues`);
  await page.getByText("This title has markdown").click();

  await expect(page).toHaveURL(
    `${cobUrl}/issues/9cedac832f0791bea5c9cf8fa32db8a68c592166`,
  );
});

test("adding and removing reactions", async ({ page, authenticatedPeer }) => {
  await page.goto(authenticatedPeer.uiUrl());
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "handle-reactions",
  );
  await authenticatedPeer.rad(
    [
      "issue",
      "open",
      "--title",
      "This is an issue to test reactions",
      "--description",
      "We'll write some comments and add and remove reactions to them",
    ],
    { cwd: projectFolder },
  );
  await page.goto(
    `${authenticatedPeer.uiUrl()}/${rid}/issues/48af7d329e5b44ee8d348eeb7e341370243db9ad`,
  );
  const commentReactionToggle = page.getByTitle("toggle-reaction");
  await page.getByPlaceholder("Leave your comment").fill("This is a comment");
  await page.getByRole("button", { name: "Comment" }).click();
  await commentReactionToggle.click();
  await page.getByRole("button", { name: "👍" }).click();
  await expect(page.locator("span").filter({ hasText: "👍 1" })).toBeVisible();

  await commentReactionToggle.click();
  await page.getByRole("button", { name: "🎉" }).click();
  await expect(page.locator("span").filter({ hasText: "🎉 1" })).toBeVisible();
  await expect(page.locator(".reaction")).toHaveCount(2);

  await page.locator("span").filter({ hasText: "👍 1" }).click();
  await expect(page.locator("span").filter({ hasText: "👍 1" })).toBeHidden();
  await expect(page.locator(".reaction")).toHaveCount(1);

  await commentReactionToggle.click();
  await page.getByRole("button", { name: "🎉" }).click();
  await expect(page.locator("span").filter({ hasText: "🎉 1" })).toBeHidden();
  await expect(page.locator(".reaction")).toHaveCount(0);
});

test("test issue counters", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "issue-counters",
  );
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
  await page.getByRole("button", { name: "1 open" }).click();
  await expect(page.getByRole("button", { name: "2 issues" })).toBeVisible();
  await expect(page.getByRole("button", { name: "2 open" })).toBeVisible();
  await expect(page.locator(".issues-list .teaser")).toHaveCount(2);

  await page
    .getByRole("link", { name: "First issue to test counters" })
    .click();
  await page.getByRole("button", { name: "Close issue as solved" }).click();
  await expect(page.getByRole("button", { name: "1 issue" })).toBeVisible();
});

test("test issue editing failing", async ({ page, authenticatedPeer }) => {
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "issue-editing",
  );
  await authenticatedPeer.rad(
    [
      "issue",
      "open",
      "--title",
      "This issue is going to fail",
      "--description",
      "Let's see",
    ],
    { cwd: projectFolder },
  );

  await page.route(
    `**/v1/projects/${rid}/issues/ad9114fa910c67f09ce5d42d12c31038eb40fc86`,
    route => {
      if (route.request().method() !== "PATCH") {
        void route.fallback();
        return;
      }
      void route.fulfill({ status: 500 });
    },
  );

  await page.goto(
    `${authenticatedPeer.uiUrl()}/${rid}/issues/ad9114fa910c67f09ce5d42d12c31038eb40fc86`,
  );

  await page.getByPlaceholder("Leave your comment").fill("This is a comment");
  await page.getByRole("button", { name: "Comment" }).click();
  await expect(page.getByText("Issue editing failed")).toBeVisible();
});

test("go through the entire ui issue flow", async ({
  page,
  authenticatedPeer,
}) => {
  const { rid } = await createProject(authenticatedPeer, "commenting");

  await page.goto(
    `/nodes/${authenticatedPeer.httpdBaseUrl.hostname}:${authenticatedPeer.httpdBaseUrl.port}/${rid}`,
  );
  await page.getByRole("link", { name: "0 issues" }).click();
  await page.getByRole("link", { name: "New issue" }).click();
  await page.getByPlaceholder("Title").fill("This is a title");
  await page
    .getByPlaceholder("Write a description")
    .fill("This is a description");

  await page.getByPlaceholder("Add assignee").fill(authenticatedPeer.nodeId);
  await page.getByPlaceholder("Add assignee").press("Enter");

  await page.getByPlaceholder("Add label").fill("bug");
  await page.getByPlaceholder("Add label").press("Enter");
  await page.getByPlaceholder("Add label").fill("documentation");
  await page.getByPlaceholder("Add label").press("Enter");
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText("This is a title")).toBeVisible();
  await expect(page.getByText("This is a description")).toBeVisible();
  await expect(
    page.getByLabel("chip").filter({
      hasText: `did:key:${authenticatedPeer.nodeId.substring(
        0,
        6,
      )}…${authenticatedPeer.nodeId.slice(-6)}`,
    }),
  ).toBeVisible();
  await expect(
    page.getByLabel("chip").filter({ hasText: "documentation" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("chip").filter({ hasText: "bug" }),
  ).toBeVisible();

  await page.getByLabel("editTitle").click();
  await page.getByPlaceholder("Title").fill("This is a new title");
  await page.getByLabel("editTitle").click();
  await expect(page.getByText("This is a new title")).toBeVisible();

  await page.getByPlaceholder("Leave your comment").fill("This is a comment");
  await page.getByRole("button", { name: "Comment" }).click();
  await expect(page.getByText("This is a comment")).toBeVisible();

  await page.getByTitle("toggle-reply").click();
  await page.getByPlaceholder("Leave your reply").fill("This is a reply");
  await page.getByRole("button", { name: "Reply", exact: true }).click();
  await expect(page.getByText("This is a reply")).toBeVisible();

  await page.getByRole("button", { name: "Close issue as solved" }).click();
  await expect(page.getByText("closed as solved")).toBeVisible();

  await page.getByRole("button", { name: "Reopen issue" }).click();
  await expect(page.getByText("open", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "stateToggle" }).click();
  await page.getByText("Close issue as other").click();
  await page.getByRole("button", { name: "Close issue as other" }).click();
  await expect(page.getByText("closed as other")).toBeVisible();
});
