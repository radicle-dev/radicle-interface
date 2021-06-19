import { ethers } from "ethers";
import type { TypedDataSigner } from "@ethersproject/abstract-signer";
import SafeServiceClient from "@gnosis.pm/safe-service-client";
import CeramicClient from "@ceramicnetwork/http-client";
import { IDX } from "@ceramicstudio/idx";
import config from "@app/config.json";

declare global {
  interface Window {
    ethereum: any;
    registrarState: any;
  }
}

export class Config {
  network: { name: string; chainId: number };
  registrar: { address: string; domain: string };
  walletConnect: {testChainId: number; sessionRpcHost: string; bridge: string};
  radToken: { address: string };
  orgFactory: { address: string };
  orgs: { subgraph: string; contractHash: string };
  gasLimits: { createOrg: number };
  provider: ethers.providers.JsonRpcProvider;
  signer: (ethers.Signer & TypedDataSigner) | null;
  safe: {
    api?: string;
    client?: SafeServiceClient;
    subgraph: string;
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
    signer: (ethers.Signer & TypedDataSigner) | null
  ) {
    const cfg = (<Record<string, any>>config)[network.name];
    const api = config.radicle.api;

    if (!cfg) {
      throw `Network ${network.name} is not supported`;
    }

    const ceramic = new CeramicClient(config.ceramic.api);
    const idx = new IDX({ ceramic });

    this.network = network;
    this.seed = { api };
    this.registrar = cfg.registrar;
    this.walletConnect = cfg.walletConnect;
    this.radToken = cfg.radToken;
    this.orgFactory = cfg.orgFactory;
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
      this.provider
    );
  }
}

/// Gas limits for various transactions.
const gasLimits = {
  createOrg: 1_200_000,
};

function isMetamaskInstalled(): boolean {
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
}

export async function getConfig(): Promise<Config> {
  let config: Config;
  const alchemyApiKey = import.meta.env.RADICLE_ALCHEMY_API_KEY;

  if (isMetamaskInstalled()) {
    // If we have Metamask, use it as the signer, but try to use Alchemy
    // as the provider.
    const metamask = new ethers.providers.Web3Provider(window.ethereum);
    const network = await metamask.ready;
    const provider = alchemyApiKey
      ? new ethers.providers.AlchemyProvider(network.name, alchemyApiKey)
      : metamask;

    config = new Config(network, provider, metamask.getSigner());
  } else {
    // If we don't have Metamask, we use Alchemy as the provider, and we don't
    // provide a signer. We default to Homestead.
    const network = { name: "homestead", chainId: 1 };
    const provider = new ethers.providers.AlchemyProvider(
      network.name,
      alchemyApiKey
    );

    config = new Config(network, provider, null);
  }

  return config;
}
