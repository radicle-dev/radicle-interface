import type { RadiclePeer } from "@tests/support/peerManager";

import * as Path from "node:path";

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
