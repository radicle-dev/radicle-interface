import { parseNodeId } from "@app/lib/utils";

export function isDelegate(
  publicKey: string | undefined,
  delegates: string[],
): true | undefined {
  if (!publicKey) {
    return undefined;
  }
  return (
    delegates.some(delegate => parseNodeId(delegate)?.pubkey === publicKey) ||
    undefined
  );
}

function matchAuthor(
  publicKey: string | undefined,
  nid: string,
): true | undefined {
  // Normalize the passed in NID
  const parsedNid = parseNodeId(nid);
  return (
    (publicKey && parsedNid && parsedNid.pubkey === publicKey) || undefined
  );
}

// All restricted actions are a combination of either:
// - the user is a delegate
// - the user is an author of the comment, issue, patch, etc.
export function isDelegateOrAuthor(
  publicKey: string | undefined,
  delegates: string[],
  author: string,
) {
  return isDelegate(publicKey, delegates) || matchAuthor(publicKey, author);
}
