import type { BigNumber } from "ethers";
import type { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";
import type { NetworkConfig } from "@app/lib/provider";
import type { Writable } from "svelte/store";

import networks from "@app/lib/ethereum/networks";
import { get, derived, writable } from "svelte/store";
import { getWallet } from "@app/lib/provider";

export type Session =
  | { connection: "disconnected" }
  | { connection: "connecting" }
  | {
      connection: "connected";
      session: {
        address: string;
        tokenBalance: BigNumber | null;
        signer: JsonRpcSigner;
      };
    };

export const providerStore: Writable<JsonRpcProvider> =
  writable<JsonRpcProvider>(getWallet());
providerStore.subscribe(n => console.log("providerStore", n));

export const networkStore: Writable<NetworkConfig> = writable<NetworkConfig>(
  // Use homestead as default network
  networks[1],
);

networkStore.subscribe(n => console.log("networkStore", n));

export const state: Writable<Session> = writable<Session>({
  connection: "disconnected",
});
state.subscribe(n => console.log("sessionStore", n));

export const sessionStore = derived(state, s => {
  if (s.connection === "connected") {
    return s.session;
  }
  return null;
});

export async function initialize() {
  const provider = get(providerStore);
  const network = await provider.getNetwork();
  networkStore.set(networks[network.chainId]);
}
