export interface Comment {
  id: string;
  author: Author;
  body: string;
  reactions: Record<string, number>;
  timestamp: number;
  replyTo: string | null;
}

export interface Author {
  id: string;
}

export interface PeerIdentity {
  id: string;
}
export interface PeerInfo {
  id: string;
  person?: PeerIdentity;
  delegate: boolean;
}

// Formats COBs Object Ids
export function formatObjectId(id: string): string {
  return id.substring(0, 11);
}

export function stripDidPrefix(array: string[]): string[] {
  return array.map(id => id.replace("did:key:", ""));
}
