import type { NetworkConfig } from "@app/lib/provider";

import goerli from "./goerli.json";
import homestead from "./homestead.json";

const networks: Record<number, NetworkConfig> = { 1: homestead, 5: goerli };

export default networks;
