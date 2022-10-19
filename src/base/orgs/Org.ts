import type { Wallet } from "@app/wallet";

import * as ethers from "ethers";

import * as cache from "@app/cache";
import * as utils from "@app/utils";
import { assert } from "@app/error";
import ethereumContractAbis from "@app/ethereum/contractAbis.json";

export class Org {
  address: string;
  owner: string;
  name?: string | null;

  constructor(address: string, owner: string, name?: string | null) {
    assert(ethers.utils.isAddress(address), "address must be valid");

    this.address = address.toLowerCase(); // Don't store address checksum.
    this.owner = owner;
    this.name = name;
  }

  static async get(addressOrName: string, wallet: Wallet): Promise<Org | null> {
    const org = await getOrgContract(addressOrName, wallet);

    try {
      const [owner, resolved] = await resolveOrgOwner(org);

      // If what is resolved is not the same as the input, it's because we
      // were given a name.
      if (utils.isAddressEqual(addressOrName, resolved)) {
        return new Org(resolved, owner, null);
      } else {
        return new Org(resolved, owner, addressOrName);
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

export const getOrgContract = cache.cached(
  async (addressOrName: string, wallet: Wallet) => {
    return new ethers.Contract(
      addressOrName,
      ethereumContractAbis.org,
      wallet.provider,
    );
  },
  addressOrName => addressOrName,
);

export const resolveOrgOwner = cache.cached(
  async (org: ethers.Contract) => {
    return await Promise.all([org.owner(), org.resolvedAddress]);
  },
  org => org.address,
);
