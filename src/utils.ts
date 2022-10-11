import { ethers } from "ethers";
import type { RouteLocation } from "@app/index";
import md5 from "md5";
import { BigNumber } from "ethers";
import katex from "katex";
import type { Config } from "@app/config";
import { assert } from "@app/error";
import type { EnsProfile } from "@app/base/registrations/registrar";
import { getAddress, getResolver } from "@app/base/registrations/registrar";
import {
  getAvatar,
  getSeed,
  getRegistration,
} from "@app/base/registrations/registrar";
import { ProfileType } from "@app/profile";
import { parseUnits } from "@ethersproject/units";
import * as cache from "@app/cache";
import type { marked } from "marked";
import emojis from "@app/emojis";

export enum AddressType {
  Contract,
  Org,
  Safe,
  EOA,
}

export interface Safe {
  address: string;
  owners: string[];
  threshold: number;
}

export interface Token {
  name: string;
  symbol: string;
  logo: string;
  decimals: number;
  balance: BigNumber;
}

export enum Status {
  Signing,
  Pending,
  Success,
  Failed,
}

export type State =
  | { status: Status.Signing }
  | { status: Status.Pending }
  | { status: Status.Success }
  | { status: Status.Failed; error: string };

export async function isReverseRecordSet(
  address: string,
  domain: string,
  config: Config,
): Promise<boolean> {
  const name = await lookupAddress(address, config);
  return name === domain;
}

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

export function toWei(amount: string): BigNumber {
  return parseUnits(amount);
}

export function isAddressEqual(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
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

export function formatRadicleUrn(id: string): string {
  assert(isRadicleId(id));

  return id.substring(0, 14) + "…" + id.substring(id.length - 6, id.length);
}

export function formatBalance(n: BigNumber, decimals?: number): string {
  return ethers.utils.commify(
    parseFloat(ethers.utils.formatUnits(n, decimals)).toFixed(2),
  );
}

// Returns a checksummed, shortened, without 0x prefix Ethereum address
export function formatAddress(input: string): string {
  const addr = ethers.utils.getAddress(input).replace(/^0x/, "");

  return (
    addr.substring(0, 4) + " – " + addr.substring(addr.length - 4, addr.length)
  );
}

export function formatCommit(oid: string): string {
  return oid.substring(0, 7);
}

export function formatProfile(input: string, config: Config): string {
  if (isAddress(input)) {
    return ethers.utils.getAddress(input);
  } else {
    return parseEnsLabel(input, config);
  }
}

export function capitalize(s: string): string {
  if (s === "") return s;
  return s[0].toUpperCase() + s.substring(1);
}

// Takes a domain name, eg. 'cloudhead.radicle.eth' and returns the label, eg. 'cloudhead'.
export function parseEnsLabel(name: string, config: Config): string {
  const domain = config.registrar.domain.replace(".", "\\.");
  const label = name.replace(new RegExp(`\\.${domain}$`), "");

  return label;
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

// Return the current unix time.
export function unixTime(): number {
  return Math.floor(Date.now() / 1000);
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
  return /^rad:[a-z]+:[a-zA-Z0-9]+$/.test(input);
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

export function isENSName(input: string, config: Config): boolean {
  const domain = config.registrar.domain.replace(".", "\\.");
  const regEx = new RegExp(`^[a-zA-Z0-9]+.(${domain}|eth)$`);
  return regEx.test(input);
}

// Check whether the input is an checksummed or all lowercase Ethereum address.
export function isAddress(input: string): boolean {
  return ethers.utils.isAddress(input);
}

export function isFulfilled<T>(
  input: PromiseSettledResult<T>,
): input is PromiseFulfilledResult<T> {
  return input.status === "fulfilled";
}

// Get search parameters from location.
export function getSearchParam(
  key: string,
  location: RouteLocation,
): string | null {
  const params = new URLSearchParams(location.search);
  return params.get(key);
}

// Get the explorer link of an address, eg. Etherscan.
export function explorerLink(addr: string, config: Config): string {
  if (config.network.name === "rinkeby") {
    return `https://rinkeby.etherscan.io/address/${addr}`;
  }
  return `https://etherscan.io/address/${addr}`;
}

// Get the Gnosis Safe link of an address, eg. Etherscan.
export function safeLink(addr: string, config: Config): string {
  if (config.safe.viewer) {
    return `${config.safe.viewer}/${addr}`;
  }
  return explorerLink(addr, config);
}

// Format a name.
export function formatName(input: string, config: Config): string {
  return parseEnsLabel(input, config);
}

// Parse a Radicle Id (URN).
export function parseRadicleId(urn: string): string {
  return urn.replace(/^rad:[a-z]+:/, "");
}

// Get amount of days passed between two dates without including the end date
export function getDaysPassed(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

export function parseEmoji(input: string): string {
  if (input in emojis) {
    return emojis[input];
  }

  return input;
}

// Fetch from config the emoji to the corresponding pinned seed, if non found return default emoji
// @dev: This helper fn lets us get a seed emoji quick without multiLookups or complex type usage.
// TODO: Should be revisited, when we have a stable implementation for seed avatars.
export function getSeedEmoji(input: string, config: Config): string {
  if (config.seeds.pinned[input]) {
    return config.seeds.pinned[input].emoji;
  }
  return "🌱";
}

// Identify an address by checking whether it's a contract or an externally-owned address.
export async function identifyAddress(
  address: string,
  config: Config,
): Promise<AddressType> {
  const code = await getCode(address, config);
  const bytes = ethers.utils.arrayify(code);

  if (bytes.length > 0) {
    return AddressType.Contract;
  }
  return AddressType.EOA;
}

// Resolves an ENS profile or return null
export async function resolveEnsProfile(
  addressOrName: string,
  profileType: ProfileType,
  config: Config,
): Promise<EnsProfile | null> {
  const name = ethers.utils.isAddress(addressOrName)
    ? await lookupAddress(addressOrName, config)
    : addressOrName;

  if (name) {
    const resolver = await getResolver(name, config);
    if (!resolver) {
      return null;
    }

    if (profileType === ProfileType.Full) {
      const registration = await getRegistration(name, config, resolver);
      if (registration) {
        return registration.profile;
      }
    } else {
      const promises: [Promise<any>] = [getAvatar(name, config, resolver)];

      if (addressOrName === name) {
        promises.push(getAddress(resolver));
      } else {
        promises.push(Promise.resolve(addressOrName));
      }

      if (profileType === ProfileType.Project) {
        promises.push(getSeed(name, config, resolver));
      } else if (profileType === ProfileType.Minimal) {
        promises.push(Promise.resolve(null));
      }

      const project = await Promise.allSettled(promises);
      const [avatar, address, seed] =
        // Just checking for r.value equal null and casting to undefined,
        // since resolver functions return null.
        project.filter(isFulfilled).map(r => (r.value ? r.value : null));

      return {
        name,
        avatar,
        address,
        seed,
      };
    }
  }
  return null;
}

// Get token balances for an address.
export async function getTokens(
  address: string,
  config: Config,
): Promise<Array<Token>> {
  const userBalances = await getRpcMethod(
    "alchemy_getTokenBalances",
    [address, "DEFAULT_TOKENS"],
    config,
  );
  const balances = userBalances.tokenBalances
    .filter((token: any) => {
      // alchemy_getTokenBalances sometimes returns 0x and this does not work well with ethers.BigNumber
      if (token.tokenBalance !== "0x") {
        if (!BigNumber.from(token.tokenBalance).isZero()) {
          return token;
        }
      }
    })
    .map(async (token: any) => {
      const tokenMetaData = await getRpcMethod(
        "alchemy_getTokenMetadata",
        [token.contractAddress],
        config,
      );
      return { ...tokenMetaData, balance: BigNumber.from(token.tokenBalance) };
    });

  return Promise.all(balances);
}

export const getRpcMethod = cache.cached(
  async (method: string, props: string[], config: Config) => {
    return await config.provider.send(method, props);
  },
  (method, props) => JSON.stringify([method, props]),
  { ttl: 2 * 60 * 1000, max: 1000 },
);

// Check whether the given path has a markdown file extension.
export function isMarkdownPath(path: string): boolean {
  return /\.(md|mkd|markdown)$/i.test(path);
}

// Check whether the given input string is a domain, eg. `alt-clients.radicle.xyz.
// Also accepts in dev env 0.0.0.0 as domain
export function isDomain(input: string): boolean {
  return (
    (/^[a-z][a-z0-9.-]+$/.test(input) && /\.[a-z]+$/.test(input)) ||
    (!import.meta.env.PROD && /^0.0.0.0$/.test(input))
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

export const getCode = cache.cached(
  async (address: string, config: Config) => {
    return await config.provider.getCode(address);
  },
  address => address,
  { max: 1000 },
);

export const lookupAddress = cache.cached(
  async (address: string, config: Config) => {
    return await config.provider.lookupAddress(address);
  },
  address => address,
  { max: 1000 },
);

export const unreachable = (value: never): never => {
  throw new Error(`Unreachable code: ${value}`);
};

const emojisMarkedExtension = {
  name: "emoji",
  level: "inline",
  start: (src: string) => src.indexOf(":"),
  tokenizer(src: string) {
    const match = src.match(/^:([\w+-]+):/);
    if (match) {
      return {
        type: "emoji",
        raw: match[0],
        text: match[1].trim(),
      };
    }
  },
  renderer: (token: marked.Tokens.Generic) =>
    `<span>${parseEmoji(token.text)}</span>`,
};

const katexMarkedExtension = {
  name: "katex",
  level: "inline",
  start: (src: string) => src.indexOf("$"),
  tokenizer(src: string) {
    const match = src.match(/^\$+([^$\n]+?)\$+/);
    if (match) {
      return {
        type: "katex",
        raw: match[0],
        text: match[1].trim(),
      };
    }
  },
  renderer: (token: marked.Tokens.Generic) =>
    katex.renderToString(token.text, {
      throwOnError: false,
    }),
};

export const markdownExtensions = [emojisMarkedExtension, katexMarkedExtension];
