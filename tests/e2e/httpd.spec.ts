import { test, expect } from "@tests/support/fixtures.js";

test("change httpd port", async ({ page, peerManager }) => {
  const peer = await peerManager.startPeer({ name: "httpd" });

  await peer.startHttpd(8070);
  await peer.startNode();

  await page.goto("/");
  await page.getByRole("button", { name: "radicle.local" }).click();

  await page.locator('input[name="port"]').fill("8070");
  await page.locator('input[name="port"]').press("Enter");

  const { stdout } = await peer.rad([
    "web",
    "--frontend",
    "http://localhost:3000",
    "--backend",
    "http://127.0.0.1:8070",
  ]);
  const match = stdout.trim().match(/(http:\/\/localhost:3000\/.*)$/);
  if (!match) {
    throw Error("Not able to parse auth url");
  }
  await page.goto(match[0]);
  await expect(page.getByText("Authenticated")).toBeVisible();
  await expect(page).toHaveURL("/seeds/127.0.0.1:8070");
});
