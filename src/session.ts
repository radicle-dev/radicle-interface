import { get, writable, derived } from "svelte/store";
import type { Readable } from "svelte/store";
import type { BigNumber } from 'ethers';
import type { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { Config, isMetamaskInstalled } from "@app/config";
import { Unreachable, assert, assertEq } from "@app/error";
import type { TypedDataSigner } from '@ethersproject/abstract-signer';
import type { WalletConnectSigner } from "./WalletConnectSigner";
import * as ethers from "ethers";
import type { SeedSession } from "./siwe";

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

export type Signer = ethers.Signer & TypedDataSigner | WalletConnectSigner | null;

// Defines the type of signer we are using in the current session.
// Allows us to guard certain functionality for a specific signer.
enum SignerType {
  WalletConnect,
  MetaMask
}

// Definitions made in `Config` that need to be part of the session,
// to provide reactivity based on events i.e. accountsChanged
export interface SignerConfig {
  signer: Signer;
  type: SignerType;
}

export type State =
    { connection: Connection.Disconnected }
  | { connection: Connection.Connecting }
  | { connection: Connection.Connected; session: Session };

export interface Session {
  address: string;
  config: SignerConfig;
  siwe: { [key: string]: SeedSession };
  tokenBalance: BigNumber | null; // `null` means it isn't loaded yet.
  tx: TxState;
}

export interface Store extends Readable<State> {
  connectMetamask(config: Config): Promise<void>;
  connectWalletConnect(config: Config): Promise<void>;
  updateBalance(n: BigNumber): void;
  connectSeed(seed: { id: string; session: SeedSession }): void;
  refreshBalance(): Promise<void>;
  setTxSigning(): void;
  setTxPending(tx: TransactionResponse): void;
  setTxConfirmed(tx: TransactionReceipt): void;
  setChangedAccount(address: string, signer: Signer): void;
}

// This is a buffer for the Config class to be available in this file, without making it a store just yet.
// TODO: We should be thinking on making config a store, similar to session, to be more accesible.
let sessionConfig: Config | null = null;

export const loadState = (initial: State): Store => {
  const store = writable<State>(initial);
  // Loads from localStorage all active seed sessions.
  const siwe = loadSeedSessions();

  return {
    subscribe: store.subscribe,
    connectMetamask: async (config: Config) => {
      // TODO: Updates at the moment the local sessionConfig variable, will be removed eventually
      sessionConfig = config;
      assert(config.metamask.signer);
      // We use config.metamask.signer here, because config.signer is still null on page reload.
      const signer = config.metamask.signer;

      // Re-connect using previous session.
      if (config.metamask.connected) {
        const metamask = config.metamask.session;
        const signerConfig: SignerConfig = { signer, type: SignerType.MetaMask };
        const tokenBalance: BigNumber = await config.token.balanceOf(metamask.address);
        const session = { address: metamask.address, config: signerConfig, siwe, tokenBalance, tx: null };

        store.set({ connection: Connection.Connected, session });
        config.setSigner(signer);

        return;
      }

      const state = get(store);

      assertEq(state.connection, Connection.Disconnected || Connection.Connecting);
      store.set({ connection: Connection.Connecting });

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = await signer.getAddress();

      config.setSigner(signer);

      try {
        // We close here any walletConnect session that may be open, before establishing a new Metamask connection.
        config.walletConnect.state.set({ state: "close" });

        const tokenBalance: BigNumber = await config.token.balanceOf(address);
        const signerConfig = { signer, type: SignerType.MetaMask };
        const session = { address, config: signerConfig, siwe, tokenBalance, tx: null };

        store.set({
          connection: Connection.Connected,
          session,
        });
        saveMetamaskSession(session);
      } catch (e) {
        console.error(e);
      }
    },

    connectWalletConnect: async (config: Config) => {
      // TODO: Updates at the moment the local sessionConfig variable, will be removed eventually
      sessionConfig = config;
      store.set({ connection: Connection.Connecting });
      // We fetch the walletConnect signer here, because config.signer is still null on page reload.
      const signer = config.getWalletConnectSigner();

      try {
        await config.walletConnect.client.connect();
        console.log("WalletConnect: connected.");

        let address = await signer.getAddress();
        const signerConfig: SignerConfig = { signer, type: SignerType.WalletConnect };
        const tokenBalance: BigNumber = await config.token.balanceOf(address);
        const session = { address, config: signerConfig, siwe, tokenBalance, tx: null };
        const network = ethers.providers.getNetwork(
          signer.walletConnect.chainId
        );

        // Instead of killing the WalletConnect session, we force the UI to change network
        if (network.chainId !== config.network.chainId) {
          config.changeNetwork(network.chainId);
        }

        config.walletConnect.client.on("session_update", async (error, { params: [{ accounts, chainId }] }: { params: [{ accounts: [string]; chainId: number }] }) => {
          if (error) {
            throw error;
          }

          try {
            // We only change accounts if the address has been changed, to avoid unnecessary refreshing.
            if (address !== accounts[0]) {
              // When session_update address doesn't match the signer address, we update the signer and pass it to changeAccounts to update the session.
              const signer = config.getWalletConnectSigner();
              changeAccounts(accounts[0], signer);

              // We update the address variable in scope of the connectWalletConnect function async here, to be used in the future when session_updates triggers.
              signer.getAddress().then(a => address = a);
            }
            // Check the current chainId, and request Metamask to change, or reload the window to get the correct chain.
            if (chainId !== config.network.chainId) {
              if (isMetamaskInstalled()) {
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: ethers.utils.hexValue(chainId) }]
                });
              } else {
                config.changeNetwork(chainId);
                window.location.reload();
              }
            }
          } catch (e) { console.error(e); }
        });

        store.set({ connection: Connection.Connected, session });
      } catch (e: any) {
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

    connectSeed: ({ id, session }: { id: string; session: SeedSession }) => {
      store.update((s: State) => {
        switch (s.connection) {
          case Connection.Connected:
            s.session.siwe[id] = session;
            saveSeedSession(s.session);

            return s;
          default:
            return s;
        }
      });
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

    refreshBalance: async () => {
      const state = get(store);
      assert(state.connection === Connection.Connected && sessionConfig); // We should be connected and have a config created.
      const addr = state.session.address;

      try {
        const tokenBalance: BigNumber = await sessionConfig.token.balanceOf(addr);

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

    setChangedAccount: (address: string, signer: Signer) => {
      store.update(s => {
        switch (s.connection) {
          case Connection.Connected:
            // In case of locking Metamask the accountsChanged event returns undefined.
            // To prevent out of sync state, the wallet gets disconnected.
            if (address === undefined) {
              // This ends with a window reload.
              disconnectMetamask();
            } else {
              s.session.address = address;
              s.session.config.signer = signer;
              // We only save the session to localStorage if we use a MetaMask signer
              // WalletConnect does their own session persistance.
              if (s.session.config.type === SignerType.MetaMask) saveMetamaskSession(s.session);
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

window.ethereum?.on('chainChanged', () => {
  // We disconnect the wallet to avoid out of sync state
  // between the account address and IDX DIDs
  disconnectMetamask();
});

// Updates state when user changes accounts
window.ethereum?.on("accountsChanged", async ([address]: string) => {
  // Only allow user to change accounts with Metamask if they are connected with Metamask.
  if (get(session)?.config.type !== SignerType.MetaMask) {
    return;
  // TODO: Temporary use case of sessionConfig, will eventually be removed, if moving config to a svelte store.
  } else if (sessionConfig) {
    changeAccounts(address, sessionConfig.metamask.signer);
  }
});

export async function changeAccounts(address: string, signer: Signer): Promise<void> {
  state.setChangedAccount(address, signer);
  state.refreshBalance();
}

export function loadSeedSessions(): { [key: string]: SeedSession } {
  const siweStorage = localStorage.getItem("siwe");

  if (siweStorage) {
    const siwe: { [key: string]: SeedSession } = JSON.parse(siweStorage);

    // We only keep the sessions that are still valid, and remove expired ones from `localStorage`.
    // For a session to be valid the expiration time has to be bigger or equal than the current time.
    const activeSessions = Object.fromEntries(Object.entries(siwe).filter(([, value]) => {
      return new Date(value.expirationTime) >= new Date();
    }));
    window.localStorage.setItem("siwe", JSON.stringify({ ...activeSessions }));

    return activeSessions;
  }

  return {};
}

export async function connectSeed(seedSession: { id: string; session: SeedSession }): Promise<void> {
  state.connectSeed(seedSession);
}

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

function saveSeedSession(session: Session): void {
  window.localStorage.setItem("siwe", JSON.stringify(session.siwe));
}

function saveMetamaskSession(session: Session): void {
  window.localStorage.setItem("metamask", JSON.stringify({ address: session.address, tokenBalance: null, tx: null, config: null }));
}
