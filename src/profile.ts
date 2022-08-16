import type { EnsProfile } from "@app/base/registrations/registrar";
import type { BasicProfile } from '@datamodels/identity-profile-basic';
import {
  isAddress, formatCAIP10Address, formatIpfsFile, resolveEnsProfile,
  resolveIdxProfile, parseUsername, AddressType, identifyAddress
} from "@app/utils";
import type { Config } from "@app/config";
import { cached } from "@app/cache";
import type { Seed, InvalidSeed } from "@app/base/seeds/Seed";
import { Org } from "@app/base/orgs/Org";
import { NotFoundError, MissingReverseRecord } from "@app/error";
import { getProjectAnchors } from "@app/anchors";
import type { Anchor, PendingAnchor } from "@app/project";

export interface IProfile {
  address: string;
  type: AddressType;
  ens?: EnsProfile;
  idx?: BasicProfile;
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

  // We add null here to differentiate between a `undefined` and a invalid / null seed
  get seed(): Seed | InvalidSeed | null {
    return this.profile?.ens?.seed ?? null;
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

  // Returns the corresponding registration form to edit a user profile.
  // We are not interested in a non-existant registry link, since we check before hand if the name exists.
  registry(config: Config): string {
    if (this.profile?.ens) return `/registrations/${this.profile.ens.name}`;
    else return `${config.ceramic.registry}${formatCAIP10Address(this.profile.address, "eip155", config.network.chainId)}`;
  }

  // Get confirmed anchors.
  async confirmedAnchors(config: Config): Promise<Record<string, Anchor>> {
    const org = await this.getAnchorsOrg(config);

    if (org) {
      const result = await org.getProjects(config);
      const anchors: Record<string, Anchor> = {};

      for (const anchor of result) {
        anchors[anchor.id] = anchor;
      }
      return anchors;
    } else {
      return {};
    }
  }

  // Get pending anchors.
  async pendingAnchors(config: Config): Promise<Record<string, PendingAnchor>> {
    const org = await this.getAnchorsOrg(config);

    if (org) {
      const result = await org.getPendingProjects(config);
      const anchors: Record<string, PendingAnchor> = {};

      for (const anchor of result) {
        anchors[anchor.id] = anchor;
      }
      return anchors;
    } else {
      return {};
    }
  }

  async confirmedProjectAnchors(urn: string, config: Config): Promise<string[]> {
    const storage = this.anchorsAccount || this.org?.address;

    if (storage) {
      return await getProjectAnchors(urn, storage, config);
    }
    return [];
  }

  // Get the anchors account as an org, or the org, if available.
  private async getAnchorsOrg(config: Config): Promise<Org | null> {
    if (this.anchorsAccount) {
      return await Org.get(this.anchorsAccount, config);
    } else if (this.org) {
      return this.org;
    } else {
      return null;
    }
  }

  // Keeping this function private since the desired entrypoint is .get()
  // All addresses returned from this function should be lowercase.
  private static async lookupProfile(
    addressOrName: string,
    profileType: ProfileType,
    config: Config
  ): Promise<IProfile> {
    let type = AddressType.EOA;
    let org: Org | null = null;
    const ens = await resolveEnsProfile(addressOrName, profileType, config);

    if (ens) {
      if (ens.address) {
        type = await identifyAddress(ens.address, config);

        if (type === AddressType.Org) {
          org = await Org.get(ens.address, config);
        }

        return {
          address: ens.address.toLowerCase(),
          type,
          ens: { ...ens, address: ens.address.toLowerCase() },
          org: org ?? undefined
        };
      }
      throw new MissingReverseRecord(`No address set for ${addressOrName}`);

    } else if (isAddress(addressOrName)) {
      const address = addressOrName.toLowerCase();

      type = await identifyAddress(address, config);
      if (type === AddressType.Org) {
        org = await Org.get(address, config);
      }

      try {
        const idx = await resolveIdxProfile(
          formatCAIP10Address(address, "eip155", config.network.chainId), config
        );
        return {
          address,
          type,
          idx: idx ?? undefined,
          org: org ?? undefined
        };
      } catch (e: any) {
        // Look for the No DID found for error by the resolveIdxProfile fn and send it to console.debug
        if (e.message.match("No DID found for")) console.debug(e.message);
        else console.error(e);

        return { address, type, org: org ?? undefined };
      }
    }
    throw new NotFoundError(`Not able to resolve profile for ${addressOrName}`);
  }

  static async getMulti(addressesOrNames: string[], config: Config): Promise<Profile[]> {
    const profilePromises = addressesOrNames.map(
      addressOrName => this.lookupProfile(addressOrName, ProfileType.Minimal, config)
    );
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

export const getBalance = cached(
  async (address: string, config: Config) => {
    return await config.provider.getBalance(address);
  },
  (address) => address,
  { max: 1000 }
);
