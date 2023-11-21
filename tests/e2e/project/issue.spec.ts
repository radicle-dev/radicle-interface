import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createProject, expectReactionsToWork } from "@tests/support/project";

test("navigate single issue", async ({ page }) => {
  await page.goto(`${cobUrl}/issues`);
  await page.getByText("This title has markdown").click();

  await expect(page).toHaveURL(/\/issues\/[0-9a-f]{40}/);
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

  await page.route(`**/v1/projects/${rid}/issues/*`, async route => {
    if (route.request().method() === "PATCH") {
      return route.fulfill({ status: 500 });
    } else {
      return route.fallback();
    }
  });

  await page.goto(`${authenticatedPeer.uiUrl()}/${rid}/issues`);
  await page.getByRole("link", { name: "This issue is going to fail" }).click();
  await page.getByRole("button", { name: "Leave your comment" }).click();
  await page.getByPlaceholder("Leave your comment").fill("This is a comment");
  await page.getByRole("button", { name: "Comment" }).first().click();
  await expect(page.getByText("Comment creation failed")).toBeVisible();
});

test("edit issue", async ({ page, authenticatedPeer }) => {
  await page.goto(authenticatedPeer.uiUrl());
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "edit-issue",
  );
  await authenticatedPeer.rad(
    [
      "issue",
      "open",
      "--title",
      "This is an issue to edit its title",
      "--description",
      "We'll give it a description and edit it.",
    ],
    { cwd: projectFolder },
  );
  await page.goto(`${authenticatedPeer.uiUrl()}/${rid}/issues`);
  await page
    .getByRole("link", { name: "This is an issue to edit its title" })
    .click();

  await expect(
    page.getByText("This is an issue to edit its title"),
  ).toBeVisible();
  await expect(page.getByPlaceholder("Title")).toBeHidden();
  await expect(
    page.getByText("We'll give it a description and edit it."),
  ).toBeVisible();
  await expect(page.getByPlaceholder("Leave a description")).toBeHidden();

  await page.getByRole("button", { name: "edit issue" }).click();
  await page
    .getByPlaceholder("Title")
    .fill("This is a modified issue title to be dismissed");
  await page
    .getByPlaceholder("Leave a description")
    .fill("This is a modified issue description to be dismissed");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByText("This is an issue to edit its title"),
  ).toBeVisible();
  await expect(
    page.getByText("We'll give it a description and edit it."),
  ).toBeVisible();

  await page.getByRole("button", { name: "edit issue" }).click();
  await page.getByPlaceholder("Title").fill("This is a modified issue title");
  await page
    .getByPlaceholder("Leave a description")
    .fill("This is a modified issue description");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeHidden();
  await expect(page.getByText("This is a modified issue title")).toBeVisible();
  await expect(
    page.getByText("This is a modified issue description"),
  ).toBeVisible();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByText("This is a modified issue title")).toBeVisible();
  await expect(
    page.getByText("This is a modified issue description"),
  ).toBeVisible();
});

test("add and remove reactions", async ({ page, authenticatedPeer }) => {
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
      "We'll add and remove reactions to them",
    ],
    { cwd: projectFolder },
  );
  await page.goto(`${authenticatedPeer.uiUrl()}/${rid}/issues`);
  await page
    .getByRole("link", { name: "This is an issue to test reactions" })
    .click();
  await expectReactionsToWork(page);
});
