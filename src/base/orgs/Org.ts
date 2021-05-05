import * as ethers from 'ethers';
import type { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import type { ContractReceipt } from '@ethersproject/contracts';

import type { Config } from '@app/config';

const orgFactoryAbi = [
  "function createOrg(address[], uint256) returns (address)",
  "event OrgCreated(address, address)",
];

const orgAbi = ["function owner() view returns (address)"];

export class Org {
  address: string
  safe: string

  constructor(address: string, safe: string) {
    this.address = address;
    this.safe = safe;
  }

  async lookupAddress(config: Config): Promise<string> {
    return await config.provider.lookupAddress(this.address);
  }

  async resolveName(config: Config): Promise<string> {
    return await config.provider.resolveName(this.address);
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
      let safe = await org.owner();
      return new Org(address, safe);
    } catch (e) {
      console.error(e);
      return null;
    }
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

    return orgFactory.createOrg([owner], 1, {
      gasLimit: config.gasLimits.createOrg
    });
  }
}
