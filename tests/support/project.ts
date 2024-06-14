import type { Locator, Page } from "@playwright/test";
import type { RadiclePeer } from "@tests/support/peerManager";

import { expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import * as Path from "node:path";

export async function changeBranch(peer: string, branch: string, page: Page) {
  await page.getByTitle("Change branch").click();
  const peerLocator = page.getByLabel("peer-item").filter({ hasText: peer });
  await peerLocator.getByTitle("Expand peer").click();
  await page.getByRole("button", { name: branch }).click();
}

// Create a project using the rad CLI.
export async function createProject(
  peer: RadiclePeer,
  {
    name,
    description = "",
    defaultBranch = "main",
    visibility = "public",
  }: {
    name: string;
    description?: string;
    defaultBranch?: string;
    visibility?: "public" | "private";
  },
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
      `--${visibility}`,
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

export function extractPatchId(cmdOutput: { stderr: string }) {
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
  await expect(page.getByText("This is a comment")).toBeVisible();

  await page.getByRole("button", { name: "edit comment" }).first().click();
  await page
    .getByPlaceholder("Leave your comment")
    .fill("This is an edited comment");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByLabel("extended-textarea")).toBeHidden();
  await expect(page.getByText("This is an edited comment")).toBeVisible();

  await page.getByRole("button", { name: "Reply to comment" }).click();
  await page.getByPlaceholder("Reply to comment").fill("This is a reply");
  await page.getByRole("button", { name: "Comment", exact: true }).click();
  await expect(page.getByLabel("extended-textarea")).toBeHidden();
  await expect(page.getByText("This is a reply")).toBeVisible();

  await page.getByRole("button", { name: "edit comment" }).nth(1).click();
  await page
    .getByPlaceholder("Leave your comment")
    .fill("This is an edited reply");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByLabel("extended-textarea")).toBeHidden();
  await expect(page.getByText("This is an edited reply")).toBeVisible();
}

export async function expectLabelEditingToWork(page: Page) {
  await page.getByRole("button", { name: "add labels" }).click();
  await page.getByPlaceholder("Add label").fill("bug");
  await page.getByRole("button", { name: "discard label" }).click();

  await page.getByRole("button", { name: "add labels" }).click();
  await page.getByPlaceholder("Add label").fill("bug");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "add labels" }).click();
  await page.getByPlaceholder("Add label").fill("bug");
  await expect(page.getByText("This label is already added")).toBeVisible();
  await page.getByPlaceholder("Add label").clear();
  await expect(page.getByText("This label is already added")).toBeHidden();

  await page.getByPlaceholder("Add label").fill("documentation");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "bug" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "documentation" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "documentation" }).click();
  await page.getByRole("button", { name: "remove label", exact: true }).click();
  await expect(page.getByRole("button", { name: "bug" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "documentation" }),
  ).toBeHidden();
}

export async function expectReactionsToWork(
  page: Page,
  reactionsLocator: Locator,
) {
  await page.getByRole("button", { name: "Leave your comment" }).click();
  await page.getByPlaceholder("Leave your comment").fill("This is a comment");
  await page.getByRole("button", { name: "Comment" }).click();
  const reactionsToggleBtn = reactionsLocator.getByRole("button", {
    name: "toggle-reaction-popover",
  });
  await reactionsToggleBtn.click();
  await reactionsLocator.getByRole("button", { name: "👍" }).click();
  await expect(
    reactionsLocator.getByRole("button", { name: "👍 1" }),
  ).toBeVisible();

  await reactionsToggleBtn.click();
  await reactionsLocator.getByRole("button", { name: "🎉" }).click();
  await expect(
    reactionsLocator.getByRole("button", { name: "🎉 1" }),
  ).toBeVisible();
  await expect(reactionsLocator.locator(".reaction")).toHaveCount(2);

  await reactionsLocator.getByRole("button", { name: "👍" }).click();
  await expect(
    reactionsLocator.locator("span").filter({ hasText: "👍 1" }),
  ).toBeHidden();
  await expect(reactionsLocator.locator(".reaction")).toHaveCount(1);

  await reactionsToggleBtn.click();
  await reactionsLocator
    .getByRole("button", { name: "🎉", exact: true })
    .click();
  await expect(
    reactionsLocator.getByRole("button", { name: "🎉 1" }),
  ).toBeHidden();
  await expect(reactionsLocator.locator(".reaction")).toHaveCount(0);
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
