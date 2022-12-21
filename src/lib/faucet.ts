import type { TransactionResponse } from "@ethersproject/providers";
import type { TypedDataSigner } from "@ethersproject/abstract-signer";
import type { Wallet } from "@app/lib/wallet";
import type { WalletConnectSigner } from "@app/lib/walletConnectSigner";

import * as ethers from "ethers";

import ethereumContractAbis from "@app/lib/ethereum/contractAbis.json";
import { assert } from "@app/lib/error";
import { toWei } from "@app/lib/utils";

type Signer = (ethers.Signer & TypedDataSigner) | WalletConnectSigner | null;

export async function withdraw(
  amount: string,
  signer: Signer,
  wallet: Wallet,
): Promise<TransactionResponse> {
  assert(signer);
  assert(wallet.radToken.faucet);

  const faucet = new ethers.Contract(
    wallet.radToken.faucet,
    ethereumContractAbis.faucet,
    signer,
  );

  return faucet.withdraw(wallet.radToken.address, toWei(amount));
}

export async function getMaxWithdrawAmount(
  signer: Signer,
  wallet: Wallet,
): Promise<ethers.BigNumber> {
  assert(signer);
  assert(wallet.radToken.faucet);

  const faucet = new ethers.Contract(
    wallet.radToken.faucet,
    ethereumContractAbis.faucet,
    signer,
  );

  return faucet.maxWithdrawAmount();
}

export async function calculateTimeLock(
  amount: string,
  signer: Signer,
  wallet: Wallet,
): Promise<ethers.BigNumber> {
  assert(signer);
  assert(wallet.radToken.faucet);

  const faucet = new ethers.Contract(
    wallet.radToken.faucet,
    ethereumContractAbis.faucet,
    signer,
  );

  return faucet.calculateTimeLock(toWei(amount));
}

export async function lastWithdrawalByUser(
  signer: Signer,
  wallet: Wallet,
): Promise<ethers.BigNumber> {
  assert(signer);
  assert(wallet.radToken.faucet);

  const address = signer.getAddress();

  const faucet = new ethers.Contract(
    wallet.radToken.faucet,
    ethereumContractAbis.faucet,
    signer,
  );

  return faucet.lastWithdrawalByUser(address);
}
