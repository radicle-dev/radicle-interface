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

  static fromReceipt(receipt: ContractReceipt): Org {
    let event = receipt.events.find(e => e.event === 'OrgCreated');
    let address = event.args[0];
    let safe = event.args[1];

    return new Org(address, safe);
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
    return await orgFactory.createOrg([owner], 1);
  }
}
