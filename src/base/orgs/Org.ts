import * as ethers from 'ethers';
import type { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import type { ContractReceipt } from '@ethersproject/contracts';
import { assert } from '@app/error';

import type { Config } from '@app/config';

const orgFactoryAbi = [
  "function createOrg(address) returns (address)",
  "function createOrg(address[], uint256) returns (address)",
  "event OrgCreated(address, address)",
];

const orgAbi = [
  "function owner() view returns (address)",
  "function setName(string, address) returns (bytes32)",
];

export class Org {
  address: string
  safe: string

  constructor(address: string, safe: string) {
    assert(ethers.utils.isAddress(address), "address must be valid");

    this.address = address;
    this.safe = safe;
  }

  async lookupAddress(config: Config): Promise<string> {
    return await config.provider.lookupAddress(this.address);
  }

  async setName(name: string, config: Config): Promise<TransactionResponse> {
    const org = new ethers.Contract(
      this.address,
      orgAbi,
      config.signer
    );
    return org.setName(name, config.provider.network.ensAddress,
      { gasLimit: 200_000 });
  }

  static fromReceipt(receipt: ContractReceipt): Org | null {
    let event = receipt.events?.find(e => e.event === 'OrgCreated');

    if (event && event.args) {
      let address = event.args[0];
      let safe = event.args[1];

      return new Org(address, safe);
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
      const safe = await org.owner();
      const resolved = await org.resolvedAddress;
      return new Org(resolved, safe);
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
