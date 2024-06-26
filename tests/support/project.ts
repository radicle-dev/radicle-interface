import type { Page } from "@playwright/test";
import type { RadiclePeer } from "@tests/support/peerManager";

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
