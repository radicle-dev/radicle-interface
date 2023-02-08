export type Thread = Comment<Comment[]>;

export interface Comment<R = null> {
  author: Author;
  body: string;
  reactions: Record<string, number>;
  timestamp: number;
  replies: R; // TODO: Remove for Heartwood migration
  replyTo: R;
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
