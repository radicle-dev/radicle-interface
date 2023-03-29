import type { IssueState } from "@app/lib/issue";
import type { PatchState } from "@app/lib/patch";

import { parseNodeId } from "@app/lib/utils";

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

export interface Thread {
  root: Comment;
  replies: Comment[];
}

export interface PeerIdentity {
  id: string;
}
export interface PeerInfo {
  id: string;
  person?: PeerIdentity;
  delegate: boolean;
}

export type ReviewState = { status: "accept" } | { status: "reject" };

// Formats COBs Object Ids
export function formatObjectId(id: string): string {
  return id.substring(0, 11);
}

export function stripDidPrefix(array: string[]): string[] {
  return array.map(id => id.replace("did:key:", ""));
}

export type State = IssueState | PatchState;

export function validateTag(
  value: string,
  items: string[],
): { success: false; error: string } | { success: true } {
  if (value.trim().length > 0) {
    if (items.includes(value)) {
      return { success: false, error: "This tag is already added" };
    } else {
      return { success: true };
    }
  }
  return { success: false, error: "This tag is not valid" };
}

export function validateAssignee(
  value: string,
  items: string[],
): { success: false; error: string } | { success: true } {
  const nodeId = parseNodeId(value);
  if (nodeId) {
    if (items.includes(`${nodeId.prefix}${nodeId.pubkey}`)) {
      return { success: false, error: "This assignee is already added" };
    } else {
      return { success: true };
    }
  }
  return { success: false, error: "This assignee is not valid" };
}
