import type { FullConfig } from "@playwright/test";

import * as Fs from "node:fs/promises";
import * as FsSync from "node:fs";
import * as Path from "node:path";
import * as readline from "node:readline/promises";
import { execa } from "execa";

import {
  createCobsFixture,
  createMarkdownFixture,
  createSourceBrowsingFixture,
  gitOptions,
  startPalmHttpd,
  supportDir,
  tmpDir,
} from "@tests/support/fixtures.js";
import { createPeerManager } from "@tests/support/peerManager.js";

const workspacePaths = [Path.join(tmpDir, "peers"), Path.join(tmpDir, "repos")];

export default async function globalSetup(_config: FullConfig): Promise<void> {
  try {
    await assertRadInstalled();
  } catch (error) {
    console.error(error);
    console.log("");
    console.log("To download the required test binaries, run:");
    console.log(" 👉 ./scripts/install-binaries");
    console.log("");
    process.exit(1);
  }

  if (!process.env.SKIP_FIXTURE_CREATION) {
    console.log("Setting up global test environment");
    if (!process.env.CI) {
      await promptWorkspaceRemoval();
    }
    await removeWorkspace();

    // Workaround for fixing MaxListenersExceededWarning.
    // Since every prefixOutput stream adds stream listeners that don't autoClose.
    // TODO: We still seem to have some descriptors left open when running vitest, which we should handle.
    const peerManager = await createPeerManager({
      dataDir: Path.resolve(Path.join(tmpDir, "peers")),
      outputLog: FsSync.createWriteStream(
        Path.join(tmpDir, "peerManager.log"),
      ).setMaxListeners(20),
    });

    const palm = await peerManager.startPeer({
      name: "palm",
      gitOptions: gitOptions["alice"],
    });
    await palm.startHttpd(8080);
    await palm.startNode({ trackingPolicy: "track", trackingScope: "all" });

    console.log("Creating source-browsing fixture");
    await createSourceBrowsingFixture(peerManager, palm);
    console.log("Creating markdown fixture");
    await createMarkdownFixture(palm);
    console.log("Creating cobs fixture");
    await createCobsFixture(palm);
    console.log("Running tests");
  } else {
    await startPalmHttpd();
  }
}

// Assert that the `rad` CLI is installed and has the correct version.
async function assertRadInstalled(): Promise<void> {
  const versionConstraint = (
    await Fs.readFile(`${supportDir}/heartwood-version`, "utf8")
  ).substring(0, 7);
  const { stdout: version } = await execa("rad", ["--version"]);
  if (!version.includes(versionConstraint)) {
    throw new Error(
      `rad version ${version} does not satisfy ${versionConstraint}`,
    );
  }
}

async function promptWorkspaceRemoval(): Promise<void> {
  console.log("");
  console.log("This will irrevocably destroy the following directories:");
  console.log("");
  workspacePaths.forEach(path => console.log(path));
  console.log("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const result = await rl.question(
    "Are you sure you want to continue? [yes/no]: ",
  );
  rl.close();

  if (result.toLowerCase() === "yes") {
    console.log("Done");
    return;
  }

  console.log("Ok, I won't touch your data.");
  process.exit(1);
}

async function removeWorkspace(): Promise<void> {
  for (const path of workspacePaths) {
    await Fs.rm(path, {
      recursive: true,
      force: true,
    });
  }
}
