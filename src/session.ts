import { get, writable, derived, Readable } from "svelte/store";
import type { BigNumber } from "ethers";
import QRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnect from "@walletconnect/client";
import type { Big } from "big.js";
import * as ethers from "ethers";
import ModalWalletQRCode from "@app/Components/Modal/QRCode.svelte";
import * as modal from "@app/modal";
import { WalletConnectSigner } from "@app/WalletConnectSigner";
import type {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { Config, getConfig } from "@app/config";
import { Unreachable, assert, assertEq } from "@app/error";

export enum Connection {
  Disconnected,
  Connecting,
  Connected,
}

export type TxState =
  | { state: "signing" }
  | { state: "pending"; hash: string }
  | { state: "success"; hash: string; blockHash: string; blockNumber: number }
  | {
      state: "fail";
      hash: string;
      blockHash: string;
      blockNumber: number;
      error: string;
    }
  | null;

export type State =
  | { connection: Connection.Disconnected }
  | { connection: Connection.Connecting }
  | { connection: Connection.Connected; session: Session };

export interface Session {
  address: string;
  tokenBalance: BigNumber | null; // `null` means it isn't loaded yet.
  tx: TxState;
}

export interface Store extends Readable<State> {
  connectMetamask(config: Config): Promise<void>;
  updateBalance(n: BigNumber): void;
  refreshBalance(config: Config): Promise<void>;
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
  disconnect(): Promise<void>;
  connectWalletConnect(config: Config): Promise<void>;
  setTxSigning(): void;
  setTxPending(tx: TransactionResponse): void;
  setTxConfirmed(tx: TransactionReceipt): void;
  setChangedAccount(address: string): void;
}

export const loadState = (initial: State): Store => {
  const store = writable<State>(initial);
  const state = get(store);

  const qrCodeModal = {
    open: (uri: string, _cb: unknown, _opts?: unknown) => {
      modal.toggle(ModalWalletQRCode, onModalHide, {
        uri,
      });
    },
    close: () => {
      // N.B: this is actually called when the connection is established,
      // not when the modal is closed per se.
      store.set({ connection: Connection.Connecting });
      modal.hide();
    },
  };
  const newWalletConnect = (): WalletConnect => {
    return new WalletConnect({
      bridge: "https://bridge.walletconnect.org",
      qrcodeModal: QRCodeModal,
    });
  };
  let walletConnect = newWalletConnect();

  const disconnect = async () => {
    await walletConnect.killSession().catch(() => {
      // When the user disconnects wallet-side, calling `killSession`
      // app-side trows an error because the wallet has already closed
      // its socket. Therefore, we simply ignore it.
    });

    store.set({ connection: Connection.Disconnected });
    window.localStorage.removeItem("session");
    location.reload();
    reinitWalletConnect();
  };

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const signer = new WalletConnectSigner(walletConnect, provider, disconnect);

  // Connect to a wallet using walletconnect
  const connectWalletConnect = async (config: Config) => {
    //Todo : check wallet state in the store before attempting to connect
    const state = get(store);
    const session = window.localStorage.getItem("session");

    if (session) {
      store.set({
        connection: Connection.Connected,
        session: JSON.parse(session),
      });
    }

    assertEq(state.connection, Connection.Disconnected);
    store.set({ connection: Connection.Connecting });

    try {
      await walletConnect.createSession();
      console.log("got here");

      walletConnect.on("connect", async (error, payload) => {
        if (error) {
          throw error;
        }
        const address = await signer.getAddress();

        const tokenBalance: BigNumber = await config.token.balanceOf(address);

        const session = { address, tokenBalance, tx: null };

        store.set({ connection: Connection.Connected, session });

        saveSession({ ...session, tokenBalance: null });
      });
    } catch (e) {
      assertEq(state.connection, Connection.Disconnected);
      store.set({ connection: Connection.Disconnected });
      assert(e, "Could not connect to wallet connect");
    }
    store.set({ connection: Connection.Connecting });
  };

  const reinitWalletConnect = () => {
    walletConnect = newWalletConnect();
    signer.walletConnect = walletConnect;
  };
  const onModalHide = (): void => {
    if (state.connection === Connection.Disconnected) {
      reinitWalletConnect();
    }
  };

  return {
    subscribe: store.subscribe,

    connectMetamask: async (config: Config) => {
      const state = get(store);

      assertEq(state.connection, Connection.Disconnected);
      store.set({ connection: Connection.Connecting });

      // TODO: This hangs on Brave, if you have to unlock your wallet..
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (e) {
        console.error(e);
      }

      const signer = config.provider.getSigner();
      const address = await signer.getAddress();

      try {
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
      store.update((s) => {
        switch (s.connection) {
          case Connection.Connected:
            s.session.tx = { state: "signing" };
            return s;
          default:
            throw new Unreachable();
        }
      });
    },

    setTxPending: (tx: TransactionResponse) => {
      store.update((s) => {
        switch (s.connection) {
          case Connection.Connected:
            assert(s.session.tx !== null);
            assert(s.session.tx.state === "signing");

            s.session.tx = { state: "pending", hash: tx.hash };
            return s;
          default:
            throw new Unreachable();
        }
      });
    },

    setTxConfirmed: (tx: TransactionReceipt) => {
      store.update((s) => {
        switch (s.connection) {
          case Connection.Connected:
            assert(s.session.tx !== null);
            assert(s.session.tx.state === "pending");

            if (tx.status === 1) {
              s.session.tx = {
                state: "success",
                hash: s.session.tx.hash,
                blockHash: tx.blockHash,
                blockNumber: tx.blockNumber,
              };
            } else {
              s.session.tx = {
                state: "fail",
                hash: s.session.tx.hash,
                blockHash: tx.blockHash,
                blockNumber: tx.blockNumber,
                error: "Failed",
              };
            }
            return s;
          default:
            throw new Unreachable();
        }
      });
    },

    setChangedAccount: (address: string) => {
      store.update((s) => {
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
    disconnect,
    connectWalletConnect,
    provider,
    signer,
  };
};

export const state = loadState({ connection: Connection.Disconnected });
export const session = derived(state, (s) => {
  if (s.connection === Connection.Connected) {
    return s.session;
  }
  return null;
});

window.ethereum?.on("chainChanged", () => {
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

state.subscribe((s) => {
  console.log("session.state", s);
});

export async function approveSpender(
  spender: string,
  amount: BigNumber,
  config: Config
): Promise<void> {
  const signer = config.provider.getSigner();
  const addr = await signer.getAddress();

  const allowance = await config.token.allowance(addr, spender);

  if (allowance < amount) {
    const tx = await config.token.connect(signer).approve(spender, amount);
    await tx.wait();
  }
}

export function disconnectWallet(): void {
  window.localStorage.removeItem("session");
  location.reload();
}

function saveSession(session: Session): void {
  window.localStorage.setItem(
    "session",
    JSON.stringify({
      ...session,
      tokenBalance: null,
    })
  );
}
