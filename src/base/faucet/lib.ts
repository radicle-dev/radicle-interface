import * as ethers from "ethers";

import type { Config } from "@app/config";
import { assert } from "@app/error";
import type { TransactionResponse } from "@ethersproject/providers";
import { toWei } from "@app/utils";
import type { WalletConnectSigner } from "@app/WalletConnectSigner";
import type { TypedDataSigner } from "@ethersproject/abstract-signer";

type Signer = (ethers.Signer & TypedDataSigner) | WalletConnectSigner | null;

export async function withdraw(
  amount: string,
  signer: Signer,
  config: Config,
): Promise<TransactionResponse> {
  assert(signer);

  const faucet = new ethers.Contract(
    config.radToken.faucet,
    config.abi.faucet,
    signer,
  );

  return faucet.withdraw(config.radToken.address, toWei(amount));
}

export async function getMaxWithdrawAmount(
  signer: Signer,
  config: Config,
): Promise<ethers.BigNumber> {
  assert(signer);

  const faucet = new ethers.Contract(
    config.radToken.faucet,
    config.abi.faucet,
    signer,
  );

  return faucet.maxWithdrawAmount();
}

export async function calculateTimeLock(
  amount: string,
  signer: Signer,
  config: Config,
): Promise<ethers.BigNumber> {
  assert(signer);

  const faucet = new ethers.Contract(
    config.radToken.faucet,
    config.abi.faucet,
    signer,
  );

  return faucet.calculateTimeLock(toWei(amount));
}

export async function lastWithdrawalByUser(
  signer: Signer,
  config: Config,
): Promise<ethers.BigNumber> {
  assert(signer);

  const address = signer.getAddress();

  const faucet = new ethers.Contract(
    config.radToken.faucet,
    config.abi.faucet,
    signer,
  );

  return faucet.lastWithdrawalByUser(address);
}
