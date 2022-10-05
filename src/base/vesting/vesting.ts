import type { Config } from "@app/config";

import { ethers } from "ethers";
import { assert } from "@app/error";
import { writable } from "svelte/store";

import * as session from "@app/session";
import * as utils from "@app/utils";

export interface VestingInfo {
  token: string;
  symbol: string;
  beneficiary: string;
  totalVesting: string;
  withdrawableBalance: string;
  withdrawn: string;
}

export const state = writable<
  "idle" | "loading" | "withdrawingSign" | "withdrawing" | "withdrawn"
>("idle");

export async function withdrawVested(
  address: string,
  config: Config,
): Promise<void> {
  assert(config.signer);

  const contract = new ethers.Contract(
    address,
    config.abi.vesting,
    config.provider,
  );
  const signer = config.signer;

  state.set("withdrawingSign");

  const tx = await contract.connect(signer).withdrawVested();

  state.set("withdrawing");
  await tx.wait();
  session.state.refreshBalance(config);
  state.set("withdrawn");
}

export async function getInfo(
  address: string,
  config: Config,
): Promise<VestingInfo> {
  const contract = new ethers.Contract(
    address,
    config.abi.vesting,
    config.provider,
  );
  const token = await contract.token();
  const beneficiary = await contract.beneficiary();
  const withdrawable = await contract.withdrawableBalance();
  const withdrawn = await contract.withdrawn();
  const total = await contract.totalVestingAmount();

  const tokenContract = new ethers.Contract(
    token,
    config.abi.token,
    config.provider,
  );
  const symbol = await tokenContract.symbol();

  return {
    token: token,
    symbol: symbol,
    beneficiary: beneficiary,
    totalVesting: utils.formatBalance(total),
    withdrawableBalance: utils.formatBalance(withdrawable),
    withdrawn: utils.formatBalance(withdrawn),
  };
}
