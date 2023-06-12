import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createProject } from "@tests/support/project";

test("navigate issue listing", async ({ page }) => {
  await page.goto(cobUrl);
  await page.locator('role=link[name="1 issue"]').click();
  await expect(page).toHaveURL(`${cobUrl}/issues`);

  await page.locator('role=link[name="2 closed"]').click();
  await expect(page).toHaveURL(`${cobUrl}/issues?state=closed`);
});

test("navigate single issue", async ({ page }) => {
  await page.goto(`${cobUrl}/issues`);
  await page.locator("text=This title has markdown").click();

  await expect(page).toHaveURL(
    `${cobUrl}/issues/4fc727e722d3979fd2073d9b56b2751658a4ae79`,
  );
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
    `**/v1/projects/${rid}/issues/d316f7a90a40dacbfb8728044bad50c9f71d44ba`,
    route => {
      if (route.request().method() !== "PATCH") {
        void route.fallback();
        return;
      }
      void route.fulfill({ status: 500 });
    },
  );

  await page.goto(
    `/seeds/127.0.0.1:8070/${rid}/issues/d316f7a90a40dacbfb8728044bad50c9f71d44ba`,
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

  await page.goto(`/seeds/127.0.0.1:8070/${rid}`);
  await page.getByRole("link", { name: "0 issues" }).click();
  await page.getByRole("link", { name: "New issue" }).click();
  await page.getByPlaceholder("Title").fill("This is a title");
  await page
    .getByPlaceholder("Write a description")
    .fill("This is a description");

  await page.getByPlaceholder("Add assignee").fill(authenticatedPeer.nodeId);
  await page.getByPlaceholder("Add assignee").press("Enter");

  await page.getByPlaceholder("Add tag").fill("bug");
  await page.getByPlaceholder("Add tag").press("Enter");
  await page.getByPlaceholder("Add tag").fill("documentation");
  await page.getByPlaceholder("Add tag").press("Enter");

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

  await page.getByRole("button", { name: "edit" }).first().click();
  await page.getByPlaceholder("Title").fill("This is a new title");
  await page.getByRole("button", { name: "save" }).click();
  await expect(page.getByText("This is a new title")).toBeVisible();

  await page.getByPlaceholder("Leave your comment").fill("This is a comment");
  await page.getByRole("button", { name: "Comment" }).click();
  await expect(page.getByText("This is a comment")).toBeVisible();

  await page.getByRole("button", { name: "reply" }).click();
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
