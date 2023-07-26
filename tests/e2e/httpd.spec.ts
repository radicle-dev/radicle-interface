import { expect, test } from "@tests/support/fixtures.js";

test("rad web command reacts to port change", async ({ page, peerManager }) => {
  const peer = await peerManager.startPeer({
    name: "port-test",
  });
  await peer.startHttpd(8090);

  await page.goto("/");
  await page.getByRole("button", { name: "radicle.local" }).click();

  await expect(
    page.getByText(
      "rad web --frontend http://localhost:3001 --backend http://127.0.0.1:8081",
    ),
  ).toBeVisible();
  await page.locator('input[name="port"]').fill("8090");
  await page.locator('input[name="port"]').press("Enter");

  await expect(
    page.getByText(
      "rad web --frontend http://localhost:3001 --backend http://127.0.0.1:8090",
    ),
  ).toBeVisible();

  await peer.stopHttpd();
});
