// TODO: Show "look at your wallet" / "confirm tx" before state change.
// TODO: Two registration actions with same label
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

const registrarAbi = [
  'function rad() view returns (address)',
  'function radNode() view returns (bytes32)',
  'function minCommitmentAge() view returns (uint256)',
  'function registrationFeeRad() view returns (uint256)',
  'function commitWithPermit(bytes32, address, uint256, uint256, uint8, bytes32, bytes32)',
  'function register(string, address, uint256)',
  'function valid(string) pure returns (bool)',
  'function available(string) view returns (bool)',
];

export interface Registration {
  name: string
  owner: string
  address: string | null
  url: string | null
  avatar: string | null
  twitter: string | null
  github: string | null
  resolver: EnsResolver
}

export enum State {
  Failed = -1,
  Connecting,
  Committing,
  WaitingToRegister,
  Registering,
  Registered,
}

export const state = writable(State.Connecting);

window.registrarState = state;

state.subscribe((s: State) => {
  console.log("regiter.state", s);
});

export async function getRegistration(name: string, config: Config): Promise<Registration | null> {
  const resolver = await config.provider.getResolver(name);
  if (! resolver) {
    return null;
  }

  const owner = await getOwner(name, config);
  const address = await resolver.getAddress();
  const avatar = await resolver.getText('avatar');
  const url = await resolver.getText('url');
  const twitter = await resolver.getText('vnd.twitter');
  const github = await resolver.getText('vnd.github');

  return {
    name,
    url,
    avatar,
    owner,
    address,
    twitter,
    github,
    resolver,
  };
}

export function registrar(config: Config) {
  return new ethers.Contract(config.registrar.address, registrarAbi, config.provider);
}

export async function registrationFee(config: Config) {
  return await registrar(config).registrationFeeRad();
}

export async function registerName(name: string, owner: string, config: Config) {
  assert(config.signer);

  if (! name) return;

  let commitmentJson = window.localStorage.getItem('commitment');
  let commitment = commitmentJson && JSON.parse(commitmentJson);

  try {
    // Try to recover an existing commitment.
    if (commitment && commitment.name === name && commitment.owner === owner) {
      await register(name, owner, commitment.salt, config);
    } else {
      await commitAndRegister(name, owner, config);
    }
  } catch (e) {
    throw { type: Failure.TransactionFailed, message: e.message, txHash: e.txHash };
  }
}

async function commitAndRegister(name: string, owner: string, config: Config) {
  let salt = ethers.utils.randomBytes(32);
  let minAge = (await registrar(config).minCommitmentAge()).toNumber();
  let fee = await registrationFee(config);

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

async function commit(commitment: string, fee: BigNumber, minAge: number, config: Config) {
  assert(config.signer);

  state.set(State.Committing);

  const owner = config.signer;
  const ownerAddr = await owner.getAddress();
  const spender = config.registrar.address;
  const deadline = ethers.BigNumber.from(unixTime()).add(3600); // Expire one hour from now.
  const token = session.token(config);
  const signature = await permitSignature(owner, token, spender, fee, deadline);
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
      { gasLimit: 150000 })
    .catch((e: Error) => console.error(e));

  await tx.wait(1);
  session.state.updateBalance(fee.mul(-1));

  // TODO: Getting "commitment too new"
  state.set(State.WaitingToRegister);
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
  state.set(State.Registering);

  const tx = await registrar(config).connect(config.signer).register(
    name, owner, ethers.BigNumber.from(salt), { gasLimit: 150000 }
  );
  console.log("Sent", tx);

  await tx.wait();
  window.localStorage.clear();
  state.set(State.Registered);
}

function makeCommitment(name: string, owner: string, salt: Uint8Array): string {
  let bytes = ethers.utils.concat([
    ethers.utils.toUtf8Bytes(name),
    ethers.utils.getAddress(owner),
    ethers.BigNumber.from(salt).toHexString(),
  ]);
  return ethers.utils.keccak256(bytes);
}

async function getOwner(name: string, config: Config): Promise<string> {
  const ensAbi = [
    "function owner(bytes32 node) view returns (address)"
  ];

  let ensAddr = config.provider.network.ensAddress;
  if (! ensAddr) {
    throw new Error("ENS address is not defined");
  }

  let registry = new ethers.Contract(ensAddr, ensAbi, config.provider);
  let owner = await registry.owner(ethers.utils.namehash(name));

  return owner;
}
