import { ethers } from "ethers";
import homestead from "@app/lib/ethereum/networks/homestead.json";

export interface NetworkConfig {
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
  } else if (
    import.meta.env.PROD &&
    window.location.host !== "localhost:4173"
  ) {
    return new ethers.providers.AlchemyWebSocketProvider(
      networkConfig.name,
      networkConfig.alchemy.key,
    );
  }
  // Run the production smoke test with the ethers provider,
  // because we block requests from localhost on Alchemy,
  // which in turn throws an exception.
  else if (import.meta.env.DEV || window.location.host === "localhost:4173") {
    // The ethers defaultProvider doesn't include a `send` method, which breaks the `utils.getTokens` fn.
    // Since Metamask nor WalletConnect provide an `alchemy_getTokenBalances` nor `alchemy_getTokenMetadata` endpoint,
    // we can rely on not using `config.provider.send`.
    return ethers.providers.getDefaultProvider() as ethers.providers.JsonRpcProvider;
  } else {
    throw new Error("No Web3 provider available.");
  }
}

export function getWallet(): ethers.providers.JsonRpcProvider {
  const metamask = isMetamaskInstalled()
    ? new ethers.providers.Web3Provider(window.ethereum)
    : null;

  return getProvider(homestead, metamask);
}
