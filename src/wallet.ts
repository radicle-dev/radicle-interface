import type { TypedDataSigner } from "@ethersproject/abstract-signer";
import type { Writable } from "svelte/store";

import WalletConnect from "@walletconnect/client";
import { ethers } from "ethers";
import { get, writable } from "svelte/store";

import { WalletConnectSigner } from "@app/WalletConnectSigner";
import { capitalize } from "@app/utils";
import ethereumContractAbis from "@app/ethereum/contractAbis.json";
import homestead from "@app/ethereum/networks/homestead.json";
import goerli from "@app/ethereum/networks/goerli.json";
import config from "@app/config.json";

interface NetworkConfig {
  name: string;
  chainId: number;
  registrar: {
    domain: string;
    address: string;
  };
  radToken: {
    address: string;
    faucet?: string;
  };
  reverseRegistrar: {
    address: string;
  };
  alchemy: { key: string };
}

export type WalletConnectState =
  | { state: "close" }
  | { state: "open"; uri: string; onClose: any };

export class Wallet {
  network: { name: string; chainId: number };
  registrar: { address: string; domain: string };
  radToken: { address: string; faucet?: string };
  reverseRegistrar: { address: string };
  provider: ethers.providers.JsonRpcProvider;
  signer: (ethers.Signer & TypedDataSigner) | WalletConnectSigner | null;
  walletConnect: {
    client: WalletConnect;
    bridge: string;
    signer: WalletConnectSigner;
    state: Writable<WalletConnectState>;
  };
  metamask:
    | {
        connected: true;
        signer: ethers.Signer & TypedDataSigner;
        session: { address: string };
      }
    | {
        connected: false;
        signer: (ethers.Signer & TypedDataSigner) | null;
      };
  token: ethers.Contract;

  constructor(
    network: NetworkConfig,
    provider: ethers.providers.JsonRpcProvider,
    metamaskSigner: (ethers.Signer & TypedDataSigner) | null,
  ) {
    const walletConnectState = writable<WalletConnectState>({ state: "close" });
    const wc = Wallet.initializeWalletConnect(
      config.walletConnect.bridge,
      walletConnectState,
      provider,
    );
    const metamaskSession = window.localStorage.getItem("metamask");
    const metamask = metamaskSession ? JSON.parse(metamaskSession) : null;

    this.network = network;
    this.metamask =
      metamask && metamaskSigner
        ? {
            connected: true,
            session: { address: metamask["address"] },
            signer: metamaskSigner,
          }
        : {
            connected: false,
            signer: metamaskSigner,
          };
    this.walletConnect = {
      bridge: config.walletConnect.bridge,
      client: wc.connector,
      signer: wc.signer,
      state: walletConnectState,
    };
    this.registrar = network.registrar;
    this.radToken = network.radToken;
    this.reverseRegistrar = network.reverseRegistrar;
    this.provider = provider;
    this.signer = null;
    this.token = new ethers.Contract(
      this.radToken.address,
      ethereumContractAbis.token,
      this.provider,
    );
  }

  changeNetwork(chainId: number): void {
    this.network = ethers.providers.getNetwork(chainId);
  }

  setSigner(
    signer: (ethers.Signer & TypedDataSigner) | WalletConnectSigner,
  ): void {
    this.signer = signer;
  }

  getWalletConnectSigner(): WalletConnectSigner {
    if (this.walletConnect.client.connected) {
      this.setSigner(this.walletConnect.signer);
      return this.walletConnect.signer;
    }
    const wc = Wallet.initializeWalletConnect(
      this.walletConnect.bridge,
      this.walletConnect.state,
      this.provider,
    );
    this.walletConnect.client = wc.connector;
    this.walletConnect.signer = wc.signer;
    this.setSigner(wc.signer);

    return wc.signer;
  }

  static initializeWalletConnect(
    bridge: string,
    state: Writable<WalletConnectState>,
    provider: ethers.providers.JsonRpcProvider,
  ): {
    connector: WalletConnect;
    signer: WalletConnectSigner;
  } {
    const walletConnect = new WalletConnect({
      bridge,
      qrcodeModal: {
        open: (uri: string, onClose) => {
          state.set({ state: "open", uri, onClose });
        },
        close: () => {
          // We handle the "close" event through the "disconnect" handler.
        },
      },
    });
    walletConnect.on("modal_closed", () => {
      state.set({ state: "close" });
    });
    walletConnect.on("disconnect", () => {
      const wcs = get(state);
      if (wcs.state === "open") {
        wcs.onClose();
      }
    });

    // Behold, we set this private class variable here because WalletConnect doesn't
    // give us any other way to set it :'(
    //
    // The default is to use the favicon, which doesn't work, given that it is
    // designed for browsers and not mobile apps which often show a much bigger
    // icon, resulting in a blurry image.
    (walletConnect as any)._clientMeta.icons = [
      `${window.location.protocol}//${window.location.host}/logo.png`,
    ];

    const walletConnectSigner = new WalletConnectSigner(
      walletConnect,
      provider,
    );

    return {
      connector: walletConnect,
      signer: walletConnectSigner,
    };
  }
}

export function isMetamaskInstalled(): boolean {
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
}

function getProvider(
  networkConfig: NetworkConfig,
  metamask: ethers.providers.JsonRpcProvider | null,
): ethers.providers.JsonRpcProvider {
  if (metamask) {
    return metamask;
  } else if (import.meta.env.PROD) {
    return new ethers.providers.AlchemyWebSocketProvider(
      networkConfig.name,
      networkConfig.alchemy.key,
    );
  } else if (import.meta.env.DEV) {
    // The ethers defaultProvider doesn't include a `send` method, which breaks the `utils.getTokens` fn.
    // Since Metamask nor WalletConnect provide an `alchemy_getTokenBalances` nor `alchemy_getTokenMetadata` endpoint,
    // we can rely on not using `config.provider.send`.
    return ethers.providers.getDefaultProvider() as ethers.providers.JsonRpcProvider;
  } else {
    throw new Error("No Web3 provider available.");
  }
}

// Checks if the promise metamask.ready returns the network, else timesout after 4 seconds.
function checkMetaMask(
  metamask: ethers.providers.Web3Provider,
): Promise<ethers.providers.Network | null> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, 4000);
    metamask.ready.then(network => resolve(network));
  });
}

export async function getWallet(): Promise<Wallet> {
  const metamask = isMetamaskInstalled()
    ? new ethers.providers.Web3Provider(window.ethereum)
    : null;
  const metamaskSigner = metamask?.getSigner() || null;

  let selectedNetwork: NetworkConfig;

  if (metamask) {
    const ready = await checkMetaMask(metamask);
    if (ready) {
      if (ready.name === "homestead") {
        selectedNetwork = homestead;
      } else if (ready.name === "goerli") {
        selectedNetwork = goerli;
      } else {
        throw new Error(
          `${capitalize(
            ready.name,
          )} is not supported. Connect to Homestead or Goerli instead.`,
        );
      }
    } else {
      throw new Error("Metamask was not ready after 4 seconds.");
    }
  } else {
    // Fall back to homestead.
    selectedNetwork = homestead;
  }

  const provider = getProvider(selectedNetwork, metamask);
  const cfg = new Wallet(selectedNetwork, provider, metamaskSigner);

  return cfg;
}
