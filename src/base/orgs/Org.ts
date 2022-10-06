import type { Config } from "@app/config";
import type { Safe } from "@app/utils";
import type { TransactionResponse } from "@ethersproject/providers";

import * as ethers from "ethers";
import { OperationType } from "@gnosis.pm/safe-core-sdk-types";

import * as cache from "@app/cache";
import * as utils from "@app/utils";
import { assert } from "@app/error";

const GetSafesByOwners = `
  query GetSafesByOwners($owners: [String!]!) {
    safes(where: { owners_contains: $owners }) {
      id
      owners
      threshold
    }
  }
`;

const GetOrgsByOwners = `
  query GetOrgsByOwners($owners: [String!]!) {
    orgs(where: { owner_in: $owners }) {
      id
      owner
      safe {
        id
        owners
        threshold
      }
      creator
      timestamp
    }
  }
`;

export const GetSafe = `
  query GetSafe($addr: ID!) {
    safe(id: $addr) {
      id
      owners
      threshold
    }
  }
`;

export class Org {
  address: string;
  owner: string;
  name?: string | null;
  safe?: Safe | null;

  constructor(
    address: string,
    owner: string,
    name?: string | null,
    safe?: Safe | null,
  ) {
    assert(ethers.utils.isAddress(address), "address must be valid");

    this.address = address.toLowerCase(); // Don't store address checksum.
    this.owner = owner;
    this.name = name;
    this.safe = safe;
  }

  async setName(name: string, config: Config): Promise<TransactionResponse> {
    assert(config.signer);

    const org = new ethers.Contract(
      this.address,
      config.abi.org,
      config.signer,
    );
    return org.setName(name, config.provider.network.ensAddress, {
      gasLimit: 200_000,
    });
  }

  async setNameMultisig(name: string, config: Config): Promise<void> {
    assert(config.signer);
    assert(config.safe.client);

    const safeAddress = ethers.utils.getAddress(this.owner);
    const orgAddress = ethers.utils.getAddress(this.address);
    const org = new ethers.Contract(
      this.address,
      config.abi.org,
      config.signer,
    );
    const unsignedTx = await org.populateTransaction.setName(
      name,
      config.provider.network.ensAddress,
    );

    const txData = unsignedTx.data;
    if (!txData) {
      throw new Error(
        "Org::setNameMultisig: Could not generate transaction for `setName` call",
      );
    }

    const safeTx = {
      to: orgAddress,
      value: ethers.constants.Zero.toString(),
      data: txData,
      operation: OperationType.Call,
    };
    await utils.proposeSafeTransaction(safeTx, safeAddress, config);
  }

  async setOwner(
    address: string,
    config: Config,
  ): Promise<TransactionResponse> {
    assert(config.signer);

    const org = new ethers.Contract(
      this.address,
      config.abi.org,
      config.signer,
    );
    return org.setOwner(address);
  }

  async setOwnerMultisig(owner: string, config: Config): Promise<void> {
    assert(config.signer);
    assert(config.safe.client);

    const safeAddress = ethers.utils.getAddress(this.owner);
    const orgAddress = ethers.utils.getAddress(this.address);
    const org = new ethers.Contract(
      this.address,
      config.abi.org,
      config.signer,
    );
    const unsignedTx = await org.populateTransaction.setOwner(owner);

    const txData = unsignedTx.data;
    if (!txData) {
      throw new Error(
        "Org::setOwnerMultisig: Could not generate transaction for `setOwner` call",
      );
    }

    const safeTx = {
      to: orgAddress,
      value: ethers.constants.Zero.toString(),
      data: txData,
      operation: OperationType.Call,
    };
    await utils.proposeSafeTransaction(safeTx, safeAddress, config);
  }

  async getMembers(config: Config): Promise<Array<string>> {
    if (this.safe) return this.safe.owners;

    const safe = await this.getSafe(config);
    if (safe) {
      return safe.owners;
    }
    return [];
  }

  async getSafe(config: Config): Promise<Safe | null> {
    if (this.safe) return this.safe;

    return utils.getSafe(this.owner, config);
  }

  async isMember(address: string, config: Config): Promise<boolean> {
    const members = await this.getMembers(config);
    return members.includes(address.toLowerCase());
  }

  static async get(addressOrName: string, config: Config): Promise<Org | null> {
    const org = await getOrgContract(addressOrName, config);

    try {
      const [owner, resolved] = await resolveOrgOwner(org);

      const safe = await utils.getSafe(owner, config);
      // If what is resolved is not the same as the input, it's because we
      // were given a name.
      if (utils.isAddressEqual(addressOrName, resolved)) {
        return new Org(resolved, owner, null, safe);
      } else {
        return new Org(resolved, owner, addressOrName, safe);
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async getOrgsByMember(owner: string, config: Config): Promise<Org[]> {
    type Safe = { id: string; owners: string[]; threshold: number };

    // TODO: We use two subgraph queries since we can't do a filter query yet in the subgraph
    // https://github.com/graphprotocol/graph-node/issues/2539#issuecomment-855979841
    const safesByOwner = await utils.querySubgraph(
      config.orgs.subgraph,
      GetSafesByOwners,
      { owners: [owner] },
    );

    let safes = [];
    if (safesByOwner && safesByOwner.safes.length > 0) {
      safes = safesByOwner.safes.reduce(
        (prev: any, curr: Safe) => prev.concat(curr.id),
        [],
      );
    }

    const orgsByOwner = await utils.querySubgraph(
      config.orgs.subgraph,
      GetOrgsByOwners,
      { owners: [...safes, owner] },
    );
    let orgs: { id: string; owner: string }[] = [];
    if (orgsByOwner && orgsByOwner.orgs) {
      orgs = [...orgsByOwner.orgs];
    }

    return orgs.map(o => new Org(o.id, o.owner));
  }
}

export const getOrgContract = cache.cached(
  async (addressOrName: string, config: Config) => {
    return new ethers.Contract(addressOrName, config.abi.org, config.provider);
  },
  addressOrName => addressOrName,
);

export const resolveOrgOwner = cache.cached(
  async (org: ethers.Contract) => {
    return await Promise.all([org.owner(), org.resolvedAddress]);
  },
  org => org.address,
);
