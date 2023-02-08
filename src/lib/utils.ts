import md5 from "md5";
import bs58 from "bs58";
import twemojiModule from "twemoji";

import { assert } from "@app/lib/error";
import { base } from "@app/lib/router";
import { config } from "@app/lib/config";

export async function toClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function setOpenGraphMetaTag(
  data: { prop: string; content: string; attr?: string }[],
): void {
  const elements = Array.from<HTMLElement>(document.querySelectorAll(`meta`));
  elements.forEach((element: any) => {
    const foundElement = data.find(data => {
      return data.prop === element.getAttribute(data.attr || "property");
    });
    if (foundElement) element.content = foundElement.content;
  });
}

export function formatSeedAddress(
  id: string,
  host: string,
  port: number,
): string {
  return `${id}@${host}:${port}`;
}

export function formatSeedHost(host: string): string {
  if (isLocal(host)) {
    return "radicle.local";
  } else {
    return host;
  }
}

export function formatLocationHash(hash: string | null): number | null {
  if (hash && hash.match(/^#L[0-9]+$/)) return parseInt(hash.slice(2));
  return null;
}

export function formatSeedId(id: string): string {
  return id.substring(0, 6) + "…" + id.substring(id.length - 6, id.length);
}

export function formatRadicleId(id: string): string {
  assert(isRadicleId(id));

  if (window.HEARTWOOD) {
    return id.substring(0, 10) + "…" + id.substring(id.length - 6, id.length);
  } else {
    return id.substring(0, 14) + "…" + id.substring(id.length - 6, id.length);
  }
}

// Parses a NID into an object of prefix and pubkey,
// since prefix can be undefined
export function parseNid(
  nid: string,
): { prefix: string; pubkey: string } | undefined {
  const match = /^(did:key:)?(z[a-zA-Z0-9]+)$/.exec(nid);
  if (match) {
    const hex = bs58.decode(match[2].substring(1));
    // This checks also that the first 2 bytes are equal
    // to the ed25519 public key type used.
    if (!(hex.byteLength === 34 && hex[0] === 0xed && hex[1] === 1)) {
      return undefined;
    }

    return { prefix: match[1] || "did:key:", pubkey: match[2] };
  }

  return undefined;
}

// Format a Node Identifier (NID), also represents users or peers
export function formatNodeId(nid: string): string {
  const parsedNid = parseNid(nid);
  if (parsedNid) {
    const { prefix, pubkey } = parsedNid;
    const formattedPubKey =
      pubkey.substring(0, 6) +
      "…" +
      pubkey.substring(pubkey.length - 6, pubkey.length);
    return `${prefix}${formattedPubKey}`;
  }

  return nid;
}

export function formatCommit(oid: string): string {
  return oid.substring(0, 7);
}

export function capitalize(s: string): string {
  if (s === "") return s;
  return s[0].toUpperCase() + s.substring(1);
}

// Get the mime type of an image, given a file path.
// Returns `null` if unknown.
export function getImageMime(path: string): string | null {
  const mimes: Record<string, string> = {
    apng: "image/apng",
    png: "image/png",
    svg: "image/svg+xml",
    gif: "image/gif",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    webp: "image/webp",
  };
  const ext = path.split(".").pop();

  if (ext) {
    if (mimes[ext]) {
      return mimes[ext];
    }
  }
  return null;
}

// Takes a path, eg. "../images/image.png", and a base from where to start resolving, e.g. "static/images/index.html".
// Returns the resolved path.
export function canonicalize(
  path: string,
  base: string,
  origin = document.location.origin,
): string {
  path = path.replace(/^\//, ""); // Remove leading slash
  const finalPath = base
    .split("/")
    .slice(0, -1) // Remove file name.
    .concat([path]) // Add image file path.
    .join("/");

  // URL is used to resolve relative paths, eg. `../../assets/image.png`.
  const url = new URL(finalPath, origin);
  const pathname = url.pathname.replace(/^\//, "");

  return pathname;
}

// Takes a URL, eg. "https://twitter.com/cloudhead", and return "cloudhead".
// Returns the original string if it was unable to extract the username.
export function parseUsername(input: string): string {
  const parts = input.split("/");
  return parts[parts.length - 1];
}

export const formatTimestamp = (
  timestamp: number,
  current = new Date().getTime(),
): string => {
  const units: Record<string, number> = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000,
  };

  // Multiplying timestamp with 1000 to convert from seconds to milliseconds
  timestamp = timestamp * 1000;
  const rtf = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
    style: "long",
  });
  const elapsed = current - timestamp;

  if (elapsed > units["year"]) {
    return new Date(timestamp).toUTCString(); // If it's more than a year we return early showing a Datetime string
  } else if (elapsed < 0) {
    return "now"; // If elapsed is a negative number we are dealing with an item from the future, and we return "now"
  }

  for (const u in units) {
    if (elapsed > units[u] || u === "second") {
      // We convert the division result to a negative number to get "XX [unit] ago"
      return rtf.format(
        Math.round(elapsed / units[u]) * -1,
        u as Intl.RelativeTimeFormatUnit,
      );
    }
  }

  return new Date(timestamp).toUTCString();
};

// Check whether the input is a Radicle ID.
export function isRadicleId(input: string): boolean {
  if (window.HEARTWOOD) {
    return /^(did:key:)?[a-zA-Z0-9]+$/.test(input);
  } else {
    return /^rad:[a-z]+:[a-zA-Z0-9]+$/.test(input);
  }
}

// Check whether the input is a Radicle Peer ID.
export function isPeerId(input: string): boolean {
  return /^h[a-zA-Z0-9]+$/.test(input);
}

// Check whether the input is a SHA1 commit.
export function isOid(input: string): boolean {
  return /^[a-fA-F0-9]{40}$/.test(input);
}

// Check whether the input is a URL.
export function isUrl(input: string): boolean {
  return /^https?:\/\//.test(input);
}

export function isFulfilled<T>(
  input: PromiseSettledResult<T>,
): input is PromiseFulfilledResult<T> {
  return input.status === "fulfilled";
}

// Parse a Radicle Id.
export function parseRadicleId(id: string): string {
  if (window.HEARTWOOD) {
    return id.replace(/^rad:/, "");
  } else {
    return id.replace(/^rad:[a-z]+:/, "");
  }
}

// Get amount of days passed between two dates without including the end date
export function getDaysPassed(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

export function scrollIntoView(id: string) {
  const lineElement = document.getElementById(id);
  if (lineElement) lineElement.scrollIntoView();
}

export function getSeedEmoji(seedHost: string): string {
  const seed = config.seeds.pinned.find(s => s.host === seedHost);

  if (seed) {
    return seed.emoji;
  } else if (isLocal(seedHost)) {
    return "🏠";
  } else {
    return "🌱";
  }
}

// Check whether the given path has a markdown file extension.
export function isMarkdownPath(path: string): boolean {
  return /\.(md|mkd|markdown)$/i.test(path);
}

// Check whether the given input string is a domain, eg. `alt-clients.radicle.xyz.
// Also accepts in dev env 0.0.0.0 as domain
export function isDomain(input: string): boolean {
  return (
    (/^[a-z][a-z0-9.-]+$/.test(input) && /\.[a-z]+$/.test(input)) ||
    (!import.meta.env.PROD && isLocal(input))
  );
}

// Check whether the given address is a local host address.
export function isLocal(addr: string): boolean {
  return addr === "127.0.0.1" || addr === "0.0.0.0";
}

// Get the gravatar URL of an email.
export function gravatarURL(email: string): string {
  const address = email.trim().toLowerCase();
  const hash = md5(address);

  return `https://www.gravatar.com/avatar/${hash}`;
}

export const unreachable = (value: never): never => {
  throw new Error(`Unreachable code: ${value}`);
};

export function twemoji(
  node: HTMLElement,
  { exclude }: { exclude: string[] } = { exclude: [] },
) {
  twemojiModule.parse(node, {
    callback: (icon, options: Record<string, any>) => {
      return exclude.includes(icon)
        ? false
        : "".concat(options.base, options.size, "/", icon, options.ext);
    },
    base,
    folder: "twemoji",
    ext: ".svg",
    className: `txt-emoji`,
  });
}
