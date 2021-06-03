import * as ethers from 'ethers';
import type { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import type { ContractReceipt } from '@ethersproject/contracts';
import { assert } from '@app/error';
import * as utils from '@app/utils';
import type { Config } from '@app/config';
import type { Project } from '@app/base/projects/Project';

const GetProjects = `
  query GetProjects($org: ID!) {
    projects(where: { org: $org }) {
      id
      stateHash
      stateHashFormat
    }
  }
`;

// TODO: Add timestamps to org creation.
const GetOrgs = `
  query GetOrgs {
    orgs {
      id
      owner
    }
  }
`;

const orgFactoryAbi = [
  "function createOrg(address) returns (address)",
  "function createOrg(address[], uint256) returns (address)",
  "event OrgCreated(address, address)",
];

const orgAbi = [
  "function owner() view returns (address)",
  "function setOwner(address)",
  "function setName(string, address) returns (bytes32)",
];

export class Org {
  address: string
  owner: string

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
      orgAbi,
      config.signer
    );
    return org.setName(name, config.provider.network.ensAddress,
      { gasLimit: 200_000 });
  }

  async setOwner(address: string, config: Config): Promise<TransactionResponse> {
    assert(config.signer);

    const org = new ethers.Contract(
      this.address,
      orgAbi,
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
    const result = await utils.querySubgraph(GetProjects, { org: this.address }, config);
    let projects: Project[] = [];

    for (let p of result.projects) {
      try {
        p.id = utils.formatRadicleId(ethers.utils.arrayify(p.id));
        p.stateHash = utils.formatProjectHash(
          ethers.utils.arrayify(p.stateHash),
          p.stateHashFormat
        );
        projects.push(p);
      } catch (e) {
        console.error(e);
      }
    }
    return projects;
  }

  static async getAll(config: Config): Promise<Array<Org>> {
    const result = await utils.querySubgraph(GetOrgs, {}, config);
    console.log(result);
    let orgs: Org[] = [];

    for (let o of result.orgs) {
      try {
        orgs.push(new Org(o.id, o.owner));
      } catch (e) {
        console.error(e);
      }
    }
    return orgs;
  }

  static fromReceipt(receipt: ContractReceipt): Org | null {
    let event = receipt.events?.find(e => e.event === 'OrgCreated');

    if (event && event.args) {
      let address = event.args[0];
      let owner = event.args[1];

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
      orgAbi,
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

  static async createMultiSig(
    owners: [string],
    threshold: number,
    config: Config,
  ): Promise<TransactionResponse> {
    assert(config.signer);

    const orgFactory = new ethers.Contract(
      config.orgFactory.address,
      orgFactoryAbi,
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
      orgFactoryAbi,
      config.signer
    );

    return orgFactory['createOrg(address)'](owner, {
      gasLimit: config.gasLimits.createOrg
    });
  }
}
