// TODO: Show "look at your wallet" / "confirm tx" before state change.
// TODO: Two registration actions with same label
import { ethers } from 'ethers';
import type { BigNumber } from 'ethers';
import type { EnsResolver } from '@ethersproject/providers';
import { State, state } from './state';
import * as session from '@app/session';
import { Failure } from '@app/error';
import type { Config } from '@app/config';

const registrarAbi = [
  'function rad() returns (address)',
  'function radNode() returns (bytes32)',
  'function minCommitmentAge() returns (uint256)',
  'function registrationFeeRad() returns (uint256)',
  'function commit(bytes32)',
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
  if (! name) return;

  let commitmentJson = window.localStorage.getItem('commitment');
  let commitment = commitmentJson && JSON.parse(commitmentJson);

  try {
    // Try to recover an existing commitment.
    if (commitment && commitment.name === name && commitment.owner === owner) {
      await register(name, owner, commitment.salt, config);
    } else {
      await approveRegistrar(owner, config);
      await commitAndRegister(name, owner, config);
    }
  } catch (e) {
    throw { type: Failure.TransactionFailed, message: e.message, txHash: e.txHash };
  }
}

async function approveRegistrar(owner: string, config: Config) {
  state.set(State.Approving);

  const amount = await registrationFee(config);
  await session.approveSpender(config.registrar.address, amount, config);
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
  state.set(State.Committing);

  const signer = config.provider.getSigner();
  const tx = await registrar(config)
    .connect(signer)
    .commit(commitment, { gasLimit: 150000 })
    .catch((e: Error) => console.error(e));

  await tx.wait(1);
  session.state.updateBalance(fee.mul(-1));

  // TODO: Getting "commitment too new"
  state.set(State.WaitingToRegister);
  await tx.wait(minAge + 1);
}

async function register(name: string, owner: string, salt: Uint8Array, config: Config) {
  state.set(State.Registering);

  const signer = config.provider.getSigner();
  const tx = await registrar(config).connect(signer).register(
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
