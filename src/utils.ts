import { ethers } from "ethers";
import md5 from "md5";
import { BigNumber } from "ethers";
import multibase from 'multibase';
import multihashes from 'multihashes';
import EthersSafe, { EthersAdapter, TransactionResult } from "@gnosis.pm/safe-core-sdk";
import type { SafeSignature } from "@gnosis.pm/safe-core-sdk-types";
import type { Config } from '@app/config';
import config from "@app/config.json";
import { assert } from '@app/error';
import type { EnsProfile } from "@app/base/registrations/registrar";
import { getAvatar, getSeed, getAnchorsAccount, getRegistration } from '@app/base/registrations/registrar';
import type { BasicProfile } from '@datamodels/identity-profile-basic';
import { ProfileType } from '@app/profile';
import { parseUnits } from "@ethersproject/units";
import { GetSafe } from "@app/base/orgs/Org";

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

export interface SafeTransaction {
  to: string;
  value: string;
  data: string;
  operation: number;
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
    { status: Status.Signing }
  | { status: Status.Pending }
  | { status: Status.Success }
  | { status: Status.Failed; error: string };

export async function isReverseRecordSet(address: string, domain: string, config: Config): Promise<boolean> {
  const name = await config.provider.lookupAddress(address);
  return name === domain;
}

export async function toClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function setOpenGraphMetaTag(data: { prop: string; content: string; attr?: string }[]): void {
  const elements = Array.from<HTMLElement>(document.querySelectorAll(`meta`));
  elements.forEach((element: any) => {
    const foundElement = data.find(data => {
      return data.prop === element.getAttribute(data.attr || 'property');
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

export function formatSeedAddress(id: string, host: string, port: number): string {
  return `${id}@${host}:${port}`;
}

export function formatLocationHash(hash: string | null): number | null {
  if (hash && hash.match(/^#L[0-9]+$/)) return parseInt(hash.slice(2));
  return null;
}

export function formatSeedId(id: string): string {
  return id.substring(0, 6)
    + '…'
    + id.substring(id.length - 6, id.length);
}

export function formatRadicleUrn(id: string): string {
  assert(isRadicleId(id));

  return id.substring(0, 14)
    + '…'
    + id.substring(id.length - 6, id.length);
}

export function formatBalance(n: BigNumber, decimals?: number): string {
  return ethers.utils.commify(parseFloat(ethers.utils.formatUnits(n, decimals)).toFixed(2));
}

export function formatCAIP10Address(address: string, protocol: string, impl: number): string {
  return `${address.toLowerCase()}@${protocol}:${impl.toString()}`;
}

// Returns a checksummed, shortened, without 0x prefix Ethereum address
export function formatAddress(input: string): string {
  const addr = ethers.utils.getAddress(input).replace(/^0x/, "");

  return addr.substring(0, 4)
    + ' – '
    + addr.substring(addr.length - 4, addr.length);
}

export function formatIpfsFile(ipfs: string | undefined): string | undefined {
  if (ipfs) return `${config.ipfs.gateway}${ipfs.replace("ipfs://", "")}`;
  return undefined;
}

// If the string is less than 10 characters the entire string is returned.
export function formatHash(hash: string): string {
  if (hash.length < 10) return hash;
  return hash.substring(0, 6)
    + '...'
    + hash.substring(hash.length - 4, hash.length);
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

export function clickOutside(node: HTMLElement, onEventFunction: () => void): any {
  const handleClick = (event: any) => {
    const path = event.composedPath();
    if (! path.includes(node)) {
      onEventFunction();
    }
  };
  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    }
  };
}

// Get the mime type of an image, given a file path.
// Returns `null` if unknown.
export function getImageMime(path: string): string | null {
  const mimes: Record<string, string> = {
    'apng': 'image/apng',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'gif': 'image/gif',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'webp': 'image/webp',
  };
  const ext = path.split(".").pop();

  if (ext) {
    if (mimes[ext]) {
      return mimes[ext];
    }
  }
  return null;
}

// TODO: Needs testing with absolute and relative paths.
export function canonicalize(path: string, base: string): string {
  const finalPath = base
    .split("/")
    .slice(0, -1) // Remove file name.
    .concat([path]) // Add image file path.
    .join("/");

  // URL is used to resolve relative paths, eg. `../../assets/image.png`.
  const url = new URL(finalPath, document.location.origin);
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

// Check whether the input is a Radicle ID.
export function isRadicleId(input: string): boolean {
  return /^rad:[a-z]+:[a-zA-Z0-9]+$/.test(input);
}

// Check whether the input is a SHA1 commit.
export function isOid(input: string): boolean {
  return /^[a-fA-F0-9]{40}$/.test(input);
}

// Check whether the input is a URL.
export function isUrl(input: string): boolean {
  return /^https?:\/\//.test(input);
}

// Check whether the input is a DID
export function isDid(input: string): boolean {
  return /^did:[a-zA-Z0-9]+:[a-zA-Z0-9]+$/.test(input);
}

export function isENSName(input: string, config: Config): boolean {
  const domain = config.registrar.domain.replace(".", "\\.");
  const regEx = new RegExp(`^[a-zA-Z0-9]+.${domain}$`);
  return regEx.test(input);
}

// Check whether the input is an checksummed or all lowercase Ethereum address.
export function isAddress(input: string): boolean {
  return ethers.utils.isAddress(input);
}

// Get search parameters from location.
export function getSearchParam(key: string, location: RouteLocation): string | null {
  const params = new URLSearchParams(location.search);
  return params.get(key);
}

// Get the explorer link of an address, eg. Etherscan.
export function explorerLink(addr: string, config: Config): string {
  if (config.network.name == "rinkeby") {
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

// Query a subgraph.
export async function querySubgraph(
  url: string,
  query: string,
  variables: Record<string, any>,
  retries = 3
): Promise<null | any> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    })
  });
  const json = await response.json();

  if (json.errors) {
    console.error("querySubgraph:", json.errors);

    if (retries > 0) querySubgraph(url, query, variables, retries - 1);
    else return null;
  }

  return json.data;
}

// Format a name.
export function formatName(input: string, config: Config): string {
  return parseEnsLabel(input, config);
}

// Create a Radicle ID from a root hash.
export function formatRadicleId(hash: Uint8Array): string {
  // Remove any zero-padding from the byte array. SHA1 is 20 bytes long.
  const sha1Bytes = 20;
  const suffix = hash.slice(hash.length - sha1Bytes);

  // Create a multihash by adding prefix 17 for SHA-1 and 20 for the hash length.
  const multihash = new Uint8Array([17, 20, ...suffix]);
  const payload = multibase.encode("base32z", multihash);

  return `rad:git:${new TextDecoder().decode(payload)}`;
}

// Parse a Radicle Id (URN).
export function parseRadicleId(urn: string): string {
  return urn.replace(/^rad:[a-z]+:/, "");
}

// Decode a Radicle Id (URN).
export function decodeRadicleId(urn: string): Uint8Array {
  const encoded = parseRadicleId(urn);
  const multihash = multibase.decode(encoded);
  const hash = multihashes.decode(multihash);

  return hash.digest;
}

// Create a project hash from a hash and format.
export function formatProjectHash(multihash: Uint8Array): string {
  const decoded = multihashes.decode(multihash);
  return ethers.utils.hexlify(decoded.digest).replace(/^0x/, '');
}

// Identify an address by checking whether it's a contract or an externally-owned address.
export async function identifyAddress(address: string, config: Config): Promise<AddressType> {
  const safe = await isSafe(address, config);
  if (safe) {
    return AddressType.Safe;
  }

  const code = await config.provider.getCode(address);
  const bytes = ethers.utils.arrayify(code);

  if (bytes.length > 0) {
    if (ethers.utils.keccak256(bytes) === config.orgs.contractHash) {
      return AddressType.Org;
    }
    return AddressType.Contract;
  }
  return AddressType.EOA;
}

// Resolve a label under the radicle domain.
export async function resolveLabel(label: string | undefined, config: Config): Promise<string | null> {
  if (label) return config.provider.resolveName(label);
  return null;
}

// Resolves an IDX profile or return null
export async function resolveIdxProfile(caip10: string, config: Config): Promise<BasicProfile | null> {
  return config.ceramic.client.get("basicProfile", caip10);
}

// Resolves an ENS profile or return null
export async function resolveEnsProfile(addressOrName: string, profileType: ProfileType, config: Config): Promise<EnsProfile | null> {
  const name = ethers.utils.isAddress(addressOrName)
    ? await config.provider.lookupAddress(addressOrName)
    : addressOrName;

  if (name) {
    const resolver = await config.provider.getResolver(name);
    if (! resolver) {
      return null;
    }

    if (profileType === ProfileType.Full) {
      const registration = await getRegistration(name, config, resolver);
      if (registration) {
        return registration.profile;
      }
    } else {
      const promises: [Promise<any>] = [
        getAvatar(name, config, resolver),
      ];

      if (addressOrName === name) {
        promises.push(resolver.getAddress());
      } else {
        promises.push(Promise.resolve(addressOrName));
      }

      if (profileType === ProfileType.Project) {
        promises.push(getSeed(name, config, resolver));
        promises.push(getAnchorsAccount(name, config, resolver));
      } else if (profileType === ProfileType.Minimal) {
        promises.push(Promise.resolve(null));
      }

      const project = await Promise.allSettled(promises);
      const [avatar, address, seed, anchorsAccount] =
        // Just checking for r.value equal null and casting to undefined,
        // since resolver functions return null.
        project.map(r => r.status == "fulfilled" && r.value ? r.value : null);

      return {
        name,
        avatar,
        address,
        seed,
        anchorsAccount,
      };
    }
  }
  return null;
}

// Check whether a Gnosis Safe exists at an address.
export async function isSafe(address: string, config: Config): Promise<boolean> {
  // For the subgraph we need to pass a lowercase address
  const query = await querySubgraph(config.orgs.subgraph, GetSafe, { addr: address.toLowerCase() });

  return query.safe !== null ? true : false;
}

// Get a Gnosis Safe at an address.
export async function getSafe(address: string, config: Config): Promise<Safe | null> {
  // For the subgraph we need to pass a lowercase address
  const query = await querySubgraph(config.orgs.subgraph, GetSafe, { addr: address.toLowerCase() });

  if (! query?.safe) {
    return null;
  }

  return {
    address: query.safe.id,
    owners: query.safe.owners,
    threshold: query.safe.threshold
  };
}

// Get token balances for an address.
export async function getTokens(address: string, config: Config): Promise<Array<Token>> {
  const userBalances = await config.provider.send("alchemy_getTokenBalances", [address, "DEFAULT_TOKENS"]);
  const balances = userBalances.tokenBalances.filter((token: any) => {
    // alchemy_getTokenBalances sometimes returns 0x and this does not work well with ethers.BigNumber
    if (token.tokenBalance !== "0x") {
      if (! BigNumber.from(token.tokenBalance).isZero()) {
        return token;
      }
    }
  }).map(async (token: any) => {
    const tokenMetaData = await config.provider.send("alchemy_getTokenMetadata", [token.contractAddress]);
    return { ...tokenMetaData, balance: BigNumber.from(token.tokenBalance) };
  });

  return Promise.all(balances);
}

// Check whether the given path has a markdown file extension.
export function isMarkdownPath(path: string): boolean {
  return /\.(md|mkd|markdown)$/i.test(path);
}

// Check whether the given input string is a domain, eg. `alt-clients.radicle.xyz.
// Also accepts in dev env 0.0.0.0 as domain
export function isDomain(input: string): boolean {
  return (/^[a-z][a-z0-9.-]+$/.test(input) && /\.[a-z]+$/.test(input))
    || (! import.meta.env.PROD && /^0.0.0.0$/.test(input));
}


// Get the gravatar URL of an email.
export function gravatarURL(email: string): string {
  const address = email.trim().toLowerCase();
  const hash = md5(address);

  return `https://www.gravatar.com/avatar/${hash}`;
}

// Propose a Gnosis Safe multi-sig transaction.
export async function proposeSafeTransaction(
  safeTx: SafeTransaction,
  safeAddress: string,
  config: Config
): Promise<void> {
  assert(config.signer);
  assert(config.safe.client);

  const ethAdapter = new EthersAdapter({
    ethers,
    signer: config.signer,
  });
  const safeSdk = await EthersSafe.create({
    ethAdapter, safeAddress,
  });
  const estimation = await config.safe.client.estimateSafeTransaction(
    safeAddress,
    safeTx
  );
  const transaction = await safeSdk.createTransaction({
    ...safeTx,
    safeTxGas: Number(estimation.safeTxGas),
  });
  const safeTxHash = await safeSdk.getTransactionHash(transaction);
  const signature = await safeSdk.signTransactionHash(safeTxHash);

  await config.safe.client.proposeTransaction(
    safeAddress,
    transaction.data,
    safeTxHash,
    signature
  );
}

// Sign a Gnosis Safe multi-sig transaction.
export async function signSafeTransaction(
  safeAddress: string,
  safeTxHash: string,
  config: Config
): Promise<SafeSignature> {
  assert(config.signer);

  const ethAdapter = new EthersAdapter({
    ethers, signer: config.signer
  });
  const safeSdk = await EthersSafe.create({
    ethAdapter, safeAddress
  });
  return await safeSdk.signTransactionHash(safeTxHash);
}

// Execute a Gnosis Safe signed transaction by safeTxHash.
export async function executeSignedSafeTransaction(
  safeAddress: string,
  safeTxHash: string,
  config: Config
): Promise<TransactionResult> {
  assert(config.signer);
  assert(config.safe.client);

  const ethAdapter = new EthersAdapter({
    ethers, signer: config.signer
  });
  const safeSdk = await EthersSafe.create({
    ethAdapter, safeAddress
  });

  const signedTx = await config.safe.client.getTransaction(safeTxHash);

  assert(signedTx.data);
  assert(signedTx.confirmations);

  const safeTx = await safeSdk.createTransaction({
    ...signedTx,
    gasPrice: Number(signedTx.gasPrice),
    data: signedTx.data
  });

  signedTx.confirmations.forEach(confirmation => {
    const signature = new EthSignSignature(confirmation.owner, confirmation.signature);
    safeTx.addSignature(signature);
  });

  return await safeSdk.executeTransaction(safeTx);
}

export class EthSignSignature {
  signer: string;
  data: string;

  constructor(signer: string, signature: string) {
    this.signer = signer;
    this.data = signature;
  }
  staticPart(): string {
    return this.data;
  }
  dynamicPart(): string {
    return '';
  }
}
