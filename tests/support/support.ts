import type { Options } from "execa";
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
    env: { RAD_COMMIT_TIME: (1671211684 + days * 86400).toString() },
  };
}

const filename = fileURLToPath(import.meta.url);
export const supportDir = Path.dirname(filename);
export const tmpDir = Path.resolve(supportDir, "..", "./tmp");
export const fixturesDir = Path.resolve(supportDir, "..", "./fixtures");

export const heartwoodShortSha = (
  await Fs.readFile(`${supportDir}/heartwood-version`, "utf8")
).substring(0, 7);

process.env.PATH = [
  Path.join(tmpDir, "bin", heartwoodShortSha),
  process.env.PATH,
].join(Path.delimiter);
