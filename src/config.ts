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
export class Config {
  network: { name: string; chainId: number };
  registrar: { address: string; domain: string };
  radToken: { address: string };
  orgFactory: { address: string };
  orgs: { subgraph: string; contractHash: string };
  radicleBridge: { bridge: string };
  gasLimits: { createOrg: number };
  static walletConnect: WalletConnect;
  provider: ethers.providers.JsonRpcProvider;
  signer: ethers.Signer & TypedDataSigner | WalletConnectSigner | null;
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
    signer: ethers.Signer & TypedDataSigner | WalletConnectSigner | null,
  ) {
    {
      const api = config.radicle.api;
      const cfg = (<Record<string, any>> config)[network.name];
      const ceramic = new CeramicClient(config.ceramic.api);
      const idx = new IDX({ ceramic });

      this.network = network;
      this.seed = { api };
      this.registrar = cfg.registrar;
      this.radToken = cfg.radToken;
      this.orgFactory = cfg.orgFactory;
      this.radicleBridge = { bridge: config.walletConnect.bridge };
      this.orgs = cfg.orgs;
      this.safe = cfg.safe;
      this.safe.client = this.safe.api
        ? new SafeServiceClient(this.safe.api)
        : undefined;
      this.provider = provider;
      this.signer = signer;
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
  }

  getSigner() {
    return this.signer;
  }

  setSigner(signer: WalletConnectSigner) {
    this.signer = signer;
  }

  // Return the config with an overwritten seed URL.
  withSeed(seed: string): Config {
    const cfg = {} as Config;
    Object.assign(cfg, this);
    cfg.seed.api = seed;

    return cfg;
  }


}

function isMetamaskInstalled(): boolean {
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
}

function isWalletConnectConnected(): boolean {
  const newWalletConnect = (): WalletConnect => {
    return new WalletConnect({
      bridge: config.walletConnect.bridge,
    });
  };
  Config.walletConnect = newWalletConnect();

  if (Config.walletConnect?.connected) {
    return true;
  } else {
    return false;
  }
}

export async function getConfig(): Promise<Config> {

  let network = { name: "homestead", chainId: 1 };

  const metamask = isMetamaskInstalled() ? new ethers.providers.Web3Provider(window.ethereum) : null;

  if (metamask) {
    network = await metamask.ready;
  }

  const networkConfig = (<Record<string, any>> config)[network.name];
  if (!networkConfig) {
    throw `Network ${network.name} is not supported`;
  }

  function getProvider(): ethers.providers.JsonRpcProvider {
    // Use Alchemy in production, on mainnet.

    if (network.name === "homestead" && import.meta.env.PROD) {
      return new ethers.providers.AlchemyProvider(network.name, config.alchemy.key);
    } else if (isMetamaskInstalled()) {
      return new ethers.providers.Web3Provider(window.ethereum);
    } else {
      throw `No Web3 provider available.`;
    }
  }

  const provider = getProvider();

  let cfg: Config;

  if (isWalletConnectConnected()) {
    const signer = new WalletConnectSigner(Config.walletConnect, provider);

    cfg = new Config(network, provider, signer);
  } else if (isMetamaskInstalled()) {
    // If we have Metamask, use it as the signer, but try to use Alchemy
    // as the provider.
    cfg = new Config(network, provider, provider.getSigner());
  } else {
    // If we don't have Metamask, we default to Homestead.
    const network = { name: "homestead", chainId: 1 };
    cfg = new Config(network, provider, null);
  }
  console.log(cfg, "config");

  return cfg;
}
