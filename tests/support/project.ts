import type { Page } from "@playwright/test";
import type { RadiclePeer } from "@tests/support/peerManager";
import type { ExecaReturnValue } from "execa";

import * as Path from "node:path";
import { expect } from "@playwright/test";
import { readFileSync } from "node:fs";

// Create a project using the rad CLI.
export async function createProject(
  peer: RadiclePeer,
  name: string,
  description = "",
  defaultBranch = "main",
): Promise<{ rid: string; projectFolder: string; defaultBranch: string }> {
  const projectFolder = Path.join(peer.checkoutPath, name);

  await peer.git(["init", name, "--initial-branch", defaultBranch], {
    cwd: peer.checkoutPath,
  });
  await peer.git(["commit", "--allow-empty", "--message", "initial commit"], {
    cwd: projectFolder,
  });
  await peer.rad(
    [
      "init",
      "--name",
      name,
      "--default-branch",
      defaultBranch,
      "--description",
      description,
      "--public",
    ],
    {
      cwd: projectFolder,
    },
  );

  const { stdout: rid } = await peer.rad(["inspect"], {
    cwd: projectFolder,
  });

  return { rid, projectFolder, defaultBranch };
}

export function extractPatchId(cmdOutput: ExecaReturnValue<string>) {
  const match = cmdOutput.stderr.match(/[0-9a-f]{40}/);
  if (match) {
    return match[0];
  } else {
    throw new Error("Could not get patch id");
  }
}

export async function expectThreadCommentingToWork(page: Page) {
  await page.getByRole("button", { name: "Leave your comment" }).click();
  await page.getByPlaceholder("Leave your comment").fill("This is a comment");
  await page.getByRole("button", { name: "Comment" }).click();
  await expect(page.getByLabel("extended-textarea")).toBeHidden();
  await page.reload();
  await expect(page.getByText("This is a comment")).toBeVisible();

  await page.getByRole("button", { name: "edit comment" }).first().click();
  await page
    .getByPlaceholder("Leave your comment")
    .fill("This is an edited comment");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByLabel("extended-textarea")).toBeHidden();
  await page.reload();
  await expect(page.getByText("This is an edited comment")).toBeVisible();

  await page.getByRole("button", { name: "Reply to comment" }).click();
  await page.getByPlaceholder("Reply to comment").fill("This is a reply");
  await page.getByRole("button", { name: "Comment", exact: true }).click();
  await expect(page.getByLabel("extended-textarea")).toBeHidden();
  await page.reload();
  await expect(page.getByText("This is a reply")).toBeVisible();

  await page.getByRole("button", { name: "edit comment" }).nth(1).click();
  await page
    .getByPlaceholder("Leave your comment")
    .fill("This is an edited reply");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByLabel("extended-textarea")).toBeHidden();
  await page.reload();
  await expect(page.getByText("This is an edited reply")).toBeVisible();
}

export async function expectLabelEditingToWork(page: Page) {
  await expect(page.getByText("No labels")).toBeVisible();

  await page.getByRole("button", { name: "edit labels" }).click();
  await page.getByPlaceholder("Add label").fill("bug");
  await page.getByRole("button", { name: "dismiss changes" }).click();
  await expect(page.getByText("No labels")).toBeVisible();
  await page.getByRole("button", { name: "edit labels" }).click();
  await expect(page.getByPlaceholder("Add label")).toHaveValue("");

  await page.getByPlaceholder("Add label").fill("bug");
  await page.keyboard.press("Enter");
  await page.getByPlaceholder("Add label").fill("bug");
  await expect(page.getByText("This label is already added")).toBeVisible();
  await page.getByPlaceholder("Add label").clear();
  await expect(page.getByText("This label is already added")).toBeHidden();

  await page.getByPlaceholder("Add label").fill("documentation");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "save labels" }).click();
  await expect(page.getByRole("button", { name: "save labels" })).toBeHidden();
  await page.reload();
  await expect(page.getByRole("button", { name: "bug" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "documentation" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "edit labels" }).click();
  await page
    .locator("span")
    .filter({ hasText: "documentation" })
    .getByTitle("remove label")
    .click();
  await page.getByRole("button", { name: "save labels" }).click();
  await expect(page.getByRole("button", { name: "save labels" })).toBeHidden();
  await page.reload();
  await expect(page.getByRole("button", { name: "bug" })).toBeVisible();
}

export async function expectReactionsToWork(page: Page) {
  await page.getByRole("button", { name: "Leave your comment" }).click();
  await page.getByPlaceholder("Leave your comment").fill("This is a comment");
  await page.getByRole("button", { name: "Comment" }).click();
  const commentReactionToggle = page.getByTitle("toggle-reaction").first();
  await commentReactionToggle.click();
  await page.getByRole("button", { name: "👍" }).click();
  await expect(page.getByRole("button", { name: "👍 1" })).toBeVisible();

  await commentReactionToggle.click();
  await page.getByRole("button", { name: "🎉" }).click();
  await expect(page.getByRole("button", { name: "🎉 1" })).toBeVisible();
  await expect(page.locator(".reaction")).toHaveCount(2);

  await page.getByRole("button", { name: "👍" }).click();
  await expect(page.locator("span").filter({ hasText: "👍 1" })).toBeHidden();
  await expect(page.locator(".reaction")).toHaveCount(1);

  await commentReactionToggle.click();
  await page.getByRole("button", { name: "🎉" }).first().click();
  await expect(page.getByRole("button", { name: "🎉 1" })).toBeHidden();
  await expect(page.locator(".reaction")).toHaveCount(0);
}

export async function addEmbed(
  page: Page,
  url: string,
  fileName: string,
  fileType: string,
) {
  const buffer = readFileSync(url).toString("base64");
  const dataTransfer = await page.evaluateHandle(
    ({ buffer, localFileName, localFileType }) => {
      const arrayBuffer = Uint8Array.from(atob(buffer), c => c.charCodeAt(0));
      const dt = new DataTransfer();
      const file = new File([arrayBuffer.buffer], localFileName, {
        type: localFileType,
      });
      dt.items.add(file);
      return dt;
    },
    {
      buffer,
      localFileName: fileName,
      localFileType: fileType,
    },
  );
  await page.dispatchEvent("textarea[aria-label=textarea-comment]", "drop", {
    dataTransfer,
  });
}
