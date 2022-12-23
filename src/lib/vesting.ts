import type { Wallet } from "@app/lib/wallet";
import type { TransactionResponse } from "@ethersproject/abstract-provider";

import { BigNumber, ethers } from "ethers";
import { writable } from "svelte/store";

import * as cache from "@app/lib/cache";
import * as modal from "@app/lib/modal";
import * as session from "@app/lib/session";
import * as utils from "@app/lib/utils";
import ethereumContractAbis from "@app/lib/ethereum/contractAbis.json";

import ErrorModal from "@app/components/ErrorModal.svelte";

export interface VestingInfo {
  token: string;
  symbol: string;
  beneficiary: string;
  totalVesting: string;
  withdrawableBalance: string;
  withdrawn: string;
  cliffPeriod: string;
  vestingStartTime: string;
  vestingPeriod: string;
}

export type VestingState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "withdrawingSign" }
  | { type: "withdrawing"; tx: TransactionResponse }
  | { type: "withdrawn" };

export const state = writable<VestingState>({ type: "idle" });

export async function withdrawVested(
  address: string,
  wallet: Wallet,
): Promise<void> {
  if (!wallet.signer) {
    modal.show({
      component: ErrorModal,
      props: {
        title: "Withdraw failed",
        caption: "No signer available. Is your wallet connected?",
      },
    });
    return;
  }

  const contract = new ethers.Contract(
    address,
    ethereumContractAbis.vesting,
    wallet.provider,
  );
  const signer = wallet.signer;

  state.set({ type: "withdrawingSign" });

  try {
    const tx: TransactionResponse = await contract
      .connect(signer)
      .withdrawVested();

    state.set({ type: "withdrawing", tx });
    await tx.wait();
  } catch (e) {
    handleEtherErrorState(e, "Unknown error, check the dev console");
    return;
  }
  session.state.refreshBalance(wallet);
  state.set({ type: "withdrawn" });
}

export const getInfo = cache.cached(
  async (address: string, wallet: Wallet): Promise<VestingInfo | undefined> => {
    const contract = getVestingContract(address, wallet);

    let vestingInfo:
      | [
          string,
          string,
          BigNumber,
          BigNumber,
          BigNumber,
          string,
          string,
          string,
        ]
      | undefined = undefined;
    let token: string | undefined = undefined;

    try {
      token = await contract.token();
      if (!token) {
        return undefined;
      }

      const tokenContract = new ethers.Contract(
        token,
        ethereumContractAbis.token,
        wallet.provider,
      );

      vestingInfo = await Promise.all([
        tokenContract.symbol(),
        contract.beneficiary(),
        contract.withdrawableBalance(),
        contract.withdrawn(),
        contract.totalVestingAmount(),
        contract.vestingStartTime(),
        contract.vestingPeriod(),
        contract.cliffPeriod(),
      ]);
    } catch (e) {
      console.warn(e);
      return undefined;
    }

    const [
      symbol,
      beneficiary,
      withdrawable,
      withdrawn,
      total,
      vestingStartTime,
      vestingPeriod,
      cliffPeriod,
    ] = vestingInfo;

    return {
      token,
      symbol,
      beneficiary,
      withdrawableBalance: utils.formatBalance(withdrawable),
      withdrawn: utils.formatBalance(withdrawn),
      totalVesting: utils.formatBalance(total),
      vestingStartTime,
      vestingPeriod,
      cliffPeriod,
    };
  },
  address => address,
  { max: 1000 },
);

export function parseVestingPeriods(...timestamps: string[]): string {
  const sum = timestamps
    .map(timestamp => parseInt(timestamp))
    .reduce((prev, curr) => prev + curr, 0);
  return new Date(sum * 1000).toDateString();
}

export function getVestingContract(address: string, wallet: Wallet) {
  return new ethers.Contract(
    address,
    ethereumContractAbis.vesting,
    wallet.provider,
  );
}

export function handleEtherErrorState(e: unknown, message: string): void {
  const error =
    typeof e === "object" &&
    e !== null &&
    "reason" in e &&
    typeof e.reason === "string"
      ? e.reason
      : message;

  modal.show({
    component: ErrorModal,
    props: {
      title: "Withdraw failed",
      error,
    },
  });
  console.warn(e);
}
