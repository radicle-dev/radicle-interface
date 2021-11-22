import { ethers } from 'ethers';
import { writable } from 'svelte/store';
import type { BigNumber } from 'ethers';
import type { EnsResolver } from '@ethersproject/providers';
import type { TypedDataSigner } from '@ethersproject/abstract-signer';
import * as session from '@app/session';
import { Failure } from '@app/error';
import type { Config } from '@app/config';
import { isDomain, unixTime } from '@app/utils';
import { assert } from '@app/error';

export interface Registration {
  profile: EnsProfile;
  resolver: EnsResolver;
}

export class Seed {
  id?: string;
  host?: string;
  git?: string;
  api?: string;

  constructor(id?: string, host?: string, git?: string, api?: string) {
    if (id && /^[a-z0-9]+$/.test(id)) {
      this.id = id;
    }
    if (host && isDomain(host)) {
      this.host = host;
    }
    if (api && isDomain(api)) {
      this.api = api;
    }
    if (git && isDomain(git)) {
      this.git = git;
    }
  }
}

export interface EnsProfile {
  name: string;
  owner?: string;
  address?: string;
  seed: Seed;
  anchorsAccount?: string;
  url?: string;
  avatar?: string;
  twitter?: string;
  github?: string;
}

export enum State {
  Failed = -1,
  Connecting,
  SigningPermit,
  SigningCommit,
  Committing,
  WaitingToRegister,
  SigningRegister,
  Registering,
  Registered,
}

export type Connection =
    { connection: State.Failed }
  | { connection: State.Connecting }
  | { connection: State.SigningPermit }
  | { connection: State.SigningCommit }
  | { connection: State.Committing }
  | { connection: State.WaitingToRegister; commitmentBlock: number; minAge: number }
  | { connection: State.SigningRegister }
  | { connection: State.Registering }
  | { connection: State.Registered };

export const state = writable<Connection>({ connection: State.Connecting });

window.registrarState = state;

state.subscribe((s: Connection) => {
  console.log("register.state", s);
});

export async function getRegistration(name: string, config: Config, resolver?: EnsResolver | null): Promise<Registration | null> {
  name = name.toLowerCase();

  if (! resolver) {
    resolver = await config.provider.getResolver(name);

    if (! resolver) {
      return null;
    }
  }

  const meta = await Promise.allSettled([
    resolver.getAddress(),
    resolver.getText('avatar'),
    resolver.getText('url'),
    resolver.getText('eth.radicle.seed.id'),
    resolver.getText('eth.radicle.seed.host'),
    resolver.getText('eth.radicle.seed.git'),
    resolver.getText('eth.radicle.seed.api'),
    resolver.getText('eth.radicle.anchors'),
    resolver.getText('com.twitter'),
    resolver.getText('com.github'),
  ]);

  const [address, avatar, url, seedId, seedHost, seedGit, seedApi, anchorsAccount, twitter, github] =
    meta.map(r => r.status == "fulfilled" && r.value ? r.value : undefined);

  return {
    resolver,
    profile: {
      name,
      url,
      avatar,
      seed: new Seed(
        seedId,
        seedHost,
        seedGit,
        seedApi,
      ),
      anchorsAccount,
      address,
      twitter,
      github,
    },
  };
}

export async function getAvatar(name: string, config: Config, resolver?: EnsResolver | null): Promise<string | null> {
  name = name.toLowerCase();

  resolver = resolver ?? await config.provider.getResolver(name);
  if (! resolver) {
    return null;
  }
  return resolver.getText('avatar');
}

export async function getAnchorsAccount(name: string, config: Config, resolver?: EnsResolver | null): Promise<string | null> {
  name = name.toLowerCase();

  resolver = resolver ?? await config.provider.getResolver(name);
  if (! resolver) {
    return null;
  }
  return resolver.getText('eth.radicle.anchors');
}

export async function getSeed(name: string, config: Config, resolver?: EnsResolver | null): Promise<Seed | null> {
  name = name.toLowerCase();

  resolver = resolver ?? await config.provider.getResolver(name);
  if (! resolver) {
    return null;
  }

  const [id, host, git, api] = await Promise.all([
    resolver.getText('eth.radicle.seed.id'),
    resolver.getText('eth.radicle.seed.host'),
    resolver.getText('eth.radicle.seed.git'),
    resolver.getText('eth.radicle.seed.api'),
  ]);

  return new Seed(id, host, git, api);
}

export function registrar(config: Config): ethers.Contract {
  return new ethers.Contract(config.registrar.address, config.abi.registrar, config.provider);
}

export async function registrationFee(config: Config): Promise<BigNumber> {
  return await registrar(config).registrationFeeRad();
}

export async function registerName(name: string, owner: string, config: Config): Promise<void> {
  assert(config.signer, "signer is not available");

  if (! name) return;

  name = name.toLowerCase();

  const commitmentJson = window.localStorage.getItem('commitment');
  const commitment = commitmentJson && JSON.parse(commitmentJson);

  try {
    // Try to recover an existing commitment.
    if (commitment && commitment.name === name && commitment.owner === owner) {
      await register(name, owner, commitment.salt, config);
    } else {
      await commitAndRegister(name, owner, config);
    }
  } catch (e) {
    throw { type: e.type || Failure.TransactionFailed, message: e.message, txHash: e.txHash };
  }
}

async function commitAndRegister(name: string, owner: string, config: Config): Promise<void> {
  const salt = ethers.utils.randomBytes(32);
  const minAge = (await registrar(config).minCommitmentAge()).toNumber();
  const fee = await registrationFee(config);
  // Avoids gas spent by the owner, trying to commit to a name and not having
  // enough RAD balance
  if ((await config.token.balanceOf(owner)).lt(fee)) {
    throw { type: Failure.InsufficientBalance, message: "Not enough RAD funds" };
  }
  name = name.toLowerCase();

  await commit(name, owner, salt, fee, minAge, config);
  await register(name, owner, salt, config);
}

async function commit(
  name: string,
  owner: string,
  salt: Uint8Array,
  fee: BigNumber,
  minAge: number,
  config: Config
): Promise<void> {
  assert(config.signer, "signer is not available");

  const commitment = makeCommitment(name, owner, salt);
  const spender = config.registrar.address;
  const deadline = ethers.BigNumber.from(unixTime()).add(3600); // Expire one hour from now.
  const token = config.token;
  const signature = await permitSignature(config.signer, token, spender, fee, deadline);

  state.set({ connection: State.SigningCommit });

  const tx = await registrar(config)
    .connect(config.signer)
    .commitWithPermit(
      commitment,
      owner,
      fee,
      deadline,
      signature.v,
      signature.r,
      signature.s,
      { gasLimit: 180000 });

  state.set({ connection: State.Committing });

  const receipt = await tx.wait(1);
  session.state.updateBalance(fee.mul(-1));

  // Save commitment in local storage in case the user refreshes or closes
  // the page.
  window.localStorage.setItem('commitment', JSON.stringify({
    name: name,
    owner: owner,
    salt: ethers.utils.hexlify(salt)
  }));

  state.set({
    connection: State.WaitingToRegister,
    commitmentBlock: receipt.blockNumber,
    minAge
  });
  await tx.wait(minAge + 1);
}

async function permitSignature(
  owner: ethers.Signer & TypedDataSigner,
  token: ethers.Contract,
  spenderAddr: string,
  value: ethers.BigNumberish,
  deadline: ethers.BigNumberish,
): Promise<ethers.Signature> {
  assert(owner.provider, "provider is not available");
  state.set({ connection: State.SigningPermit });

  const ownerAddr = await owner.getAddress();
  const nonce = await token.nonces(ownerAddr);
  const chainId = (await owner.provider.getNetwork()).chainId;

  const domain = {
    name: await token.name(),
    chainId,
    verifyingContract: token.address,
  };
  const types = {
    Permit: [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" },
      { "name": "value", "type": "uint256" },
      { "name": "nonce", "type": "uint256" },
      { "name": "deadline", "type": "uint256" }
    ]
  };
  const values = {
    "owner": ownerAddr,
    "spender": spenderAddr,
    "value": value,
    "nonce": nonce,
    "deadline": deadline
  };
  const sig = await owner._signTypedData(domain, types, values);

  return ethers.utils.splitSignature(sig);
}

async function register(name: string, owner: string, salt: Uint8Array, config: Config) {
  assert(config.signer, "signer is not available");
  state.set({ connection: State.SigningRegister });

  const tx = await registrar(config).connect(config.signer).register(
    name, owner, ethers.BigNumber.from(salt), { gasLimit: 150000 }
  );
  state.set({ connection: State.Registering });

  console.log("Sent", tx);

  await tx.wait();
  window.localStorage.removeItem("commitment");
  state.set({ connection: State.Registered });
}

function makeCommitment(name: string, owner: string, salt: Uint8Array): string {
  const bytes = ethers.utils.concat([
    ethers.utils.toUtf8Bytes(name),
    ethers.utils.getAddress(owner),
    ethers.BigNumber.from(salt).toHexString(),
  ]);
  return ethers.utils.keccak256(bytes);
}

export async function getOwner(name: string, config: Config): Promise<string> {
  const ensAddr = config.provider.network.ensAddress;
  if (! ensAddr) {
    throw new Error("ENS address is not defined");
  }

  const registry = new ethers.Contract(ensAddr, config.abi.ens, config.provider);
  const owner = await registry.owner(ethers.utils.namehash(name));

  return owner;
}
