import { ethers } from "ethers";
import { writable } from "svelte/store";
import type { BigNumber } from "ethers";
import type { EnsResolver } from "@ethersproject/providers";
import type { TypedDataSigner } from "@ethersproject/abstract-signer";
import * as session from "@app/session";
import { Failure } from "@app/error";
import type { Wallet } from "@app/wallet";
import { isFulfilled, unixTime } from "@app/utils";
import { assert } from "@app/error";
import { Seed, InvalidSeed } from "@app/base/seeds/Seed";
import * as cache from "@app/cache";
import ethereumContractAbis from "@app/ethereum/contractAbis.json";

export interface Registration {
  profile: EnsProfile;
  resolver: EnsResolver;
}

export interface EnsProfile {
  name: string;
  id?: string;
  owner?: string;
  address?: string;
  seed?: Seed | InvalidSeed;
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
  | { connection: State.Failed }
  | { connection: State.Connecting }
  | { connection: State.SigningPermit }
  | { connection: State.SigningCommit }
  | { connection: State.Committing }
  | {
      connection: State.WaitingToRegister;
      commitmentBlock: number;
      minAge: number;
    }
  | { connection: State.SigningRegister }
  | { connection: State.Registering }
  | { connection: State.Registered };

export const state = writable<Connection>({ connection: State.Connecting });

window.registrarState = state;

state.subscribe((s: Connection) => {
  console.debug("register.state", s);
});

export async function getRegistration(
  name: string,
  wallet: Wallet,
  resolver?: EnsResolver | null,
): Promise<Registration | null> {
  name = name.toLowerCase();

  if (!resolver) {
    resolver = await getResolver(name, wallet);

    if (!resolver) {
      return null;
    }
  }

  const meta = await Promise.allSettled([
    getAddress(resolver),
    getText(resolver, "avatar"),
    getText(resolver, "url"),
    getText(resolver, "eth.radicle.id"),
    getText(resolver, "eth.radicle.seed.id"),
    getText(resolver, "eth.radicle.seed.host"),
    getText(resolver, "eth.radicle.seed.git"),
    getText(resolver, "eth.radicle.seed.api"),
    getText(resolver, "com.twitter"),
    getText(resolver, "com.github"),
  ]);

  const [
    address,
    avatar,
    url,
    id,
    seedId,
    seedHost,
    seedGit,
    seedApi,
    twitter,
    github,
  ] = meta.filter(isFulfilled).map(r => (r.value ? r.value : undefined));

  const profile: EnsProfile = {
    name,
    id,
    url,
    avatar,
    address,
    twitter,
    github,
  };

  // If no seed provided profile.seed ends up being undefined
  if (seedHost && seedId) {
    try {
      profile.seed = new Seed({
        host: seedHost,
        id: seedId,
        git: seedGit,
        api: seedApi,
      });
    } catch (e: any) {
      console.debug(e, seedHost, seedId);
      profile.seed = new InvalidSeed(seedHost, seedId);
    }
  }

  return { resolver, profile };
}

export async function getAvatar(
  name: string,
  wallet: Wallet,
  resolver?: EnsResolver | null,
): Promise<string | null> {
  name = name.toLowerCase();

  resolver = resolver ?? (await getResolver(name, wallet));
  if (!resolver) {
    return null;
  }
  return getText(resolver, "avatar");
}

export async function getSeed(
  name: string,
  wallet: Wallet,
  resolver?: EnsResolver | null,
): Promise<Seed | InvalidSeed | null> {
  name = name.toLowerCase();

  resolver = resolver ?? (await getResolver(name, wallet));
  if (!resolver) {
    return null;
  }

  const [id, host, git, api] = await Promise.all([
    getText(resolver, "eth.radicle.seed.id"),
    getText(resolver, "eth.radicle.seed.host"),
    getText(resolver, "eth.radicle.seed.git"),
    getText(resolver, "eth.radicle.seed.api"),
  ]);

  if (!host || !id) {
    console.debug("getSeed: No seed host or id provided");
    return null;
  }

  try {
    return new Seed({ host, id, git, api });
  } catch (e: any) {
    console.debug(e, host, id);
    return new InvalidSeed(id, host);
  }
}

export function registrar(wallet: Wallet): ethers.Contract {
  return new ethers.Contract(
    wallet.registrar.address,
    ethereumContractAbis.registrar,
    wallet.provider,
  );
}

export async function registrationFee(wallet: Wallet): Promise<BigNumber> {
  return await registrar(wallet).registrationFeeRad();
}

export async function registerName(
  name: string,
  owner: string,
  wallet: Wallet,
): Promise<void> {
  assert(wallet.signer, "signer is not available");

  if (!name) return;

  name = name.toLowerCase();

  const commitmentJson = window.localStorage.getItem("commitment");
  const commitment = commitmentJson && JSON.parse(commitmentJson);

  try {
    // Try to recover an existing commitment.
    if (commitment && commitment.name === name && commitment.owner === owner) {
      await register(name, owner, commitment.salt, wallet);
    } else {
      await commitAndRegister(name, owner, wallet);
    }
  } catch (e: any) {
    throw {
      type: e.type || Failure.TransactionFailed,
      message: e.message,
      txHash: e.txHash,
    };
  }
}

async function commitAndRegister(
  name: string,
  owner: string,
  wallet: Wallet,
): Promise<void> {
  const salt = ethers.utils.randomBytes(32);
  const minAge = (await registrar(wallet).minCommitmentAge()).toNumber();
  const fee = await registrationFee(wallet);
  // Avoids gas spent by the owner, trying to commit to a name and not having
  // enough RAD balance
  if ((await wallet.token.balanceOf(owner)).lt(fee)) {
    throw {
      type: Failure.InsufficientBalance,
      message: "Not enough RAD funds",
    };
  }
  name = name.toLowerCase();

  await commit(name, owner, salt, fee, minAge, wallet);
  await register(name, owner, salt, wallet);
}

async function commit(
  name: string,
  owner: string,
  salt: Uint8Array,
  fee: BigNumber,
  minAge: number,
  wallet: Wallet,
): Promise<void> {
  assert(wallet.signer, "signer is not available");

  const commitment = makeCommitment(name, owner, salt);
  const spender = wallet.registrar.address;
  const deadline = ethers.BigNumber.from(unixTime()).add(3600); // Expire one hour from now.
  const token = wallet.token;

  let tx = null;

  if (fee.isZero()) {
    state.set({ connection: State.SigningCommit });

    tx = await registrar(wallet)
      .connect(wallet.signer)
      .commit(commitment, { gasLimit: 180000 });
  } else {
    const signature = await permitSignature(
      wallet.signer,
      token,
      spender,
      fee,
      deadline,
    );

    state.set({ connection: State.SigningCommit });

    tx = await registrar(wallet)
      .connect(wallet.signer)
      .commitWithPermit(
        commitment,
        owner,
        fee,
        deadline,
        signature.v,
        signature.r,
        signature.s,
        { gasLimit: 180000 },
      );
  }

  state.set({ connection: State.Committing });

  const receipt = await tx.wait(1);
  session.state.updateBalance(fee.mul(-1));

  // Save commitment in local storage in case the user refreshes or closes
  // the page.
  window.localStorage.setItem(
    "commitment",
    JSON.stringify({
      name: name,
      owner: owner,
      salt: ethers.utils.hexlify(salt),
    }),
  );

  state.set({
    connection: State.WaitingToRegister,
    commitmentBlock: receipt.blockNumber,
    minAge,
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
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };
  const values = {
    owner: ownerAddr,
    spender: spenderAddr,
    value: value,
    nonce: nonce,
    deadline: deadline,
  };
  const sig = await owner._signTypedData(domain, types, values);

  return ethers.utils.splitSignature(sig);
}

async function register(
  name: string,
  owner: string,
  salt: Uint8Array,
  wallet: Wallet,
) {
  assert(wallet.signer, "signer is not available");
  state.set({ connection: State.SigningRegister });

  const tx = await registrar(wallet)
    .connect(wallet.signer)
    .register(name, owner, ethers.BigNumber.from(salt), { gasLimit: 150000 });
  state.set({ connection: State.Registering });

  console.debug("Sent", tx);

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

export async function getOwner(name: string, wallet: Wallet): Promise<string> {
  const ensAddr = wallet.provider.network.ensAddress;
  if (!ensAddr) {
    throw new Error("ENS address is not defined");
  }

  const registry = new ethers.Contract(
    ensAddr,
    ethereumContractAbis.ens,
    wallet.provider,
  );
  const owner = await registry.owner(ethers.utils.namehash(name));

  return owner;
}

export const getResolver = cache.cached(
  async (name: string, wallet: Wallet) => {
    return await wallet.provider.getResolver(name);
  },
  name => name,
  { max: 1000 },
);

export const getText = cache.cached(
  async (resolver: EnsResolver, key: string) => {
    return await resolver.getText(key);
  },
  (resolver, key) => `${resolver.name} ${key}`,
  { max: 1000 },
);

export const getAddress = cache.cached(
  async (resolver: EnsResolver) => {
    return await resolver.getAddress();
  },
  resolver => resolver.name,
  { max: 1000 },
);
