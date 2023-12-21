import { test, expect } from "@tests/support/fixtures.js";
import { createProject } from "@tests/support/project";

test("add and remove assignees", async ({ page, authenticatedPeer }) => {
  await page.goto(authenticatedPeer.uiUrl());
  const { rid, projectFolder } = await createProject(authenticatedPeer, {
    name: "handle-assignees",
  });
  await authenticatedPeer.rad(
    [
      "issue",
      "open",
      "--title",
      "This is an issue to test assignee handling",
      "--description",
      "We'll add and remove assignees to them",
    ],
    { cwd: projectFolder },
  );
  await page.goto(`${authenticatedPeer.uiUrl()}/${rid}/issues`);
  await page
    .getByRole("link", {
      name: "This is an issue to test assignee handling",
    })
    .click();

  await page.getByRole("button", { name: "add assignee" }).click();
  await page
    .getByPlaceholder("Add assignee")
    .fill("z6MktULudTtAsAhRegYPiZ6631RV3viv12qd4GQF8z1xB22S");
  await page.getByRole("button", { name: "discard assignee" }).click();

  await page.getByRole("button", { name: "add assignee" }).click();
  await page
    .getByPlaceholder("Add assignee")
    .fill("z6MktULudTtAsAhRegYPiZ6631RV3viv12qd4GQF8z1xB22S");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "add assignee" }).click();
  await page
    .getByPlaceholder("Add assignee")
    .fill("z6MktULudTtAsAhRegYPiZ6631RV3viv12qd4GQF8z1xB22S");
  await expect(page.getByText("This assignee is already added")).toBeVisible();
  await page.getByPlaceholder("Add assignee").clear();
  await expect(page.getByText("This assignee is already added")).toBeHidden();

  await page
    .getByPlaceholder("Add assignee")
    .fill("z6MkkfM3tPXNPrPevKr3uSiQtHPuwnNhu2yUVjgd2jXVsVz5");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "avatar did:key:z6MktU…1xB22S" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "avatar did:key:z6Mkkf…XVsVz5" }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "avatar did:key:z6MktU…1xB22S" })
    .click();
  await page
    .getByRole("button", { name: "remove assignee", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "avatar did:key:z6Mkkf…XVsVz5" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "avatar did:key:z6MktU…1xB22S" }),
  ).toBeHidden();
});
