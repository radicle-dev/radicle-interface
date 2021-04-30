import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum: any;
  }
}

export type Config = {
  registrar: { address: string },
  radToken: { address: string },
  orgFactory: { address: string },
  provider: ethers.providers.JsonRpcProvider,
  signer: ethers.Signer,
};

const addresses = {
  homestead: {
    registrar: {
      address: "0x37723287Ae6F34866d82EE623401f92Ec9013154",
    },
    radToken: {
      address: "0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3",
    },
    orgFactory: {
      address: "0x0000000000000000000000000000000000000000",
    },
  },
  ropsten: {
    registrar: {
      address: "0xb31441c140E92Ca20A0141D68b13b10ca051e40a",
    },
    radToken: {
      address: "0x59b5eee36f5fa52400A136Fd4630Ee2bF126a4C0",
    },
    orgFactory: {
      address: "0xe30aA5594FFB52B6bF5bbB21eB7e71Ac525bB028",
    },
  }
};

function isMetamaskInstalled(): boolean {
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
}

export async function getConfig(): Promise<Config> {
  if (isMetamaskInstalled()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    let network = await provider.ready;
    let cfg = addresses[network.name];

    if (cfg) {
      return {
        registrar: cfg.registrar,
        radToken: cfg.radToken,
        orgFactory: cfg.orgFactory,
        provider: provider,
        signer: provider.getSigner(),
      };
    } else {
      throw `Wrong network: ${network.name}`;
    }
  } else {
    throw "No provider available";
  }
}
