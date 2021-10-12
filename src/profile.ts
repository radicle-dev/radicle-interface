import { AccountId } from 'caip';
import type { EnsProfile } from "@app/base/registrations/registrar";
import type { BasicProfile } from "@ceramicstudio/idx-constants";
import {
  isAddress, formatCAIP10Address, formatIpfsFile, resolveEnsProfile, resolveIdxProfile, parseUsername, parseEnsLabel
} from "@app/utils";
import type { Config } from "@app/config";

export interface IProfile {
  address: string;
  ens: EnsProfile | null;
  idx: BasicProfile | null;
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
  get ens(): EnsProfile | null {
    return this.profile.ens;
  }

  // Get the IDX profle
  get idx(): BasicProfile | null {
    return this.profile.idx;
  }

  // Using undefined as return type if nothing to be returned since it works better with <a href> links
  get github(): string | undefined {
    if (this.profile?.ens?.github) return parseUsername(this.profile.ens.github);
    else if (this.profile?.idx?.affiliations) return this.profile.idx?.affiliations.find(item => item === "github");
    else return undefined;
  }

  // Using undefined as return type if nothing to be returned since it works better with <a href> links
  get twitter(): string | undefined {
    if (this.profile?.ens?.twitter) return parseUsername(this.profile.ens.twitter);
    else if (this.profile?.idx?.affiliations) return this.profile.idx.affiliations.find(item => item === "twitter");
    else return undefined;
  }

  // Using undefined as return type if nothing to be returned since it works better with <a href> links
  get url(): string | undefined {
    if (this.profile?.ens?.url) return this.profile.ens.url;
    else if (this.profile?.idx?.url) return this.profile.idx.url;
    else return undefined;
  }

  // Using undefined as return type if nothing to be returned since it works better with <a href> links
  get name(): string | undefined {
    if (this.profile?.ens?.name) return this.profile.ens.name;
    else if (this.profile?.idx?.name) return this.profile.idx.name;
    else return undefined;
  }

  // Using undefined as return type if nothing to be returned since it works better with <a href> links
  get avatar(): string | undefined {
    if (this.profile?.ens?.avatar) return this.profile.ens.avatar;
    else if (this.profile?.idx?.image?.original?.src) return formatIpfsFile(this.profile.idx.image.original.src);
    else return undefined;
  }

  // Using undefined as return type if nothing to be returned since it works better with <a href> links
  get seedHost(): string | undefined {
    return this.profile?.ens?.seedHost ?? undefined;
  }

  // Using undefined as return type if nothing to be returned since it works better with <a href> links
  get seedId(): string | undefined {
    return this.profile?.ens?.seedId ?? undefined;
  }

  // Using undefined as return type if nothing to be returned since it works better with <a href> links
  get anchorsAccount(): string | undefined {
    const addr = this.profile?.ens?.anchorsAccount;

    if (addr) {
      const id = new AccountId(addr);

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
    if (this.seedHost) {
      return config.withSeed(this.seedHost, this.seedId);
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
  private static async lookupProfile(
    addressOrName: string,
    profileType: ProfileType,
    config: Config
  ): Promise<IProfile> {
    const ens = await resolveEnsProfile(addressOrName, profileType, config);

    if (ens) {
      if (ens.address) {
        return { address: ens.address, ens, idx: null };
      }
      throw new Error(`No address set for ${addressOrName}`);

    } else if (isAddress(addressOrName)) {
      const address = addressOrName;

      try {
        const idx = await resolveIdxProfile(
          formatCAIP10Address(address, "eip155", config.network.chainId), config
        );
        return { address, ens: null, idx };
      } catch {
        return { address, ens: null, idx: null };
      }
    }
    throw new Error(`Name ${addressOrName} was not found`);
  }

  static async getMulti(addresses: string[], config: Config): Promise<Profile[]> {
    const profilePromises = addresses.map(address => this.lookupProfile(address, ProfileType.Minimal, config));
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
