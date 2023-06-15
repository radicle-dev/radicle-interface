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
