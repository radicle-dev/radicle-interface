import * as ethers from "ethers";
import type { TransactionResponse } from "@ethersproject/providers";
import type { ContractReceipt } from "@ethersproject/contracts";
import { OperationType } from "@gnosis.pm/safe-core-sdk-types";

import { assert } from "@app/error";
import * as utils from "@app/utils";
import * as cache from "@app/cache";
import type { SafeMultisigTransactionListResponse } from "@gnosis.pm/safe-service-client";
import type SafeServiceClient from "@gnosis.pm/safe-service-client";
import type { Safe } from "@app/utils";
import type { Config } from "@app/config";
import type { PendingAnchor, Anchor } from "@app/project";

const GetProjects = `
  query GetProjects($org: ID!) {
    projects(where: { org: $org }) {
      anchor {
        objectId
        multihash
        timestamp
      }
    }
  }
`;

const GetOrgs = `
  query GetOrgs {
    orgs {
      id
      owner
    }
  }
`;

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

  async getProjects(config: Config): Promise<Anchor[]> {
    const result = await utils.querySubgraph(
      config.orgs.subgraph,
      GetProjects,
      { org: this.address },
    );
    const projects: Anchor[] = [];

    for (const p of result.projects) {
      try {
        const proj: Anchor = {
          confirmed: true,
          id: utils.formatRadicleId(ethers.utils.arrayify(p.anchor.objectId)),
          anchor: {
            stateHash: utils.formatProjectHash(
              ethers.utils.arrayify(p.anchor.multihash),
            ),
          },
        };
        projects.push(proj);
      } catch (e) {
        console.error(e);
      }
    }
    return projects;
  }

  async getPendingProjects(config: Config): Promise<PendingAnchor[]> {
    if (!config.safe.client) return [];

    try {
      const orgAddr = ethers.utils.getAddress(this.address);
      const response = await getPendingProjects(
        ethers.utils.getAddress(this.owner),
        config.safe.client,
      );
      const projects: PendingAnchor[] = [];

      for (const tx of response.results || []) {
        if (tx.data && tx.to === orgAddr) {
          const anchor = parseAnchorTx(tx.data, config);
          const confirmations = tx.confirmations?.map(t => t.owner) || [];

          if (anchor) {
            projects.push({
              id: anchor.id,
              anchor: { stateHash: anchor.stateHash },
              confirmations,
              safeTxHash: tx.safeTxHash,
              confirmed: false,
            });
          }
        }
      }
      return projects;
    } catch {
      return [];
    }
  }

  static async getAnchor(
    orgAddr: string,
    urn: string,
    config: Config,
  ): Promise<string | null> {
    const org = new ethers.Contract(orgAddr, config.abi.org, config.provider);
    const unpadded = utils.decodeRadicleId(urn);
    const id = ethers.utils.zeroPad(unpadded, 32);

    try {
      const [, hash] = await org.anchors(id);
      const anchor = utils.formatProjectHash(ethers.utils.arrayify(hash));

      return anchor;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async getMulti(ids: string[], config: Config): Promise<Array<Org>> {
    const results = await Promise.all(ids.map(addr => Org.get(addr, config)));
    const orgs = results.filter((org): org is Org => org !== null);

    return orgs;
  }

  static async getAll(config: Config): Promise<Array<Org>> {
    const result = await utils.querySubgraph(config.orgs.subgraph, GetOrgs, {});
    const orgs: Org[] = [];

    for (const o of result.orgs) {
      try {
        orgs.push(new Org(o.id, o.owner));
      } catch (e) {
        console.error(e);
      }
    }
    return orgs;
  }

  static fromReceipt(receipt: ContractReceipt): Org | null {
    const event = receipt.events?.find(e => e.event === "OrgCreated");

    if (event && event.args) {
      const address = event.args[0];
      const owner = event.args[1];

      return new Org(address, owner);
    }
    return null;
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
    const safes = safesByOwner.safes.reduce(
      (prev: any, curr: Safe) => prev.concat(curr.id),
      [],
    );
    const orgsByOwner = await utils.querySubgraph(
      config.orgs.subgraph,
      GetOrgsByOwners,
      { owners: [...safes, owner] },
    );
    const orgs: { id: string; owner: string }[] = [...orgsByOwner.orgs];

    return orgs.map(o => new Org(o.id, o.owner));
  }

  static async createMultiSig(
    owners: [string],
    threshold: number,
    config: Config,
  ): Promise<TransactionResponse> {
    assert(config.signer);

    const orgFactory = new ethers.Contract(
      config.orgFactory.address,
      config.abi.orgFactory,
      config.signer,
    );

    return orgFactory["createOrg(address[],uint256)"](owners, threshold, {
      gasLimit: config.gasLimits.createOrg,
    });
  }

  static async create(
    owner: string,
    config: Config,
  ): Promise<TransactionResponse> {
    assert(config.signer);

    const orgFactory = new ethers.Contract(
      config.orgFactory.address,
      config.abi.orgFactory,
      config.signer,
    );

    return orgFactory["createOrg(address)"](owner, {
      gasLimit: config.gasLimits.createOrg,
    });
  }
}

export function parseAnchorTx(
  data: string,
  config: Config,
): { id: string; stateHash: string } | null {
  const iface = new ethers.utils.Interface(config.abi.org);
  const parsedTx = iface.parseTransaction({ data });

  if (parsedTx.name === "anchor") {
    const encodedProjectUrn = parsedTx.args[0];
    const encodedCommitHash = parsedTx.args[2];
    const id = utils.formatRadicleId(
      ethers.utils.arrayify(`${encodedProjectUrn}`),
    );
    const byteArray = ethers.utils.arrayify(encodedCommitHash);
    const stateHash = utils.formatProjectHash(byteArray);

    return { id, stateHash };
  }
  return null;
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

export const getPendingProjects = cache.cached(
  async (
    owner: string,
    client: SafeServiceClient,
  ): Promise<SafeMultisigTransactionListResponse> => {
    try {
      return await client.getPendingTransactions(
        ethers.utils.getAddress(owner),
      );
    } catch (e) {
      return { count: 0, results: [] };
    }
  },
  owner => owner,
  { max: 1000, ttl: 5 * 60 * 1000 }, // Cache results for 5 minutes.
);
