import { get, writable } from "svelte/store";
import type { Writable } from "svelte/store";
import { ethers } from "ethers";
import type { TypedDataSigner } from "@ethersproject/abstract-signer";
import SafeServiceClient from "@gnosis.pm/safe-service-client";
import WalletConnect from "@walletconnect/client";
import config from "@app/config.json";
import { WalletConnectSigner } from "./WalletConnectSigner";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Cypress: any;
    ethereum: any;
    registrarState: any;
  }
}

/// Gas limits for various transactions.
const gasLimits = {
  createOrg: 1_200_000,
};

export type WalletConnectState =
  | { state: "close" }
  | { state: "open"; uri: string; onClose: any };

export class Config {
  network: { name: string; chainId: number };
  registrar: { address: string; domain: string };
  radToken: { address: string; faucet: string };
  orgFactory: { address: string };
  reverseRegistrar: { address: string };
  orgs: { contractHash: string; pinned: string[] };
  users: { pinned: string[] };
  projects: { pinned: { urn: string; name: string; seed: string }[] };
  seeds: { pinned: Record<string, { emoji: string }> };
  gasLimits: { createOrg: number };
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
  safe: {
    api?: string;
    client?: SafeServiceClient;
    viewer: string | null;
  };
  abi: { [contract: string]: string[] };
  seed: {
    api: { port: number };
    git: { port: number };
    link: { port: number };
  };
  tokens: string[];
  token: ethers.Contract;

  constructor(
    network: { name: string; chainId: number },
    provider: ethers.providers.JsonRpcProvider,
    metamaskSigner: (ethers.Signer & TypedDataSigner) | null,
  ) {
    const cfg = (<Record<string, any>>config)[network.name];

    const walletConnectState = writable<WalletConnectState>({ state: "close" });
    const wc = Config.initializeWalletConnect(
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
    this.seed = config.radicle.seed;
    this.registrar = cfg.registrar;
    this.radToken = cfg.radToken;
    this.orgFactory = cfg.orgFactory;
    this.reverseRegistrar = cfg.reverseRegistrar;
    this.orgs = cfg.orgs;
    this.users = cfg.users;
    this.safe = cfg.safe;
    this.safe.client = this.safe.api
      ? new SafeServiceClient(this.safe.api)
      : undefined;
    this.provider = provider;
    this.signer = null;
    this.gasLimits = gasLimits;
    this.projects = config.projects;
    this.seeds = config.seeds;
    this.abi = config.abi;
    this.tokens = cfg.tokens;
    this.token = new ethers.Contract(
      this.radToken.address,
      this.abi.token,
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
    const wc = Config.initializeWalletConnect(
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
  network: { name: string },
  config: Record<string, any>,
  metamask: ethers.providers.JsonRpcProvider | null,
): ethers.providers.JsonRpcProvider {
  if (metamask) {
    return metamask;
  } else if (import.meta.env.PROD) {
    return new ethers.providers.AlchemyWebSocketProvider(
      network.name,
      config.alchemy.key,
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

export async function getConfig(): Promise<Config> {
  const metamask = isMetamaskInstalled()
    ? new ethers.providers.Web3Provider(window.ethereum)
    : null;
  const metamaskSigner = metamask?.getSigner() || null;

  console.debug("metamask", metamask);
  console.debug("metamaskSigner", metamaskSigner);

  let network = { name: "homestead", chainId: 1 };
  if (metamask) {
    // If Metamask is detected, we use the network configured there.
    const ready = await checkMetaMask(metamask);
    if (ready) network = ready;
  }

  const networkConfig = (<Record<string, any>>config)[network.name];
  if (!networkConfig) {
    throw new Error(`Network ${network.name} is not supported`);
  }

  const provider = getProvider(network, networkConfig, metamask);
  const cfg = new Config(network, provider, metamaskSigner);
  console.debug("config", cfg);

  return cfg;
}
