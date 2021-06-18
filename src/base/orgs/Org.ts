import * as ethers from 'ethers';
import type { TransactionResponse } from '@ethersproject/providers';
import type { ContractReceipt } from '@ethersproject/contracts';
import { assert } from '@app/error';
import * as utils from '@app/utils';
import type { Config } from '@app/config';
import type { Project } from '@app/project';

const GetProjects = `
  query GetProjects($org: ID!) {
    projects(where: { org: $org }) {
      id
      anchor {
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

const GetSafes = `
  query GetSafes($owners: [String!]!) {
    wallets(where: { owners_contains: $owners }) {
      id
      owners
    }
  }
`;

const GetOrgsByOwner = `
  query GetOrgsByOwner($owners: [String!]!) {
    orgs(where: { owner_in: $owners }) {
      id
      owner
      creator
      timestamp
    }
  }
`;

export class Org {
  address: string;
  owner: string;

  constructor(address: string, owner: string) {
    assert(ethers.utils.isAddress(address), "address must be valid");

    this.address = address.toLowerCase(); // Don't store address checksum.
    this.owner = owner;
  }

  async lookupAddress(config: Config): Promise<string> {
    return await config.provider.lookupAddress(this.address);
  }

  async setName(name: string, config: Config): Promise<TransactionResponse> {
    assert(config.signer);

    const org = new ethers.Contract(
      this.address,
      config.abi.org,
      config.signer
    );
    return org.setName(name, config.provider.network.ensAddress,
      { gasLimit: 200_000 });
  }

  async setOwner(address: string, config: Config): Promise<TransactionResponse> {
    assert(config.signer);

    const org = new ethers.Contract(
      this.address,
      config.abi.org,
      config.signer
    );
    return org.setOwner(address);
  }

  async getMembers(config: Config): Promise<Array<string>> {
    const safe = await utils.getSafe(this.owner, config);
    if (safe) {
      return safe.owners;
    }
    return [];
  }

  async getProjects(config: Config): Promise<Array<Project>> {
    const result = await utils.querySubgraph(
      config.orgs.subgraph, GetProjects, { org: this.address }
    );
    const projects: Project[] = [];

    for (const p of result.projects) {
      try {
        const proj: Project = {
          id: utils.formatRadicleId(ethers.utils.arrayify(p.id)),
          anchor: {
            stateHash: utils.formatProjectHash(
              ethers.utils.arrayify(p.anchor.multihash),
            )
          },
        };
        projects.push(proj);
      } catch (e) {
        console.error(e);
      }
    }
    return projects;
  }

  static async getAnchor(orgAddr: string, urn: string, config: Config): Promise<string | null> {
    const org = new ethers.Contract(
      orgAddr,
      config.abi.org,
      config.provider
    );
    const unpadded = utils.parseRadicleId(urn);
    const id = ethers.utils.zeroPad(unpadded, 32);

    try {
      const [,hash] = await org.anchors(id);
      const anchor = utils.formatProjectHash(ethers.utils.arrayify(hash));

      return anchor;
    } catch (e) {
      console.error(e);
      return null;
    }
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
    const event = receipt.events?.find(e => e.event === 'OrgCreated');

    if (event && event.args) {
      const address = event.args[0];
      const owner = event.args[1];

      return new Org(address, owner);
    }
    return null;
  }

  static async get(
    address: string,
    config: Config,
  ): Promise<Org | null> {
    const org = new ethers.Contract(
      address,
      config.abi.org,
      config.provider
    );

    try {
      const owner = await org.owner();
      const resolved = await org.resolvedAddress;
      return new Org(resolved, owner);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async getOrgsByMember(memberAddr: string, config: Config): Promise<Org[]> {
    const safeResult = await utils.querySubgraph(
      config.safe.subgraph, GetSafes, { owners: [memberAddr] }
    );
    const wallets: { id: string }[] = safeResult.wallets;
    const owners = wallets.map(wallet => wallet.id).concat([memberAddr]);
    const orgsResult = await utils.querySubgraph(config.orgs.subgraph, GetOrgsByOwner, { owners });

    return orgsResult.orgs.map((o: { id: string; owner: string }) => {
      return new Org(o.id, o.owner);
    });
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
      config.signer
    );

    return orgFactory['createOrg(address[],uint256)'](owners, threshold, {
      gasLimit: config.gasLimits.createOrg
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
      config.signer
    );

    return orgFactory['createOrg(address)'](owner, {
      gasLimit: config.gasLimits.createOrg
    });
  }
}
