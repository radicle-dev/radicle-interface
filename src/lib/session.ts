import type { BigNumber } from "ethers";
import type { Readable } from "svelte/store";
import type {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import type { TypedDataSigner } from "@ethersproject/abstract-signer";
import type { WalletConnectSigner } from "@app/lib/walletConnectSigner";

import * as ethers from "ethers";
import { get, writable, derived } from "svelte/store";

import { Unreachable, assert, assertEq } from "@app/lib/error";
import { Wallet, getWallet } from "@app/lib/wallet";

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

export type Signer = (ethers.Signer & TypedDataSigner) | WalletConnectSigner;

// Defines the type of signer we are using in the current session.
// Allows us to guard certain functionality for a specific signer.
enum SignerType {
  WalletConnect,
  MetaMask,
}

export type State =
  | { connection: Connection.Disconnected }
  | { connection: Connection.Connecting }
  | { connection: Connection.Connected; session: Session };

export interface Session {
  address: string;
  signer: Signer | null;
  signerType: SignerType;
  tokenBalance: BigNumber | null; // `null` means it isn't loaded yet.
  tx: TxState;
}

export interface Store extends Readable<State> {
  connectMetamask(wallet: Wallet): Promise<void>;
  connectWalletConnect(wallet: Wallet): Promise<void>;
  updateBalance(n: BigNumber): void;
  refreshBalance(wallet: Wallet): Promise<void>;
  setTxSigning(): void;
  setTxPending(tx: TransactionResponse): void;
  setTxConfirmed(tx: TransactionReceipt): void;
  setChangedAccount(address: string, signer: Signer): void;
}

export const loadState = (initial: State): Store => {
  const store = writable<State>(initial);

  return {
    subscribe: store.subscribe,
    connectMetamask: async (wallet: Wallet) => {
      assert(wallet.metamask.signer);
      // We use wallet.metamask.signer here, because wallet.signer is still null on page reload.
      const signer = wallet.metamask.signer;

      // Re-connect using previous session.
      if (wallet.metamask.connected) {
        const metamask = wallet.metamask.session;
        const tokenBalance: BigNumber = await wallet.token.balanceOf(
          metamask.address,
        );
        const session = {
          address: metamask.address,
          signer,
          signerType: SignerType.MetaMask,
          tokenBalance,
          tx: null,
        };

        store.set({ connection: Connection.Connected, session });
        wallet.setSigner(signer);

        return;
      }

      const state = get(store);

      assertEq(
        state.connection,
        Connection.Disconnected || Connection.Connecting,
      );
      store.set({ connection: Connection.Connecting });

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = await signer.getAddress();

      wallet.setSigner(signer);

      try {
        // Closes the wallet modal.
        // TODO: We should move this into the session store.
        wallet.walletConnect.state.set({ state: "close" });

        const tokenBalance: BigNumber = await wallet.token.balanceOf(address);
        const session = {
          address,
          signer,
          signerType: SignerType.MetaMask,
          tokenBalance,
          tx: null,
        };

        store.set({
          connection: Connection.Connected,
          session,
        });
        saveMetamaskSession(session);
      } catch (e) {
        console.error(e);
      }
    },

    connectWalletConnect: async (wallet: Wallet) => {
      store.set({ connection: Connection.Connecting });
      // We fetch the walletConnect signer here, because wallet.signer is still null on page reload.
      const signer = wallet.getWalletConnectSigner();

      try {
        await wallet.walletConnect.client.connect();
        console.debug("WalletConnect: connected.");

        const address = await signer.getAddress();
        const tokenBalance: BigNumber = await wallet.token.balanceOf(address);
        const session = {
          address,
          signer,
          signerType: SignerType.WalletConnect,
          tokenBalance,
          tx: null,
        };
        const network = ethers.providers.getNetwork(
          signer.walletConnect.chainId,
        );

        // Instead of killing the WalletConnect session, we force the UI to change network
        if (network.chainId !== wallet.network.chainId) {
          wallet.changeNetwork(network.chainId);
        }

        wallet.walletConnect.client.on(
          "session_update",
          async (
            error,
            {
              params: [{ accounts, chainId }],
            }: { params: [{ accounts: [string]; chainId: number }] },
          ) => {
            if (error) {
              throw error;
            }

            try {
              // We update wallet to reflect the new signer address.
              const signer = wallet.getWalletConnectSigner();
              changeAccounts(accounts[0], signer);

              // Check the current chainId, and request Metamask to change, or reload the window to get the correct chain.
              if (chainId !== wallet.network.chainId) {
                if (session.signerType === SignerType.MetaMask) {
                  await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: ethers.utils.hexValue(chainId) }],
                  });
                } else {
                  window.location.reload();
                }
              }
            } catch (e) {
              console.error(e);
            }
          },
        );

        store.set({ connection: Connection.Connected, session });
      } catch (e: any) {
        console.debug("WalletConnect: connection failed.");
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
          saveMetamaskSession(s.session);
        }
        return s;
      });
    },

    refreshBalance: async (wallet: Wallet) => {
      const state = get(store);
      assert(state.connection === Connection.Connected);
      const addr = state.session.address;

      try {
        const tokenBalance: BigNumber = await wallet.token.balanceOf(addr);

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
            s.session.tx = { state: "signing" };
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
            assert(s.session.tx.state === "signing");

            s.session.tx = { state: "pending", hash: tx.hash };
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

    setChangedAccount: (address: string, signer: Signer) => {
      store.update(s => {
        switch (s.connection) {
          case Connection.Connected:
            // In case of locking Metamask the accountsChanged event returns undefined.
            // To prevent out of sync state, the wallet gets disconnected.
            if (address === undefined) {
              disconnectMetamask();
              return s;
            } else {
              s.session.address = address;
              s.session.signer = signer;
              // We only save the session to localStorage if we use a MetaMask signer
              // WalletConnect does their own session persistance.
              if (s.session.signerType === SignerType.MetaMask) {
                saveMetamaskSession(s.session);
              }
            }
            return s;
          default:
            return s;
        }
      });
    },
  };
};

// Initializes the session state on page load or hard refresh.
export const state = loadState({ connection: Connection.Disconnected });

export const session = derived(state, s => {
  if (s.connection === Connection.Connected) {
    return s.session;
  }
  return null;
});

window.ethereum?.on("chainChanged", () => {
  // We disconnect the wallet to avoid out of sync state.
  disconnectMetamask();
});

// Updates state when user changes accounts
window.ethereum?.on("accountsChanged", async ([address]: string) => {
  const s = get(session);
  // Only allow user to change accounts with Metamask if they are connected with Metamask.
  if (s?.signerType !== SignerType.MetaMask) {
    return;
  } else if (s.signer) {
    changeAccounts(address, s.signer);
  }
});

export async function changeAccounts(
  address: string,
  signer: Signer,
): Promise<void> {
  const wallet = await getWallet();
  state.setChangedAccount(address, signer);
  state.refreshBalance(wallet);
}

export async function approveSpender(
  spender: string,
  amount: BigNumber,
  wallet: Wallet,
): Promise<void> {
  assert(wallet.signer);

  const signer = wallet.signer;
  const addr = await signer.getAddress();

  const allowance = await wallet.token.allowance(addr, spender);

  if (allowance < amount) {
    const tx = await wallet.token.connect(signer).approve(spender, amount);
    await tx.wait();
  }
}

export function disconnectMetamask(): void {
  window.localStorage.removeItem("metamask");
  window.location.reload();
}

export function disconnectWallet(wallet: Wallet): void {
  if (wallet.walletConnect.client.connected) {
    wallet.walletConnect.client.killSession();
  }
  disconnectMetamask();
}

function saveMetamaskSession(session: Session): void {
  window.localStorage.setItem(
    "metamask",
    JSON.stringify({
      address: session.address,
      tokenBalance: null,
      tx: null,
      wallet: null,
    }),
  );
}
