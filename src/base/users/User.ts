import * as ethers from "ethers";
import type { Wallet } from "@app/wallet";
import { assert } from "@app/error";
import type { TransactionResponse } from "@ethersproject/providers";
import ethereumContractAbis from "@app/ethereum/contractAbis.json";

export class User {
  address: string;

  constructor(address: string) {
    assert(ethers.utils.isAddress(address), "address must be valid");

    this.address = address.toLowerCase(); // Don't store address checksum.
  }

  async setName(name: string, wallet: Wallet): Promise<TransactionResponse> {
    assert(wallet.signer);

    const reverseRegistrar = new ethers.Contract(
      wallet.reverseRegistrar.address,
      ethereumContractAbis.reverseRegistrar,
      wallet.signer,
    );
    return reverseRegistrar.setName(name);
  }
}
