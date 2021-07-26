import { get, writable, derived, Readable } from "svelte/store";
import type { BigNumber } from 'ethers';
import type { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { Config, getConfig } from "@app/config";
import { Unreachable, assert, assertEq } from "@app/error";
import WalletConnect from "@walletconnect/client";
import * as ethers from "ethers";
import { WalletConnectSigner } from "@app/WalletConnectSigner";

export enum Connection {
  Disconnected,
  Connecting,
  Connected
}

export enum ConnectionModalStateType {
  Open,
  Close
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

export type ConnectionModalState = { status: ConnectionModalStateType.Open; modalProps: ConnectionModalProps } | { status: ConnectionModalStateType.Close; modalProps: null };
export interface ConnectionModalProps {
  config: Config;
  uri: string;
}
export interface Store extends Readable<State> {
  connectMetamask(config: Config): Promise<void>;
  updateBalance(n: BigNumber): void;
  refreshBalance(config: Config): Promise<void>;
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
  connectWalletConnect(config: Config): Promise<void>;
  setTxSigning(): void;
  setTxPending(tx: TransactionResponse): void;
  setTxConfirmed(tx: TransactionReceipt): void;
  setChangedAccount(address: string): void;
}

const modalStore = writable<ConnectionModalState>({ status: ConnectionModalStateType.Close, modalProps: null });
export const store = derived(modalStore, ($store) => $store);

export const loadState = (initial: State): Store => {
  const store = writable<State>(initial);
  const session = window.localStorage.getItem("session");
  function newWalletConnect(config: Config): WalletConnect {

    walletConnect = new WalletConnect({
      bridge: config.radicleBridge.bridge,
      qrcodeModal: {
        open: (uri: string, onClose, _opts?: unknown) => {
          modalStore.set({ status: ConnectionModalStateType.Open, modalProps: { uri, config } });
          console.log(_opts);
          onClose();
        },
        close: () => {
          modalStore.set({ status: ConnectionModalStateType.Close, modalProps: null });
        },
      },
    });

    return walletConnect;
  }
  if (session) store.set({ connection: Connection.Connected, session: JSON.parse(session) });

  let walletConnect: any;
  let network: any;
  //ethereum provider
  let provider: any;
  // instantiate wallet connect signer
  let signer: any;

  // Connect to a wallet using walletconnect
  const connectWalletConnect = async (config: Config) => {
    walletConnect = newWalletConnect(config);

    window.localStorage.setItem('wallet_connect', JSON.stringify(walletConnect));
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = new WalletConnectSigner(walletConnect, provider);

    //Todo : check wallet state in the store before attempting to connect
    const state = get(store);
    const session = window.localStorage.getItem("session");

    if (session && walletConnect.connected) store.set({ connection: Connection.Connected, session: JSON.parse(session) });
    assertEq(state.connection, Connection.Disconnected);
    store.set({ connection: Connection.Connecting });

    try {
      await walletConnect.connect();

      const address = await signer.getAddress();
      const tokenBalance: BigNumber = await config.token.balanceOf(address);
      const session = { address, tokenBalance, tx: null };
      const provNetwork = await ethers.providers.getNetwork(
        signer.walletConnect.chainId
      );
      network = {
        name: provNetwork.name,
        chainId: provNetwork.chainId,
      };

      config = new Config(network, provider, signer);

      store.set({ connection: Connection.Connected, session });
      saveSession({ ...session, tokenBalance: null });

    } catch (e) {
      console.log(e);
      assertEq(state.connection, Connection.Disconnected);
      store.set({ connection: Connection.Disconnected });
      assert(e, "Could not connect to wallet connect");
    }
  };


  return {
    subscribe: store.subscribe,
    connectMetamask: async (config: Config) => {
      assert(config.signer);
      const state = get(store);

      assertEq(state.connection, Connection.Disconnected || Connection.Connecting);
      store.set({ connection: Connection.Connecting });

      // TODO: This hangs on Brave, if you have to unlock your wallet..
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (e) {
        console.error(e);
      }

      const signer = config.signer;
      const address = await signer.getAddress();

      network = config.network;

      config = new Config(network, provider, signer);

      try {
        modalStore.set({ status: ConnectionModalStateType.Close, modalProps: null });
        const tokenBalance: BigNumber = await config.token.balanceOf(address);
        const session = { address, tokenBalance, tx: null };
        store.set({
          connection: Connection.Connected,
          session,
        });
        saveSession({ ...session, tokenBalance: null });
      } catch (e) {
        console.error(e);
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
              disconnectWallet();
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
    connectWalletConnect,
    provider,
    signer,
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
  disconnectWallet();
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

export function disconnectWallet(): void {
  window.localStorage.clear();
  location.reload();
}

function saveSession(session: Session): void {
  window.localStorage.setItem("session", JSON.stringify({
    ...session, tokenBalance: null
  }));
}
