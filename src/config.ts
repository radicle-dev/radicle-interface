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
  gasLimits: { createOrg: number };
  provider: ethers.providers.JsonRpcProvider;
  signer: ethers.Signer & TypedDataSigner | null;

  constructor(
    network: { name: string, chainId: number },
    provider: ethers.providers.JsonRpcProvider
  ) {
    let cfg = (<Record<string, any>> config)[network.name];
    let signer = null;

    try {
      signer = provider.getSigner();
    } catch (e) {
      console.log(e.message);
    }

    this.network = network;
    this.registrar = cfg.registrar;
    this.radToken = cfg.radToken;
    this.orgFactory = cfg.orgFactory;
    this.provider = provider;
    this.signer = signer;
    this.gasLimits = gasLimits;
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

  if (isMetamaskInstalled()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.ready;

    config = new Config(network, provider);
  } else {
    const network = { name: "homestead", chainId: 1 };
    const apiKey = import.meta.env.RADICLE_ALCHEMY_API_KEY;
    const provider = new ethers.providers.AlchemyProvider(network.name, apiKey);

    config = new Config(network, provider);
  }
  console.log(config);

  return config;
}
