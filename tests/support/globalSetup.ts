import type { FullConfig } from "@playwright/test";

import * as Fs from "node:fs/promises";
import * as Path from "node:path";
import * as readline from "node:readline/promises";
import { execa } from "execa";

import {
  createSeedFixture,
  supportDir,
  startPalmHttpd,
  tmpDir,
} from "./fixtures.js";

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

    console.log("Creating seed fixture");
    await createSeedFixture();
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
