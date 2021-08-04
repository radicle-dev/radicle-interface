import { ethers } from "ethers";
import type { BigNumber } from "ethers";
import multibase from 'multibase';
import multihashes from 'multihashes';
import EthersSafe from "@gnosis.pm/safe-core-sdk";
import type { Config } from '@app/config';
import config from "@app/config.json";
import { assert } from '@app/error';
import type { Registration } from "@app/base/registrations/registrar";
import { getRegistration } from '@app/base/registrations/registrar';
import type { BasicProfile } from "@ceramicstudio/idx-constants";


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

export async function isReverseRecordSet(address: string, domain: string, config: Config): Promise<boolean> {
  const name = await config.provider.lookupAddress(address);
  return name === domain;
}

export function isAddressEqual(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

export function formatBalance(n: BigNumber): string {
  return ethers.utils.commify(parseFloat(ethers.utils.formatUnits(n)).toFixed(2));
}

export function formatCAIP10Address(address: string, protocol: string, impl: number): string {
  return `${address.toLowerCase()}@${protocol}:${impl.toString()}`;
}

export function formatAddress(addr: string): string {
  return formatHash(ethers.utils.getAddress(addr)).replace(/^0x/, "");
}

export function formatIpfsFile(ipfs: string | undefined): string | undefined {
  if (ipfs) return `${config.ipfs.gateway}${ipfs.replace("ipfs://", "")}`;
  return undefined;
}

export function formatHash(hash: string): string {
  return hash.substring(0, 6)
    + '...'
    + hash.substring(hash.length - 4, hash.length);
}

export function formatSeedApi(input: string): string {
  const match = input.match(/^https?:\/\/([^:]+)/);
  if (match) {
    return match[1];
  }
  return input;
}

export function formatNetwork(input: { name: string }): string {
  let name = input.name;

  if (name === "homestead") {
    name = "mainnet";
  }
  return capitalize(name);
}

export function capitalize(s: string): string {
  if (s === "") return s;
  return s[0].toUpperCase() + s.substr(1);
}

// Takes a domain name, eg. 'cloudhead.radicle.eth' and
// returns the label, eg. 'cloudhead', otherwise `undefined`.
export function parseEnsLabel(name: string, config: Config): string {
  const domain = config.registrar.domain.replace(".", "\\.");
  const label = name.replace(new RegExp(`\\.${domain}$`), "");

  return label;
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

// Check whether the input is an Ethereum address.
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
    for (const e of json.errors) {
      console.error("querySubgraph:", e.message);
    }
    return null;
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
export function parseRadicleId(urn: string): Uint8Array {
  const encoded = urn.replace(/^rad:[a-z]+:/, "");
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
  if (label) return config.provider.resolveName(`${label}.${config.registrar.domain}`);
  return null;
}

// Resolves an IDX profile or return null
export async function resolveIdxProfile(caip10: string, config: Config): Promise<BasicProfile | null> {
  return config.idx.client.get<BasicProfile>("basicProfile", caip10);
}

// Resolves an ENS profile or return null
export async function resolveEnsProfile(address: string, config: Config): Promise<Registration | null> {
  const name = await config.provider.lookupAddress(address);
  if (name) {
    return await getRegistration(name, config);
  }
  return null;
}

// Check whether a Gnosis Safe exists at an address.
export async function isSafe(address: string, config: Config): Promise<boolean> {
  if (! config.safe.api) return false;

  const addr = ethers.utils.getAddress(address);
  const response = await fetch(`${config.safe.api}/api/v1/safes/${addr}`, { method: 'HEAD' });

  return response.ok;
}

// Get a Gnosis Safe at an address.
export async function getSafe(address: string, config: Config): Promise<Safe | null> {
  if (! config.safe.api) return null;

  const addr = ethers.utils.getAddress(address);
  const response = await fetch(`${config.safe.api}/api/v1/safes/${addr}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (! response.ok) {
    return null;
  }
  const json = await response.json();

  return {
    address: json.address,
    owners: json.owners,
    threshold: json.threshold
  };
}

// Get the Gnosis Safe addresses owned by the given address.
export async function getOwnerSafes(owner: string, config: Config): Promise<string[] | null> {
  if (! config.safe.api) return null;

  const addr = ethers.utils.getAddress(owner);
  const response = await fetch(`${config.safe.api}/api/v1/owners/${addr}/safes/`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (! response.ok) {
    return null;
  }
  const json = await response.json();

  return json.safes;
}

// Get token balances for an address.
export async function getTokens(address: string, config: Config):
  Promise<Array<{ tokenName: string; tokenLogo: string }>>
{
  await config.provider.send("alchemy_getTokenBalances", [address, config.tokens]);

  // TODO
  return [];
}

// Check whether the given path has a markdown file extension.
export function isMarkdownPath(path: string): boolean {
  return /\.(md|mkd|markdown)$/i.test(path);
}

// Propose a Gnosis Safe multi-sig transaction.
export async function proposeSafeTransaction(
  safeTx: SafeTransaction,
  safeAddress: string,
  config: Config
): Promise<void> {
  assert(config.signer);
  assert(config.safe.client);

  const safeSdk = await EthersSafe.create({
    ethers, safeAddress, providerOrSigner: config.signer,
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
