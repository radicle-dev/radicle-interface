import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createProject, expectReactionsToWork } from "@tests/support/project";

test("navigate single issue", async ({ page }) => {
  await page.goto(`${cobUrl}/issues`);
  await page.getByText("This title has markdown").click();

  await expect(page).toHaveURL(
    `${cobUrl}/issues/d72196335761c1d5fa7883f6620e7334b34e38f9`,
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
    `**/v1/projects/${rid}/issues/ecd5f103110b08b93bede17163d35de1e1068148`,
    route => {
      if (route.request().method() !== "PATCH") {
        void route.fallback();
        return;
      }
      void route.fulfill({ status: 500 });
    },
  );

  await page.goto(
    `${authenticatedPeer.uiUrl()}/${rid}/issues/ecd5f103110b08b93bede17163d35de1e1068148`,
  );

  await page.getByRole("button", { name: "Leave your comment" }).click();
  await page.getByPlaceholder("Leave your comment").fill("This is a comment");
  await page.getByRole("button", { name: "Comment" }).first().click();
  await expect(page.getByText("Comment creation failed")).toBeVisible();
});

test("edit title", async ({ page, authenticatedPeer }) => {
  await page.goto(authenticatedPeer.uiUrl());
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "edit-title",
  );
  await authenticatedPeer.rad(
    [
      "issue",
      "open",
      "--title",
      "This is an issue to edit its title",
      "--description",
      "We'll give it a title and edit it.",
    ],
    { cwd: projectFolder },
  );
  await page.goto(
    `${authenticatedPeer.uiUrl()}/${rid}/issues/616e240787b6527780636caae581ca9975060733`,
  );

  await expect(
    page.getByText("This is an issue to edit its title"),
  ).toBeVisible();
  await expect(page.getByPlaceholder("Title")).toBeHidden();

  await page.getByRole("button", { name: "edit title" }).click();
  await page
    .getByPlaceholder("Title")
    .fill("This is a modified issue title to be dismissed");
  await page.getByRole("button", { name: "dismiss changes" }).click();
  await expect(
    page.getByText("This is an issue to edit its title"),
  ).toBeVisible();

  await page.getByRole("button", { name: "edit title" }).click();
  await page.getByPlaceholder("Title").fill("This is a modified issue title");
  await page.getByRole("button", { name: "save title" }).click();
  await expect(page.getByRole("button", { name: "save title" })).toBeHidden();
  await page.reload();
  await expect(page.getByText("This is a modified issue title")).toBeVisible();
});

test("edit description", async ({ page, authenticatedPeer }) => {
  await page.goto(authenticatedPeer.uiUrl());
  const { rid, projectFolder } = await createProject(
    authenticatedPeer,
    "edit-description",
  );
  await authenticatedPeer.rad(
    [
      "issue",
      "open",
      "--title",
      "This is an issue to edit its description",
      "--description",
      "We'll give it a description and edit it.",
    ],
    { cwd: projectFolder },
  );
  await page.goto(
    `${authenticatedPeer.uiUrl()}/${rid}/issues/335e2823a71ac91203913a484dd771fd79f75139`,
  );

  await expect(
    page.getByText("We'll give it a description and edit it."),
  ).toBeVisible();
  await expect(page.getByPlaceholder("Leave a description")).toBeHidden();

  await page.getByRole("button", { name: "edit description" }).click();
  await page
    .getByPlaceholder("Leave a description")
    .fill("This is a modified issue description to be dismissed");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByText("We'll give it a description and edit it."),
  ).toBeVisible();

  await page.getByRole("button", { name: "edit description" }).click();
  await page
    .getByPlaceholder("Leave a description")
    .fill("This is a modified issue description");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeHidden();
  await page.reload();
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
  await page.goto(
    `${authenticatedPeer.uiUrl()}/${rid}/issues/cb5f9b2de24ecfdd293a607c96d78aacc911b589`,
  );
  await expectReactionsToWork(page);
});
