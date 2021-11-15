import { ethers } from "ethers";
import { BigNumber } from "ethers";
import multibase from 'multibase';
import multihashes from 'multihashes';
import EthersSafe, { EthersAdapter } from "@gnosis.pm/safe-core-sdk";
import type { Config } from '@app/config';
import config from "@app/config.json";
import { assert } from '@app/error';
import type { EnsProfile } from "@app/base/registrations/registrar";
import { getAvatar, getSeedHost, getSeedId, getAnchorsAccount, getRegistration } from '@app/base/registrations/registrar';
import type { BasicProfile } from '@datamodels/identity-profile-basic';
import { ProfileType } from '@app/profile';
import { parseUnits } from "@ethersproject/units";

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

export function toWei(amount: string): BigNumber {
  return parseUnits(amount);
}

export function isAddressEqual(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

export function formatSeedAddress(id: string, host: string, config: Config): string {
  return `${id}@${host}:${config.seed.link.port}`;
}

export function formatSeedId(id: string): string {
  return id.substring(0, 6)
    + '…'
    + id.substring(id.length - 6, id.length);
}

export function formatBalance(n: BigNumber): string {
  return ethers.utils.commify(parseFloat(ethers.utils.formatUnits(n)).toFixed(2));
}

export function formatCAIP10Address(address: string, protocol: string, impl: number): string {
  return `${address.toLowerCase()}@${protocol}:${impl.toString()}`;
}

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

export function formatHash(hash: string): string {
  return hash.substring(0, 6)
    + '...'
    + hash.substring(hash.length - 4, hash.length);
}

export function formatOrg(input: string, config: Config): string {
  if (isAddress(input)) {
    return ethers.utils.getAddress(input);
  } else {
    return parseEnsLabel(input, config);
  }
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
    for (const e of json.errors) {
      console.error("querySubgraph:", e.message);
    }
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
  if (label) return config.provider.resolveName(`${label}.${config.registrar.domain}`);
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
      const promises = [
        getAvatar(name, config, resolver),
      ];

      if (addressOrName === name) {
        promises.push(resolver.getAddress());
      } else {
        promises.push(Promise.resolve(addressOrName));
      }

      if (profileType === ProfileType.Project) {
        promises.push(getSeedHost(name, config, resolver));
        promises.push(getSeedId(name, config, resolver));
        promises.push(getAnchorsAccount(name, config, resolver));
      } else if (profileType === ProfileType.Minimal) {
        promises.push(Promise.resolve(null));
      }

      const project = await Promise.allSettled(promises);
      const [avatar, address, seedHost, seedId, anchorsAccount] =
        project.map(r => r.status == "fulfilled" ? r.value : null);

      return {
        name,
        avatar,
        address,
        seedHost,
        seedId,
        anchorsAccount,
        url: null,
        twitter: null,
        github: null,
      };
    }
  }
  return null;
}

// Check whether a Gnosis Safe exists at an address.
export async function isSafe(address: string, config: Config): Promise<boolean> {
  if (! config.safe.api) return false;

  const addr = ethers.utils.getAddress(address);
  const response = await fetch(`${config.safe.api}/api/v1/safes/${addr}/`, { method: 'HEAD' });

  return response.ok;
}

// Get a Gnosis Safe at an address.
export async function getSafe(address: string, config: Config): Promise<Safe | null> {
  if (! config.safe.api) return null;

  const addr = ethers.utils.getAddress(address);
  const response = await fetch(`${config.safe.api}/api/v1/safes/${addr}/`, {
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
export async function getTokens(address: string, config: Config): Promise<Array<Token>> {
  const userBalances = await config.provider.send("alchemy_getTokenBalances", [address, "DEFAULT_TOKENS"]);
  const balances = userBalances.tokenBalances.filter((token: any) => {
    // alchemy_getTokenBalances sometimes returns 0x and this does not work well with ethers.BigNumber
    if (token.tokenBalance !== "0x") {
      if (!BigNumber.from(token.tokenBalance).isZero()) {
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
