import { ethers } from "ethers";
import { formatBalance } from "@app/utils";
import * as session from "@app/session";
import { State, state } from "./state";
import type { Config } from "@app/config";


export interface VestingInfo {
  token: string,
  symbol: string,
  beneficiary: string,
  totalVesting: string,
  withdrawableBalance: string,
  withdrawn: string
}

export async function withdrawVested(address: string, config: Config) {
  const contract = new ethers.Contract(address, config.abi.vesting, config.provider);
  const signer = config.provider.getSigner();

  state.set(State.WithdrawingSign);

  let tx = await contract.connect(signer).withdrawVested();

  state.set(State.Withdrawing);
  await tx.wait();
  session.state.refreshBalance(config);
  state.set(State.Withdrawn);
}

export async function getInfo(address: string, config: Config): Promise<VestingInfo> {
  const contract = new ethers.Contract(address, config.abi.vesting, config.provider);
  const signer = config.provider.getSigner();

  const token = await contract.token();
  const beneficiary = await contract.beneficiary();
  const withdrawable = await contract.withdrawableBalance();
  const withdrawn = await contract.withdrawn();
  const total = await contract.totalVestingAmount();

  const tokenContract = new ethers.Contract(token, config.abi.token, config.provider);
  const symbol = await tokenContract.symbol();

  return {
    token: token,
    symbol: symbol,
    beneficiary: beneficiary,
    totalVesting: formatBalance(total),
    withdrawableBalance: formatBalance(withdrawable),
    withdrawn: formatBalance(withdrawn),
  };
}

