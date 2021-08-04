import { get, writable, derived, Readable } from "svelte/store";
import type { BigNumber } from 'ethers';
import type { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { Config, getConfig } from "@app/config";
import { Unreachable, assert, assertEq } from "@app/error";
import { formatNetwork } from "@app/utils";
import * as ethers from "ethers";

export enum Connection {
  Disconnected,
  Connecting,
  Connected
}

export type TxState =
    { state: 'signing' }
  | { state: 'pending'; hash: string }
  | { state: 'success'; hash: string; blockHash: string; blockNumber: number }
  | { state: 'fail'; hash: string; blockHash: string; blockNumber: number; error: string }
  | null;

export type State =
    { connection: Connection.Disconnected }
  | { connection: Connection.Connecting }
  | { connection: Connection.Connected; session: Session };

export interface Session {
  address: string;
  tokenBalance: BigNumber | null; // `null` means it isn't loaded yet.
  tx: TxState;
}

export interface Store extends Readable<State> {
  connectMetamask(config: Config): Promise<void>;
  connectWalletConnect(config: Config): Promise<void>;
  updateBalance(n: BigNumber): void;
  refreshBalance(config: Config): Promise<void>;
  setTxSigning(): void;
  setTxPending(tx: TransactionResponse): void;
  setTxConfirmed(tx: TransactionReceipt): void;
  setChangedAccount(address: string): void;
}

export const loadState = (initial: State): Store => {
  const store = writable<State>(initial);
  const metamask = window.localStorage.getItem("metamask");

  if (metamask) {
    store.set({ connection: Connection.Connected, session: JSON.parse(metamask) });
  }

  return {
    subscribe: store.subscribe,
    connectMetamask: async (config: Config) => {
      assert(config.metamaskSigner);

      const state = get(store);

      assertEq(state.connection, Connection.Disconnected || Connection.Connecting);
      store.set({ connection: Connection.Connecting });

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const signer = config.metamaskSigner;
      const address = await signer.getAddress();

      config.setSigner(signer);

      try {
        config.walletConnect.state.set({ state: "close" });

        const tokenBalance: BigNumber = await config.token.balanceOf(address);
        const session = { address, tokenBalance, tx: null };

        store.set({
          connection: Connection.Connected,
          session,
        });
        saveSession({ ...session });
      } catch (e) {
        console.error(e);
      }
    },

    connectWalletConnect: async (config: Config) => {
      store.set({ connection: Connection.Connecting });
      const signer = config.getWalletConnectSigner();

      try {
        await config.walletConnect.client.connect();
        console.log("WalletConnect: connected.");

        const address = await signer.getAddress();
        const tokenBalance: BigNumber = await config.token.balanceOf(address);
        const session = { address, tokenBalance, tx: null };
        const network = await ethers.providers.getNetwork(
          signer.walletConnect.chainId
        );

        if (network.chainId !== config.network.chainId) {
          config.walletConnect.client.killSession();
          throw new Error(
            `Network mismatch. Please switch your wallet to ${formatNetwork(config.network)}.`
          );
        }
        store.set({ connection: Connection.Connected, session });
      } catch (e) {
        console.log("WalletConnect: connection failed.");
        store.set({ connection: Connection.Disconnected });

        // There seems to be no way to detect this "error" caused by the user
        // closing the modal dialog, besides matching on the message string.
        // Welcome to the wonderful ghetto that is WalletConnect.
        //
        // Since it's not really an error, we don't throw if this is what happened.
        if (e.message !== "User close QRCode Modal") {
          throw e;
        }
      }
    },

    updateBalance: (n: BigNumber) => {
      store.update((s: State) => {
        assert(s.connection === Connection.Connected);
        if (s.session.tokenBalance) {
          // If the token balance is loaded, we can update it, otherwise
          // we let it finish loading.
          s.session.tokenBalance = s.session.tokenBalance.add(n);
        }
        return s;
      });
    },

    refreshBalance: async (config: Config) => {
      const state = get(store);
      assert(state.connection === Connection.Connected);
      const addr = state.session.address;

      try {
        const tokenBalance: BigNumber = await config.token.balanceOf(addr);

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

    setChangedAccount: (address: string) => {
      store.update(s => {
        switch (s.connection) {
          case Connection.Connected:
            // In case of locking Metamask the accountsChanged event returns undefined.
            // To prevent out of sync state, the wallet gets disconnected.
            if (address === undefined) {
              disconnectMetamask();
            } else {
              s.session.address = address;
              saveSession(s.session);
            }
            return s;
          default:
            return s;
        }
      });
    },
  };
};

export const state = loadState({ connection: Connection.Disconnected });

export const session = derived(state, s => {
  if (s.connection === Connection.Connected) {
    return s.session;
  }
  return null;
});

window.ethereum?.on('chainChanged', () => {
  // We disconnect the wallet to avoid out of sync state
  // between the account address and IDX DIDs
  disconnectMetamask();
  location.reload();
});

// Updates state when user changes accounts
window.ethereum?.on("accountsChanged", async ([address]: string) => {
  const config = await getConfig();
  state.setChangedAccount(address);
  state.refreshBalance(config);
});

state.subscribe(s => {
  console.log("session.state", s);
});

export async function approveSpender(spender: string, amount: BigNumber, config: Config): Promise<void> {
  assert(config.signer);

  const signer = config.signer;
  const addr = await signer.getAddress();

  const allowance = await config.token.allowance(addr, spender);

  if (allowance < amount) {
    const tx = await config.token.connect(signer).approve(spender, amount);
    await tx.wait();
  }
}

export function disconnectMetamask(): void {
  window.localStorage.removeItem('metamask');
  window.location.reload();
}

export function disconnectWallet(config: Config): void {
  if (config.walletConnect.client.connected) {
    config.walletConnect.client.killSession();
  }
  disconnectMetamask();
}

function saveSession(session: Session): void {
  window.localStorage.setItem("metamask", JSON.stringify({
    ...session, tokenBalance: null
  }));
}
