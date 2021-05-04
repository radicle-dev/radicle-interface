// TODO: Handle wallet account change.
import { get, writable, derived, Writable } from "svelte/store";
import { ethers } from "ethers";
import type { BigNumber } from 'ethers';
import type { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import type { Config } from "@app/config";
import { Unreachable, assert, assertEq } from "@app/error";

export enum Connection {
  Disconnected,
  Connecting,
  Connected
}

export type TxState =
    { state: 'signing' }
  | { state: 'pending', hash: string }
  | { state: 'success', hash: string, blockHash: string, blockNumber: number }
  | { state: 'fail', hash: string, blockHash: string, blockNumber: number, error: string }
  | null;

export type State =
    { connection: Connection.Disconnected }
  | { connection: Connection.Connecting }
  | { connection: Connection.Connected, session: Session };

export interface Session {
  address: string
  tokenBalance: any
  tx: TxState
}

export const createState = (initial: State) => {
  const store = writable<State>(initial)

  return {
    subscribe: store.subscribe,
    connect: async (config: Config) => {
      let state = get(store);

      assertEq(state.connection, Connection.Disconnected);
      store.set({ connection: Connection.Connecting });

      // TODO: This hangs on Brave, if you have to unlock your wallet..
      try {
        let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (e) {
        console.error(e);
      }

      const token = new ethers.Contract(config.radToken.address, tokenAbi, config.provider);
      const signer = config.provider.getSigner();
      const address = await signer.getAddress();

      try {
        const tokenBalance = await token.balanceOf(address);
        store.set({
          connection: Connection.Connected,
          session: { address, tokenBalance, tx: null }
        });
      } catch (e) {
        console.error(e);
      }
    },

    updateBalance: (n: BigNumber) => {
      store.update((s) => {
        assert(s.connection === Connection.Connected);
        s.session.tokenBalance = s.session.tokenBalance.add(n);
        return s;
      });
    },

    refreshBalance: async (config: Config) => {
      let state = get(store);
      assert(state.connection === Connection.Connected);
      const addr = state.session.address;

      try {
        const token = new ethers.Contract(config.radToken.address, tokenAbi, config.provider);
        const tokenBalance = await token.balanceOf(addr);

        state.session.tokenBalance = tokenBalance;
        store.set(state);
      } catch (e) {
        console.error(e);
      }
    },

    setTxSigning: () => {
      store.update(s => {
        switch (s.connection) {
          case Connection.Connected:
            s.session.tx = { state: 'signing' };
            return s;
          default:
            throw new Unreachable();
        }
      });
    },

    setTxPending: (tx: TransactionResponse) => {
      store.update(s => {
        switch (s.connection) {
          case Connection.Connected:
            assert(s.session.tx !== null);
            assert(s.session.tx.state === 'signing');

            s.session.tx = { state: 'pending', hash: tx.hash };
            return s;
          default:
            throw new Unreachable();
        }
      });
    },

    setTxConfirmed: (tx: TransactionReceipt) => {
      store.update(s => {
        switch (s.connection) {
          case Connection.Connected:
            assert(s.session.tx !== null);
            assert(s.session.tx.state === 'pending');

            if (tx.status === 1) {
              s.session.tx = {
                state: 'success',
                hash: s.session.tx.hash,
                blockHash: tx.blockHash,
                blockNumber: tx.blockNumber
              };
            } else {
              s.session.tx = {
                state: 'fail',
                hash: s.session.tx.hash,
                blockHash: tx.blockHash,
                blockNumber: tx.blockNumber,
                error: "Failed"
              };
            }
            return s;
          default:
            throw new Unreachable();
        }
      });
    },
  };
};

export const state = createState({ connection: Connection.Disconnected });
export const session = derived(state, s => {
  if (s.connection === Connection.Connected) {
    return s.session;
  }
  return null;
});

state.subscribe(s => {
  console.log("session.state", s);
});

const tokenAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
];

export async function approveSpender(spender: string, amount: BigNumber, config: Config) {
  const token = new ethers.Contract(config.radToken.address, tokenAbi, config.provider);
  const signer = config.provider.getSigner();
  const addr = await signer.getAddress();

  const allowance = await token.allowance(addr, spender);

  if (allowance < amount) {
    let tx = await token.connect(signer).approve(spender, amount);
    await tx.wait();
  }
}

export function disconnectWallet() {
  location.reload();
}
