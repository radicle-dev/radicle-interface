import type { TransactionResponse } from "@ethersproject/providers";
import type { TypedDataSigner } from "@ethersproject/abstract-signer";

import * as ethers from "ethers";
import ethereumContractAbis from "@app/lib/ethereum/contractAbis.json";
import networks from "./ethereum/networks";
import { get } from "svelte/store";
import { networkStore } from "./session";
import { toWei } from "@app/lib/utils";

type Signer = ethers.Signer & TypedDataSigner;

export async function withdraw(
  amount: string,
  faucetAddress: string,
  signer: Signer,
): Promise<TransactionResponse> {
  const faucet = new ethers.Contract(
    faucetAddress,
    ethereumContractAbis.faucet,
    signer,
  );
  const network = get(networkStore);
  const contracts = networks[network.chainId];
  return faucet.withdraw(contracts.radToken.address, toWei(amount));
}

export async function getMaxWithdrawAmount(
  faucetAddress: string,
  signer: Signer,
): Promise<ethers.BigNumber> {
  const faucet = new ethers.Contract(
    faucetAddress,
    ethereumContractAbis.faucet,
    signer,
  );

  return faucet.maxWithdrawAmount();
}

export async function calculateTimeLock(
  amount: string,
  faucetAddress: string,
  signer: Signer,
): Promise<ethers.BigNumber> {
  const faucet = new ethers.Contract(
    faucetAddress,
    ethereumContractAbis.faucet,
    signer,
  );

  return faucet.calculateTimeLock(toWei(amount));
}

export async function lastWithdrawalByUser(
  faucetAddress: string,
  signer: Signer,
): Promise<ethers.BigNumber> {
  const address = signer.getAddress();

  const faucet = new ethers.Contract(
    faucetAddress,
    ethereumContractAbis.faucet,
    signer,
  );

  return faucet.lastWithdrawalByUser(address);
}
