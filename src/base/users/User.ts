import type { Config } from "@app/config";
import type { TransactionResponse } from "@ethersproject/providers";

import * as ethers from "ethers";

import { assert } from "@app/error";

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
      config.signer,
    );
    return reverseRegistrar.setName(name);
  }
}
