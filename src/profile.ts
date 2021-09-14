import { ethers } from "ethers";
import type { EnsProfile } from "@app/base/registrations/registrar";
import type { BasicProfile } from "@ceramicstudio/idx-constants";
import {
  formatCAIP10Address, formatIpfsFile, resolveEnsProfile, resolveIdxProfile, parseUsername,
} from "@app/utils";
import type { Config } from "./config";

export interface IProfile {
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
  address: string;

  constructor(profile: IProfile, address: string) {
    this.profile = profile;
    this.address = address;
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
  get seed(): string | undefined {
    return this.profile?.ens?.seedHost ?? undefined;
  }

  // Return the profile-specific config. This sets various URLs in the config,
  // based on profile data.
  config(config: Config): Config {
    if (this.seed) {
      return config.withSeed(this.seed);
    }
    return config;
  }

  // Keeping this function private since the desired entrypoint is .get()
  private static async lookupAddress(
    address: string,
    profileType: ProfileType,
    config: Config
  ): Promise<[IProfile, string]> {
    const profile: IProfile = { ens: null, idx: null };

    try {
      address = ethers.utils.getAddress(address);
    } catch {
      address = await config.provider.resolveName(address);
    }

    try {
      const [ens, idx] = await Promise.allSettled([
        resolveEnsProfile(address, profileType, config),
        resolveIdxProfile(formatCAIP10Address(address, "eip155", config.network.chainId), config)
      ]);

      if (ens.status == "fulfilled") profile.ens = ens.value;
      if (idx.status == "fulfilled") profile.idx = idx.value;
    } catch (error) {
      console.error(error);
    }

    return [profile, address];
  }

  static async getMulti(addresses: string[], config: Config): Promise<Profile[]> {
    const profilePromises = addresses.map(address => this.lookupAddress(address, ProfileType.Minimal, config));
    const profiles = await Promise.all(profilePromises);
    return profiles.map(profile => { return new Profile(...profile); });
  }

  static async get(
    address: string,
    profileType: ProfileType,
    config: Config,
  ): Promise<Profile> {
    const profile = await this.lookupAddress(address, profileType, config);
    return new Profile(...profile);
  }
}
