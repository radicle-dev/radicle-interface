import type { PeerId } from "@app/project";

export interface Author {
  peer: PeerId;
  urn: string;
  profile: {
    name: string;
    ens: {
      name: string;
    } | null;
  } | null;
}

export interface PeerIdentity {
  urn: string;
  name: string;
  ens: {
    name: string;
  } | null;
}

export interface PeerInfo {
  id: PeerId;
  person?: PeerIdentity;
  delegate: boolean;
}

// Formats COBs Object Ids
export function formatObjectId(id: string): string {
  return id.substring(0, 11);
}
