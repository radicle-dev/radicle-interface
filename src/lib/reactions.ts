export type GroupedReactions = Map<string, { all: string[]; self: boolean }>;

// Takes reactions from a comment and groups them by emoji
// and if the current user has reacted with that emoji.
export function groupReactions(
  reactions: [string, string][],
  publicKey?: string,
) {
  return reactions.reduce(
    (acc, [nid, emoji]) =>
      acc.set(emoji, {
        all: [...(acc.get(emoji)?.all ?? []), nid],
        self: publicKey === nid,
      }),
    new Map<string, { all: string[]; self: boolean }>(),
  );
}
