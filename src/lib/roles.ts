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
