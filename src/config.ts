import { ethers } from "ethers";
import config from "@app/config.json";

declare global {
  interface Window {
    ethereum: any;
  }
}

export type Config = {
  network: { name: string, chainId: number },
  registrar: { address: string },
  radToken: { address: string },
  orgFactory: { address: string },
  gasLimits: { createOrg: number },
  provider: ethers.providers.JsonRpcProvider,
  signer: ethers.Signer,
};

/// Gas limits for various transactions.
const gasLimits = {
  createOrg: 1_000_000,
};

function isMetamaskInstalled(): boolean {
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
}

export async function getConfig(): Promise<Config> {
  if (isMetamaskInstalled()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    let network = await provider.ready;
    let cfg = (<Record<string, any>> config)[network.name];

    if (cfg) {
      return {
        network,
        registrar: cfg.registrar,
        radToken: cfg.radToken,
        orgFactory: cfg.orgFactory,
        provider: provider,
        signer: provider.getSigner(),
        gasLimits: gasLimits,
      };
    } else {
      throw `Wrong network: ${network.name}`;
    }
  } else {
    throw "No provider available";
  }
}
