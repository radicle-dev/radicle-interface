import type { BaseUrl } from "@httpd-client";

import md5 from "md5";
import bs58 from "bs58";
import twemojiModule from "twemoji";

import { base } from "@app/lib/router";

export async function toClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function getRawBasePath(
  id: string,
  baseUrl: BaseUrl,
  commit: string,
): string {
  return `${baseUrl.scheme}://${baseUrl.hostname}:${baseUrl.port}/raw/${id}/${commit}`;
}

export function formatLocationHash(hash: string | null): number | null {
  if (hash && hash.match(/^#L[0-9]+$/)) return parseInt(hash.slice(2));
  return null;
}

export function parseNodeId(
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

export function parseRepositoryId(
  rid: string,
): { prefix: string; pubkey: string } | undefined {
  const match = /^(rad:)?(z[a-zA-Z0-9]+)$/.exec(rid);
  if (match) {
    const hex = bs58.decode(match[2].substring(1));
    if (hex.byteLength !== 20) {
      return undefined;
    }

    return { prefix: match[1] || "rad:", pubkey: match[2] };
  }

  return undefined;
}

export function isNodeId(input: string): boolean {
  return Boolean(parseNodeId(input));
}

export function isRepositoryId(input: string): boolean {
  return Boolean(parseRepositoryId(input));
}

export function formatNodeId(id: string): string {
  const parsedId = parseNodeId(id);

  if (parsedId) {
    return `${parsedId.prefix}${truncateId(parsedId.pubkey)}`;
  }

  return id;
}

export function formatRepositoryId(id: string): string {
  const parsedId = parseRepositoryId(id);

  if (parsedId) {
    return `${parsedId.prefix}${truncateId(parsedId.pubkey)}`;
  }

  return id;
}

export function truncateId(pubkey: string): string {
  return `${pubkey.substring(0, 6)}…${pubkey.slice(-6)}`;
}

export function formatCommit(oid: string): string {
  return oid.substring(0, 7);
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

// Check whether the input is a URL.
export function isUrl(input: string): boolean {
  return /^https?:\/\//.test(input);
}

export function isFulfilled<T>(
  input: PromiseSettledResult<T>,
): input is PromiseFulfilledResult<T> {
  return input.status === "fulfilled";
}

// Get amount of days passed between two dates without including the end date
export function getDaysPassed(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

export function scrollIntoView(id: string, options?: ScrollIntoViewOptions) {
  const lineElement = document.getElementById(id);
  if (lineElement) lineElement.scrollIntoView(options);
}

export function isMac() {
  // Precaution in case navigator.platform is not available.
  if (navigator.platform) {
    return navigator.platform.includes("Mac");
  } else {
    return false;
  }
}

// Check whether the given path has a markdown file extension.
export function isMarkdownPath(path: string): boolean {
  return /\.(md|mkd|markdown)$/i.test(path);
}

// Check whether the given input string is a domain, eg. seed.radicle.xyz.
// Also accepts in dev env 0.0.0.0 as domain.
export function isDomain(input: string): boolean {
  return (
    (/^[a-z][a-z0-9.-]+$/.test(input) && /\.[a-z]+$/.test(input)) ||
    (!import.meta.env.PROD && isLocal(input))
  );
}

// Check whether the given address is a localhost address.
export function isLocal(addr: string): boolean {
  return (
    addr.startsWith("127.0.0.1") ||
    addr.startsWith("0.0.0.0") ||
    addr.startsWith("radicle.local")
  );
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

export function createAddRemoveArrays(
  currentArray: string[],
  newArray: string[],
): { add: string[]; remove: string[] } {
  return {
    add: newArray.filter(item => !currentArray.includes(item)),
    remove: currentArray.filter(item => !newArray.includes(item)),
  };
}

// Formats COBs Object Ids
export function formatObjectId(id: string): string {
  return id.substring(0, 7);
}

export function stripDidPrefix(array: string[]): string[] {
  return array.map(id => id.replace("did:key:", ""));
}
