import * as FsSync from "node:fs";
import * as Path from "node:path";
import {
  assertRadInstalled,
  promptWorkspaceRemoval,
  removeWorkspace,
  tmpDir,
} from "@tests/support/support.js";
import {
  createCobsFixture,
  createMarkdownFixture,
  createSourceBrowsingFixture,
  defaultHttpdPort,
  gitOptions,
  startPalmHttpd,
} from "@tests/support/fixtures.js";
import { createPeerManager } from "@tests/support/peerManager.js";
import { killAllProcesses } from "@tests/support/process.js";

export default async function globalSetup(): Promise<() => void> {
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
      ).setMaxListeners(16),
    });

    const palm = await peerManager.startPeer({
      name: "palm",
      gitOptions: gitOptions["alice"],
    });
    await palm.startHttpd(defaultHttpdPort);
    await palm.startNode({ policy: "track", scope: "all", alias: "palm" });

    try {
      await createSourceBrowsingFixture(peerManager, palm);
      console.log("Creating source-browsing fixture");
      await createMarkdownFixture(palm);
      console.log("Creating markdown fixture");
      await createCobsFixture(palm);
      console.log("Creating cobs fixture");
    } catch (error) {
      console.log("");
      console.log("Not able to create the required fixtures.");
      console.log("Make sure you are not using binaries compiled for release.");
      console.log("");
      console.log(error);
      console.log("");
      process.exit(1);
    }
    console.log("Running tests");
    await palm.stopNode();
  } else {
    await startPalmHttpd(defaultHttpdPort);
  }

  return () => killAllProcesses();
}
