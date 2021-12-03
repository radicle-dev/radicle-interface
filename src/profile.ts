import type { EnsProfile } from "@app/base/registrations/registrar";
import type { BasicProfile } from '@datamodels/identity-profile-basic';
import {
  isAddress, formatCAIP10Address, formatIpfsFile, resolveEnsProfile, resolveIdxProfile, parseUsername, parseEnsLabel
} from "@app/utils";
import type { Config } from "@app/config";
import type { Seed } from "@app/base/seeds/Seed";

export interface IProfile {
  address: string;
  ens?: EnsProfile;
  idx?: BasicProfile;
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

  // Get the ENS profile
  get ens(): EnsProfile | undefined {
    return this.profile.ens;
  }

  // Get the IDX profle
  get idx(): BasicProfile | undefined {
    return this.profile.idx;
  }

  get github(): string | undefined {
    if (this.profile?.ens?.github) return parseUsername(this.profile.ens.github);
    else if (this.profile?.idx?.affiliations) return this.profile.idx?.affiliations.find(item => item === "github");
    else return undefined;
  }

  get twitter(): string | undefined {
    if (this.profile?.ens?.twitter) return parseUsername(this.profile.ens.twitter);
    else if (this.profile?.idx?.affiliations) return this.profile.idx.affiliations.find(item => item === "twitter");
    else return undefined;
  }

  get url(): string | undefined {
    if (this.profile?.ens?.url) return this.profile.ens.url;
    else if (this.profile?.idx?.url) return this.profile.idx.url;
    else return undefined;
  }

  get name(): string | undefined {
    if (this.profile?.ens?.name) return this.profile.ens.name;
    else if (this.profile?.idx?.name) return this.profile.idx.name;
    else return undefined;
  }

  get avatar(): string | undefined {
    if (this.profile?.ens?.avatar) return this.profile.ens.avatar;
    else if (this.profile?.idx?.image?.original?.src) return formatIpfsFile(this.profile.idx.image.original.src);
    else return undefined;
  }

  get seedHost(): string | undefined {
    return this.profile?.ens?.seed?.host;
  }

  get seedId(): string | undefined {
    return this.profile?.ens?.seed.id;
  }

  get seed(): Seed | undefined {
    return this.profile?.ens?.seed;
  }

  get anchorsAccount(): string | undefined {
    const addr = this.profile?.ens?.anchorsAccount;

    if (addr) {
      // TODO: Workaround until caip package supports both CAIP10 formats.
      const [namespace, reference, address] = addr.split(":");
      const id = { "chainId": { namespace, reference }, address };

      // Ethereum address.
      if (typeof id.chainId === "object" && id.chainId.namespace === "eip155") {
        return id.address;
      }
      if (typeof id.chainId === "string" && /^eip155/.test(id.chainId)) {
        return id.address;
      }
    }
  }

  // Get the name, and if not available, the address.
  get nameOrAddress(): string {
    return this.name ?? this.address;
  }

  // Return the profile-specific config. This sets various URLs in the config,
  // based on profile data.
  config(config: Config): Config {
    if (this.seed) {
      return config.withSeed(this.seed);
    }
    return config;
  }

  // Returns the corresponding registration form to edit a user profile.
  // We are not interested in a non-existant registry link, since we check before hand if the name exists.
  registry(config: Config): string {
    if (this.profile?.ens) return `/registrations/${parseEnsLabel(this.profile.ens.name, config)}`;
    else return `${config.ceramic.registry}${formatCAIP10Address(this.profile.address, "eip155", config.network.chainId)}`;
  }

  // Keeping this function private since the desired entrypoint is .get()
  // All addresses returned from this function should be lowercase.
  private static async lookupProfile(
    addressOrName: string,
    profileType: ProfileType,
    config: Config
  ): Promise<IProfile> {
    const ens = await resolveEnsProfile(addressOrName, profileType, config);

    if (ens) {
      if (ens.address) {
        return {
          address: ens.address.toLowerCase(),
          ens: { ...ens, address: ens.address.toLowerCase() }
        };
      }
      throw new Error(`No address set for ${addressOrName}`);

    } else if (isAddress(addressOrName)) {
      const address = addressOrName.toLowerCase();

      try {
        const idx = await resolveIdxProfile(
          formatCAIP10Address(address, "eip155", config.network.chainId), config
        );
        return { address, idx: idx ?? undefined };
      } catch (e) {
        // Look for the No DID found for error by the resolveIdxProfile fn and send it to console.debug
        if (e.message.match("No DID found for")) console.debug(e.message);
        else console.error(e);

        return { address };
      }
    }
    throw new Error(`Name ${addressOrName} was not found`);
  }

  static async getMulti(addressesOrNames: string[], config: Config): Promise<Profile[]> {
    const profilePromises = addressesOrNames.map(addressOrName => this.lookupProfile(addressOrName, ProfileType.Minimal, config));
    const profiles = await Promise.all(profilePromises);
    return profiles.map(profile => { return new Profile(profile); });
  }

  static async get(
    addressOrName: string,
    profileType: ProfileType,
    config: Config,
  ): Promise<Profile> {
    const profile = await this.lookupProfile(addressOrName, profileType, config);
    return new Profile(profile);
  }
}
