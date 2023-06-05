import { test, cobUrl, expect } from "@tests/support/fixtures.js";

test("navigate listing", async ({ page }) => {
  await page.goto(cobUrl);
  await page.locator('role=link[name="2 patches"]').click();
  await expect(page).toHaveURL(`${cobUrl}/patches`);

  await page.locator('role=link[name="1 merged"]').click();
  await expect(page).toHaveURL(`${cobUrl}/patches?state=merged`);
});

test("navigate patch details", async ({ page }) => {
  await page.goto(`${cobUrl}/patches`);
  await page.locator("text=Add subtitle to README").click();
  await expect(page).toHaveURL(
    `${cobUrl}/patches/013f8b2734df1840b2e33d52ff5632c8d66b199a`,
  );
  await page.locator("role=link[name='Add subtitle to README']").click();
  await expect(page).toHaveURL(
    `${cobUrl}/commits/8c900d6cb38811e099efb3cbbdbfaba817bcf970`,
  );
  await page.goBack();
  {
    await page.locator("role=link[name='Commits']").click();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/013f8b2734df1840b2e33d52ff5632c8d66b199a?tab=commits`,
    );
  }
  {
    await page.locator("role=link[name='Files']").click();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/013f8b2734df1840b2e33d52ff5632c8d66b199a?tab=files`,
    );
  }
});

test("use revision selector", async ({ page }) => {
  await page.goto(`${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466`);
  await page.locator("role=link[name='Files']").click();
  await page.locator("text='Revision febcbbd'").click();
  await page.locator("role=link[name='Revision febcbbd']").click();

  await expect(page).toHaveURL(
    `${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466/febcbbd60c4977ac6a985f7589ec65bbae7f2d60?tab=files`,
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
      .locator("role=link[name='Compare to main (38c225e)']")
      .click();
    await expect(
      page.locator("role=link[name='Diff 38c225..5b35de']"),
    ).toBeVisible();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec..5b35def19c2c7f0c0f1b3fd12d0a7c5930ef6b09`,
    );
    await page.goBack();
    await secondRevision.locator(".toggle").click();
    await secondRevision
      .locator("role=link[name='Compare to previous revision (0f3697f)']")
      .click();
    await expect(
      page.locator("role=link[name='Diff 0dc373..5b35de']"),
    ).toBeVisible();

    await expect(page).toHaveURL(
      `${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466?diff=0dc373db601ccbcffa80dec932e4006516709ca6..5b35def19c2c7f0c0f1b3fd12d0a7c5930ef6b09`,
    );
    await page.goBack();

    await secondRevision
      .locator("role=link[name='Compare 0dc373d..5b35def']")
      .click();
    await page.goBack();
  }
  // First revision
  {
    await firstRevision.locator(".toggle").click();
    await firstRevision
      .locator("role=link[name='Compare to main (38c225e)']")
      .click();
    await expect(
      page.locator("role=link[name='Diff 38c225..0dc373']"),
    ).toBeVisible();
    await expect(page).toHaveURL(
      `${cobUrl}/patches/0f3697fed2743549e3bf531e9fa81284a6de1466?diff=38c225e2a0b47ba59def211f4e4825c31d9463ec..0dc373db601ccbcffa80dec932e4006516709ca6`,
    );
  }
});
