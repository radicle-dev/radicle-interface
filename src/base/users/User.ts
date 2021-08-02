import * as ethers from 'ethers';
import type { Config } from '@app/config';
import { assert } from '@app/error';
import type { TransactionResponse } from '@ethersproject/providers';

export class User {
  address: string;

  constructor(address: string) {
    assert(ethers.utils.isAddress(address), "address must be valid");

    this.address = address.toLowerCase(); // Don't store address checksum.
  }

  async setName(name: string, config: Config): Promise<TransactionResponse> {
    assert(config.signer);

    const reverseRegistrar = new ethers.Contract(
      config.reverseRegistrar.address,
      config.abi.reverseRegistrar,
      config.signer
    );
    return reverseRegistrar.setName(name, this.address);
  }
}
