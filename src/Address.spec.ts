import type { Config } from "./config";
import Address from "./Address.svelte";
import { test } from "vitest";
import { render, screen } from "@testing-library/svelte";

test("Render correctly", async () => {
  render(Address, { props: {
    address: "0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0",
    config: {
      orgs: {
        subgraph: "https://gateway.thegraph.com/api/1758a78ae257ad4906f9c638e4a68c19/subgraphs/id/0x2f0963e77ca6ac0c2dad1bf4147b6b40e0dd8728-0",
      },
      safe: {
        api: "https://safe-transaction.gnosis.io",
        viewer: "https://gnosis-safe.io/app/#/safes"
      },
      network: {
        name: "rinkeby"
      }
    } as Config
  } });
  screen.findByText("0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0");
});
