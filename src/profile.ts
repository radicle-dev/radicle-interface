import type { EnsProfile } from "@app/base/registration/registrar";
import {
  isAddress,
  resolveEnsProfile,
  parseUsername,
  AddressType,
  identifyAddress,
  isFulfilled,
} from "@app/utils";
import type { Wallet } from "@app/wallet";
import { cached } from "@app/cache";
import type { Seed, InvalidSeed } from "@app/base/seeds/Seed";
import { Org } from "@app/base/orgs/Org";
import { NotFoundError, MissingReverseRecord } from "@app/error";

export interface IProfile {
  address: string;
  type: AddressType;
  ens?: EnsProfile;
  org?: Org;
}

export enum ProfileType {
  Full,
  Minimal,
  Project,
}

export class Profile {
  profile: IProfile;

  constructor(profile: IProfile) {
    this.profile = profile;
  }

  // Get the Ethereum address
  get address(): string {
    return this.profile.ens?.address ?? this.profile.address;
  }

  // Get radicle link id.
  get id(): string | undefined {
    return this.profile.ens?.id;
  }

  // Get the address type
  get type(): AddressType {
    return this.profile.type;
  }

  // Get the org instance
  get org(): Org | undefined {
    return this.profile.org;
  }

  // Get the ENS profile
  get ens(): EnsProfile | undefined {
    return this.profile.ens;
  }

  get github(): string | undefined {
    if (this.profile?.ens?.github) {
      return parseUsername(this.profile.ens.github);
    } else {
      return undefined;
    }
  }

  get twitter(): string | undefined {
    if (this.profile?.ens?.twitter) {
      return parseUsername(this.profile.ens.twitter);
    } else {
      return undefined;
    }
  }

  get url(): string | undefined {
    if (this.profile?.ens?.url) return this.profile.ens.url;
    else return undefined;
  }

  get name(): string | undefined {
    if (this.profile?.ens?.name) return this.profile.ens.name;
    else return undefined;
  }

  get avatar(): string | undefined {
    if (this.profile?.ens?.avatar) {
      return this.profile.ens.avatar;
    } else {
      return undefined;
    }
  }

  // We add null here to differentiate between a `undefined` and a invalid / null seed
  get seed(): Seed | InvalidSeed | null {
    return this.profile?.ens?.seed ?? null;
  }

  // Get the name, and if not available, the address.
  get nameOrAddress(): string {
    return this.name ?? this.address;
  }

  // Keeping this function private since the desired entrypoint is .get()
  // All addresses returned from this function should be lowercase.
  private static async lookupProfile(
    addressOrName: string,
    profileType: ProfileType,
    wallet: Wallet,
  ): Promise<IProfile> {
    let type = AddressType.EOA;
    let org: Org | null = null;
    const ens = await resolveEnsProfile(addressOrName, profileType, wallet);

    if (ens) {
      if (ens.address) {
        type = await identifyAddress(ens.address, wallet);

        if (type === AddressType.Org) {
          org = await Org.get(ens.address, wallet);
        }

        return {
          address: ens.address.toLowerCase(),
          type,
          ens: { ...ens, address: ens.address.toLowerCase() },
          org: org ?? undefined,
        };
      }
      throw new MissingReverseRecord(`No address set for ${addressOrName}`);
    } else if (isAddress(addressOrName)) {
      const address = addressOrName.toLowerCase();

      type = await identifyAddress(address, wallet);
      if (type === AddressType.Org) {
        org = await Org.get(address, wallet);
      }

      try {
        return {
          address,
          type,
          org: org ?? undefined,
        };
      } catch (e: any) {
        console.error(e);

        return { address, type, org: org ?? undefined };
      }
    }
    throw new NotFoundError(`Not able to resolve profile for ${addressOrName}`);
  }

  static async getMulti(
    addressesOrNames: string[],
    wallet: Wallet,
  ): Promise<Profile[]> {
    const profilePromises = addressesOrNames.map(addressOrName =>
      this.lookupProfile(addressOrName, ProfileType.Minimal, wallet),
    );
    const profiles = await Promise.allSettled(profilePromises);
    return profiles
      .filter(isFulfilled)
      .map(profile => new Profile(profile.value));
  }

  static async get(
    addressOrName: string,
    profileType: ProfileType,
    wallet: Wallet,
  ): Promise<Profile> {
    const profile = await this.lookupProfile(
      addressOrName,
      profileType,
      wallet,
    );
    return new Profile(profile);
  }
}

export const getBalance = cached(
  async (address: string, wallet: Wallet) => {
    return await wallet.provider.getBalance(address);
  },
  address => address,
  { max: 1000 },
);
