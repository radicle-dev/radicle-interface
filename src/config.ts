import { ethers } from "ethers";
import type { TypedDataSigner } from '@ethersproject/abstract-signer';
import config from "@app/config.json";

declare global {
  interface Window {
    ethereum: any;
    registrarState: any;
  }

  interface ImportMeta {
    env: {
      RADICLE_ALCHEMY_API_KEY: string | null,
    }
  }
}

export class Config {
  network: { name: string, chainId: number };
  registrar: { address: string, domain: string };
  radToken: { address: string };
  orgFactory: { address: string };
  orgs: { subgraph: string, contractHash: string };
  gasLimits: { createOrg: number };
  provider: ethers.providers.JsonRpcProvider;
  signer: ethers.Signer & TypedDataSigner | null;
  seed: { url: string };
  safe: { api: string | null, viewer: string | null };
  abi: { [contract: string]: string[] }
  tokens: string[];

  constructor(
    network: { name: string, chainId: number },
    provider: ethers.providers.JsonRpcProvider,
    signer: ethers.Signer & TypedDataSigner | null,
  ) {
    let cfg = (<Record<string, any>> config)[network.name];
    
    if (!cfg) {
      throw `Network ${network.name} is not supported`;
    }

    this.network = network;
    this.registrar = cfg.registrar;
    this.radToken = cfg.radToken;
    this.orgFactory = cfg.orgFactory;
    this.orgs = cfg.orgs;
    this.safe = cfg.safe;
    this.provider = provider;
    this.signer = signer;
    this.gasLimits = gasLimits;
    this.seed = config.seed;
    this.abi = config.abi;
    this.tokens = cfg.tokens;
  }
}

/// Gas limits for various transactions.
const gasLimits = {
  createOrg: 1_000_000,
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
    const provider = alchemyApiKey ?
        new ethers.providers.AlchemyProvider(network.name, alchemyApiKey)
      : metamask;

    config = new Config(network, provider, metamask.getSigner());
  } else {
    // If we don't have Metamask, we use Alchemy as the provider, and we don't
    // provide a signer. We default to Homestead.
    const network = { name: "homestead", chainId: 1 };
    const provider = new ethers.providers.AlchemyProvider(network.name, alchemyApiKey);

    config = new Config(network, provider, null);
  }
  console.log(config);

  return config;
}
