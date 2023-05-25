import * as Crypto from "node:crypto";

// Generate string of 12 random characters with 8 bits of entropy.
export function randomTag(): string {
  return Crypto.randomBytes(8).toString("hex");
}
