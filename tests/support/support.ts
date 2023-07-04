import type { Options } from "execa";

import { execa } from "execa";
import * as Crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import * as Path from "node:path";
import * as Fs from "node:fs/promises";
import * as readline from "node:readline/promises";

// Generate string of 12 random characters with 8 bits of entropy.
export function randomTag(): string {
  return Crypto.randomBytes(8).toString("hex");
}

export function createOptions(projectFolder: string, days: number): Options {
  return {
    cwd: projectFolder,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    env: { RAD_COMMIT_TIME: (1671211684 + days * 86400).toString() },
  };
}

const filename = fileURLToPath(import.meta.url);
export const supportDir = Path.dirname(filename);
export const tmpDir = Path.resolve(supportDir, "..", "./tmp");
export const fixturesDir = Path.resolve(supportDir, "..", "./fixtures");
const workspacePaths = [Path.join(tmpDir, "peers"), Path.join(tmpDir, "repos")];

export const heartwoodShortSha = (
  await Fs.readFile(`${supportDir}/heartwood-version`, "utf8")
).substring(0, 7);

process.env.PATH = [
  Path.join(tmpDir, "bin", heartwoodShortSha),
  process.env.PATH,
].join(Path.delimiter);

// Assert that the `rad` CLI is installed and has the correct version.
export async function assertRadInstalled(): Promise<void> {
  const { stdout: version } = await execa("rad", ["--version"]);
  if (!version.includes(heartwoodShortSha)) {
    throw new Error(
      `rad version ${version} does not satisfy ${heartwoodShortSha}`,
    );
  }
}

export async function promptWorkspaceRemoval(): Promise<void> {
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

export async function removeWorkspace(): Promise<void> {
  for (const path of workspacePaths) {
    await Fs.rm(path, {
      recursive: true,
      force: true,
    });
  }
}
