import type { Options } from "execa";

import { execa } from "execa";
import * as Crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import * as Path from "node:path";
import * as Fs from "node:fs/promises";

// Generate string of 12 random characters with 8 bits of entropy.
export function randomTag(): string {
  return Crypto.randomBytes(8).toString("hex");
}

export function createOptions(projectFolder: string, days: number): Options {
  return {
    cwd: projectFolder,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    env: { RAD_LOCAL_TIME: (1671211684 + days * 86400).toString() },
  };
}

const filename = fileURLToPath(import.meta.url);
export const supportDir = Path.dirname(filename);
export const tmpDir = Path.resolve(supportDir, "..", "./tmp");
export const fixturesDir = Path.resolve(supportDir, "..", "./fixtures");
const workspacePaths = [Path.join(tmpDir, "peers"), Path.join(tmpDir, "repos")];

export const heartwoodRelease = await Fs.readFile(
  `${supportDir}/heartwood-release`,
  "utf8",
);

const binaryPath = Path.join(tmpDir, "bin", heartwoodRelease);
process.env.PATH = [binaryPath, process.env.PATH].join(Path.delimiter);

// Assert that the `rad` CLI is installed and has the correct version.
export async function assertRadInstalled(): Promise<void> {
  const { stdout: which } = await execa("which", ["rad"]);
  if (Path.dirname(which) !== binaryPath) {
    throw new Error(
      `rad path doesn't match used rad binary: ${binaryPath} !== ${which}`,
    );
  }
  const { stdout: version } = await execa("rad", ["--version"]);
  if (!version.includes(heartwoodRelease)) {
    throw new Error(
      `rad version ${version} does not satisfy ${heartwoodRelease}`,
    );
  }
}

export async function removeWorkspace(): Promise<void> {
  for (const path of workspacePaths) {
    await Fs.rm(path, {
      recursive: true,
      force: true,
    });
  }
}
