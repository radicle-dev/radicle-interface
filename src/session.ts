import { get, writable, derived, Readable } from "svelte/store";
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
  tokenBalance: BigNumber
  tx: TxState
}

export interface Store extends Readable<State> {
  connect(config: Config): Promise<void>;
  updateBalance(n: BigNumber): void;
  refreshBalance(config: Config): Promise<void>;

  setTxSigning(): void;
  setTxPending(tx: TransactionResponse): void;
  setTxConfirmed(tx: TransactionReceipt): void;
  setChangedAccount([address]: string[]): void;
}

export const loadState = (initial: State): Store => {
  const store = writable<State>(initial);

  const session = window.localStorage.getItem("session");
  if (session) store.set({ connection: Connection.Connected, session: JSON.parse(session) });

  return {
    subscribe: store.subscribe,
    connect: async (config: Config) => {
      const state = get(store);

      assertEq(state.connection, Connection.Disconnected);
      store.set({ connection: Connection.Connecting });

      // TODO: This hangs on Brave, if you have to unlock your wallet..
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (e) {
        console.error(e);
      }

      const token = new ethers.Contract(config.radToken.address, config.abi.token, config.provider);
      const signer = config.provider.getSigner();
      const address = await signer.getAddress();

      try {
        const tokenBalance: BigNumber = await token.balanceOf(address);
        store.set({
          connection: Connection.Connected,
          session: { address, tokenBalance, tx: null }
        });
        window.localStorage.setItem("session", JSON.stringify({ address, tokenBalance, tx: null }));
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
      const state = get(store);
      assert(state.connection === Connection.Connected);
      const addr = state.session.address;

      try {
        const token = new ethers.Contract(config.radToken.address, config.abi.token, config.provider);
        const tokenBalance: BigNumber = await token.balanceOf(addr);

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
    setChangedAccount: ([address]: string[]) => {
      store.update(s => {
        switch (s.connection) {
          case Connection.Connected:
            // In case of locking Metamask the accountsChanged event returns undefined.
            // To prevent out of sync state, the wallet gets disconnected.
            if (address === undefined) disconnectWallet();
            else {
              s.session.address = address;
              window.localStorage.setItem("session", JSON.stringify({ address, tokenBalance: s.session.tokenBalance, tx: s.session.tx }));
            }
            return s;
          default:
            return s;
        }
      });
    }
  };
};

export const state = loadState({ connection: Connection.Disconnected });
export const session = derived(state, s => {
  if (s.connection === Connection.Connected) {
    return s.session;
  }
  return null;
});

window.ethereum?.on('chainChanged', () => location.reload());

// Updates state when user changes accounts
window.ethereum?.on("accountsChanged", state.setChangedAccount);

state.subscribe(s => {
  console.log("session.state", s);
});

export async function approveSpender(spender: string, amount: BigNumber, config: Config): Promise<void> {
  const token = new ethers.Contract(config.radToken.address, config.abi.token, config.provider);
  const signer = config.provider.getSigner();
  const addr = await signer.getAddress();

  const allowance = await token.allowance(addr, spender);

  if (allowance < amount) {
    const tx = await token.connect(signer).approve(spender, amount);
    await tx.wait();
  }
}

export function token(config: Config): ethers.Contract {
  return new ethers.Contract(config.radToken.address, config.abi.token, config.provider);
}

export function disconnectWallet(): void {
  window.localStorage.removeItem("session");
  location.reload();
}
