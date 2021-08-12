import { get, writable } from "svelte/store";
import type { Writable } from "svelte/store";
import { ethers } from "ethers";
import type { TypedDataSigner } from '@ethersproject/abstract-signer';
import SafeServiceClient from "@gnosis.pm/safe-service-client";
import CeramicClient from "@ceramicnetwork/http-client";
import { IDX } from "@ceramicstudio/idx";
import WalletConnect from "@walletconnect/client";
import config from "@app/config.json";
import { WalletConnectSigner } from "./WalletConnectSigner";

declare global {
  interface Window {
    ethereum: any;
    registrarState: any;
  }
}

/// Gas limits for various transactions.
const gasLimits = {
  createOrg: 1_200_000,
};

export type WalletConnectState =
    { state: "close" }
  | { state: "open"; uri: string; onClose: any };

export class Config {
  network: { name: string; chainId: number };
  registrar: { address: string; domain: string };
  radToken: { address: string };
  orgFactory: { address: string };
  reverseRegistrar: { address: string };
  orgs: { subgraph: string; contractHash: string };
  gasLimits: { createOrg: number };
  provider: ethers.providers.JsonRpcProvider;
  signer: ethers.Signer & TypedDataSigner | WalletConnectSigner | null;
  walletConnect: {
    client: WalletConnect;
    bridge: string;
    signer: WalletConnectSigner;
    state: Writable<WalletConnectState>;
  };
  metamask: {
    connected: true;
    signer: ethers.Signer & TypedDataSigner;
    session: { address: string };
  } | {
    connected: false;
    signer: ethers.Signer & TypedDataSigner | null;
  };
  safe: {
    api?: string;
    client?: SafeServiceClient;
    viewer: string | null;
  };
  abi: { [contract: string]: string[] };
  seed: { api?: string };
  idx: { client: IDX };
  ceramic: { client: CeramicClient };
  tokens: string[];
  token: ethers.Contract;

  constructor(
    network: { name: string; chainId: number },
    provider: ethers.providers.JsonRpcProvider,
    metamaskSigner: ethers.Signer & TypedDataSigner | null,
  ) {
    const api = config.radicle.api;
    const cfg = (<Record<string, any>> config)[network.name];
    const ceramic = new CeramicClient(config.ceramic.api);
    const idx = new IDX({ ceramic });

    const walletConnectState = writable<WalletConnectState>(
      { state: "close" }
    );
    const wc = Config.initializeWalletConnect(
      config.walletConnect.bridge,
      walletConnectState,
      provider
    );
    const metamaskSession = window.localStorage.getItem("metamask");
    const metamask = metamaskSession ? JSON.parse(metamaskSession) : null;

    this.network = network;
    this.metamask = metamask && metamaskSigner ? {
      connected: true,
      session: { address: metamask["address"] },
      signer: metamaskSigner,
    } : {
      connected: false,
      signer: metamaskSigner,
    };
    this.walletConnect = {
      bridge: config.walletConnect.bridge,
      client: wc.connector,
      signer: wc.signer,
      state: walletConnectState,
    };
    this.seed = { api };
    this.registrar = cfg.registrar;
    this.radToken = cfg.radToken;
    this.orgFactory = cfg.orgFactory;
    this.reverseRegistrar = cfg.reverseRegistrar;
    this.orgs = cfg.orgs;
    this.safe = cfg.safe;
    this.safe.client = this.safe.api
      ? new SafeServiceClient(this.safe.api)
      : undefined;
    this.provider = provider;
    this.signer = null;
    this.gasLimits = gasLimits;
    this.abi = config.abi;
    this.idx = { client: idx };
    this.ceramic = { client: ceramic };
    this.tokens = cfg.tokens;
    this.token = new ethers.Contract(
      this.radToken.address,
      this.abi.token,
      this.provider,
    );
  }

  setSigner(signer: ethers.Signer & TypedDataSigner | WalletConnectSigner): void {
    this.signer = signer;
  }

  // Return the config with an overwritten seed URL.
  withSeed(seed: string): Config {
    const cfg = {} as Config;
    Object.assign(cfg, this);
    cfg.seed.api = seed;

    return cfg;
  }

  getWalletConnectSigner(): WalletConnectSigner {
    if (this.walletConnect.client.connected) {
      this.setSigner(this.walletConnect.signer);
      return this.walletConnect.signer;
    }
    const wc = Config.initializeWalletConnect(
      this.walletConnect.bridge,
      this.walletConnect.state,
      this.provider
    );
    this.walletConnect.client = wc.connector;
    this.walletConnect.signer = wc.signer;
    this.setSigner(wc.signer);

    return wc.signer;
  }

  static initializeWalletConnect(
    bridge: string,
    state: Writable<WalletConnectState>,
    provider: ethers.providers.JsonRpcProvider
  ): {
    connector: WalletConnect;
    signer: WalletConnectSigner;
  } {
    const walletConnect = new WalletConnect({
      bridge: config.walletConnect.bridge,
      qrcodeModal: {
        open: (uri: string, onClose) => {
          state.set({ state: "open", uri, onClose });
        },
        close: () => {
          // We handle the "close" event through the "disconnect" handler.
        }
      }
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
      `${window.location.protocol}//${window.location.host}/logo.png`
    ];

    const walletConnectSigner = new WalletConnectSigner(walletConnect, provider);

    return {
      connector: walletConnect,
      signer: walletConnectSigner,
    };
  }
}

function isMetamaskInstalled(): boolean {
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
}

function getProvider(
  network: { name: string },
  config: Record<string, any>,
  metamask: ethers.providers.JsonRpcProvider | null,
): ethers.providers.JsonRpcProvider {
  // Use Alchemy in production, on mainnet. Otherwise use Metamask if installed.
  if (network.name === "homestead" && import.meta.env.PROD) {
    return new ethers.providers.AlchemyProvider(network.name, config.alchemy.key);
  } else if (metamask) {
    return metamask;
  } else {
    throw new Error("No Web3 provider available.");
  }
}

export async function getConfig(): Promise<Config> {
  const metamask = isMetamaskInstalled()
    ? new ethers.providers.Web3Provider(window.ethereum)
    : null;
  const metamaskSigner = metamask?.getSigner() || null;

  console.log("metamask", metamask);
  console.log("metamaskSigner", metamaskSigner);

  let network = { name: "homestead", chainId: 1 };
  if (metamask) {
    // If Metamask is detected, we use the network configured there.
    network = await metamask.ready;
  }

  const networkConfig = (<Record<string, any>> config)[network.name];
  if (! networkConfig) {
    throw new Error(`Network ${network.name} is not supported`);
  }

  const provider = getProvider(network, networkConfig, metamask);
  const cfg = new Config(
    network,
    provider,
    metamaskSigner,
  );
  console.log(cfg, "config");

  return cfg;
}
