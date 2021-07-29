// TODO: Show "look at your wallet" / "confirm tx" before state change.
import { ethers } from 'ethers';
import { writable } from 'svelte/store';
import type { BigNumber } from 'ethers';
import type { EnsResolver } from '@ethersproject/providers';
import type { TypedDataSigner } from '@ethersproject/abstract-signer';
import * as session from '@app/session';
import { Failure } from '@app/error';
import type { Config } from '@app/config';
import { unixTime } from '@app/utils';
import { assert } from '@app/error';

export interface Registration {
  name: string;
  owner: string;
  address: string | null;
  seedId: string | null;
  seedApi: string | null;
  url: string | null;
  avatar: string | null;
  twitter: string | null;
  github: string | null;
  resolver: EnsResolver;
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

export async function getRegistration(name: string, config: Config): Promise<Registration | null> {
  name = name.toLowerCase();

  const resolver = await config.provider.getResolver(name);
  if (! resolver) {
    return null;
  }

  const owner = await getOwner(name, config);
  const meta = await Promise.allSettled([
    resolver.getAddress(),
    resolver.getText('avatar'),
    resolver.getText('url'),
    resolver.getText('eth.radicle.seed.id'),
    resolver.getText('eth.radicle.seed.api'),
    resolver.getText('com.twitter'),
    resolver.getText('com.github'),
  ]);

  const [address, avatar, url, seedId, seedApi, twitter, github] =
    meta.map(r => r.status == "fulfilled" ? r.value : null);

  return {
    name,
    url,
    avatar,
    seedId,
    seedApi,
    owner,
    address,
    twitter,
    github,
    resolver,
  };
}

export function registrar(config: Config): ethers.Contract {
  return new ethers.Contract(config.registrar.address, config.abi.registrar, config.provider);
}

export async function registrationFee(config: Config): Promise<BigNumber> {
  return await registrar(config).registrationFeeRad();
}

export async function registerName(name: string, owner: string, config: Config): Promise<void> {
  assert(config.signer);

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

  await commit(makeCommitment(name, owner, salt), fee, minAge, config);
  // Save commitment in local storage in case the user refreshes or closes
  // the page.
  window.localStorage.setItem('commitment', JSON.stringify({
    name: name,
    owner: owner,
    salt: ethers.utils.hexlify(salt)
  }));

  await register(name, owner, salt, config);
}

async function commit(commitment: string, fee: BigNumber, minAge: number, config: Config): Promise<void> {
  assert(config.signer);

  const owner = config.signer;
  const ownerAddr = await owner.getAddress();
  const spender = config.registrar.address;
  const deadline = ethers.BigNumber.from(unixTime()).add(3600); // Expire one hour from now.
  const token = config.token;
  const signature = await permitSignature(owner, token, spender, fee, deadline);

  state.set({ connection: State.SigningCommit });

  const tx = await registrar(config)
    .connect(config.signer)
    .commitWithPermit(
      commitment,
      ownerAddr,
      fee,
      deadline,
      signature.v,
      signature.r,
      signature.s,
      { gasLimit: 150000 });

  state.set({ connection: State.Committing });

  await tx.wait(1);
  session.state.updateBalance(fee.mul(-1));
  const receipt = await config.provider.getTransactionReceipt(tx.hash);
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
  assert(owner.provider);

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
  assert(config.signer);
  state.set({ connection: State.SigningRegister });

  const tx = await registrar(config).connect(config.signer).register(
    name, owner, ethers.BigNumber.from(salt), { gasLimit: 150000 }
  );
  state.set({ connection: State.Registering });

  console.log("Sent", tx);

  await tx.wait();
  window.localStorage.clear();
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

async function getOwner(name: string, config: Config): Promise<string> {
  const ensAddr = config.provider.network.ensAddress;
  if (! ensAddr) {
    throw new Error("ENS address is not defined");
  }

  const registry = new ethers.Contract(ensAddr, config.abi.ens, config.provider);
  const owner = await registry.owner(ethers.utils.namehash(name));

  return owner;
}
