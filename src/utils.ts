import { ethers } from "ethers";
import type { BigNumber } from "ethers";
import multibase from 'multibase';
import type { Config } from '@app/config';
import { assert } from '@app/error';

export enum AddressType {
  Contract,
  Org,
  EOA,
}

export function formatBalance(n: BigNumber) {
  return ethers.utils.commify(parseFloat(ethers.utils.formatUnits(n)).toFixed(2));
}

export function formatAddress(addr: string) {
  return formatHash(addr);
}

export function formatHash(hash: string) {
  return hash.substring(0, 6)
    + '...'
    + hash.substring(hash.length - 4, hash.length);
}

export function capitalize(s: string) {
  if (s === "") return s;
  return s[0].toUpperCase() + s.substr(1);
}

// Takes a domain name, eg. 'cloudhead.radicle.eth' and
// returns the label, eg. 'cloudhead', otherwise `null`.
export function parseEnsLabel(name: string, config: Config): string {
  let domain = config.registrar.domain.replace(".", "\\.");
  let label = name.replace(new RegExp(`\\.${domain}$`), "");

  return label;
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

// Check whether the input is an Ethereum address.
export function isAddress(input: string): boolean {
  return ethers.utils.isAddress(input);
}

// Get search parameters from location.
export function getSearchParam(key: string, location: RouteLocation): string | null {
  let params = new URLSearchParams(location.search);
  return params.get(key);
}

// Get the explorer link of an address, eg. Etherscan.
export function explorerLink(addr: string, config: Config): string {
  if (config.network.name == "ropsten") {
    return `https://ropsten.etherscan.io/address/${addr}`;
  } else if (config.network.name == "rinkeby") {
    return `https://rinkeby.etherscan.io/address/${addr}`;
  }
  return `https://etherscan.io/address/${addr}`;
}

// Query a subgraph.
export async function querySubgraph(
  query: string,
  variables: Record<string, any>,
  config: Config
): Promise<null | any> {
  const response = await fetch(config.orgs.subgraph, {
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
    for (let e of json.errors) {
      console.error("querySubgraph:", e.message);
    }
    return null;
  }

  return json.data;
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

// Create a project hash from a hash and format.
export function formatProjectHash(hash: Uint8Array, format: number): string {
  assert(format === 0x0, "Only SHA1 commit hashes are supported");

  // Remove any zero-padding from the byte array. SHA1 is 20 bytes long.
  const sha1Bytes = 20;
  const suffix = hash.slice(hash.length - sha1Bytes);
  return ethers.utils.hexlify(suffix).replace(/^0x/, '');
}

// Identify an address by checking whether it's a contract or an externally-owned address.
export async function identifyAddress(address: string, config: Config): Promise<AddressType> {
  let code = await config.provider.getCode(address);
  let bytes = ethers.utils.arrayify(code);

  if (bytes.length > 0) {
    if (ethers.utils.keccak256(bytes) === config.orgs.contractHash) {
      return AddressType.Org;
    }
    return AddressType.Contract;
  }
  return AddressType.EOA;
}

// Resolve a label under the radicle domain.
export async function resolveLabel(label: string, config: Config): Promise<string | null> {
  return config.provider.resolveName(`${label}.${config.registrar.domain}`);
}
