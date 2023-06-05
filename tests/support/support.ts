import type { Options } from "execa";
import * as Crypto from "node:crypto";

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
