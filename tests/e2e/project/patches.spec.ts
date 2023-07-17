import { test, cobUrl, expect } from "@tests/support/fixtures.js";

test("navigate listing", async ({ page }) => {
  await page.goto(cobUrl);
  await page.getByRole("link", { name: "2 patches" }).click();
  await expect(page).toHaveURL(`${cobUrl}/patches`);

  await page.getByRole("link", { name: "1 merged" }).click();
  await expect(page).toHaveURL(`${cobUrl}/patches?state=merged`);
  await expect(
    page.locator(".comments").filter({ hasText: "5" }),
  ).toBeVisible();
});

test("navigate patch details", async ({ page }) => {
  await page.goto(`${cobUrl}/patches`);
  await page.getByText("Add subtitle to README").click();
  await expect(page).toHaveURL(
    `${cobUrl}/patches/013f8b2734df1840b2e33d52ff5632c8d66b199a`,
  );
  await page.getByRole("link", { name: "Add subtitle to README" }).click();
  await expect(page).toHaveURL(
    `${cobUrl}/commits/8c900d6cb38811e099efb3cbbdbfaba817bcf970`,
  );
  await page.goBack();
  {
    await page.getByRole("link", { name: "Commits" }).click();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/013f8b2734df1840b2e33d52ff5632c8d66b199a?tab=commits`,
    );
  }
  {
    await page.getByRole("link", { name: "Files" }).click();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/013f8b2734df1840b2e33d52ff5632c8d66b199a?tab=files`,
    );
  }
});

test("use revision selector", async ({ page }) => {
  await page.goto(`${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466`);
  await page.getByRole("link", { name: "Files" }).click();

  // Validating the latest revision state
  await expect(
    page.getByRole("cell", { name: "Had to push a new revision" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Commits" }).click();
  await expect(page.locator(".commit-list .teaser")).toHaveCount(2);
  await expect(
    page.locator(".commit-list .teaser .markdown").first(),
  ).toHaveText("Add more text");

  // Switching to the initial revision
  await page.getByText("Revision 779ce78").click();
  await expect(page.locator(".dropdown")).toBeVisible();
  await page.getByRole("link", { name: "Revision 0f3697f" }).click();
  await expect(page.locator(".dropdown")).toBeHidden();

  // Validating the initial revision
  await expect(page.locator(".commit-list .teaser")).toHaveCount(1);
  await expect(
    page.locator(".commit-list .teaser .markdown").first(),
  ).toHaveText("Rewrite subtitle to README");
  await page.getByRole("link", { name: "Files" }).click();
  await expect(
    page.getByRole("cell", { name: "Had to push a new revision" }),
  ).toBeHidden();

  await expect(page).toHaveURL(
    `${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466/0f3697fed2743549e3bf531e9fa81284a6de1466?tab=files`,
  );
});

test("navigate through revision diffs", async ({ page }) => {
  await page.goto(`${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466`);

  const firstRevision = page.locator(".revision").first();
  const secondRevision = page.locator(".revision").nth(1);

  // Second revision
  {
    await secondRevision.locator(".toggle").click();
    await secondRevision
      .getByRole("link", { name: "Compare to main (38c225e)" })
      .click();
    await expect(
      page.getByRole("link", { name: "Diff 38c225..9898da" }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec..9898da6155467adad511f63bf0fb5aa4156b92ef`,
    );
    await page.goBack();
    await secondRevision.locator(".toggle").click();
    await secondRevision
      .getByRole("link", { name: "Compare to previous revision (0f3697f)" })
      .click();
    await expect(
      page.getByRole("link", { name: "Diff 0dc373..9898da" }),
    ).toBeVisible();

    await expect(page).toHaveURL(
      `${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466?diff=0dc373db601ccbcffa80dec932e4006516709ca6..9898da6155467adad511f63bf0fb5aa4156b92ef`,
    );
    await page.goBack();

    await secondRevision
      .getByRole("link", { name: "Compare 0dc373d..9898da6" })
      .click();
    await expect(
      page.getByRole("link", { name: "Diff 0dc373..9898da" }),
    ).toBeVisible();
    await page.goBack();
  }
  // First revision
  {
    await firstRevision.locator(".toggle").click();
    await firstRevision
      .getByRole("link", { name: "Compare to main (38c225e)" })
      .click();
    await expect(
      page.getByRole("link", { name: "Diff 38c225..0dc373" }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec..0dc373db601ccbcffa80dec932e4006516709ca6`,
    );
  }
});
