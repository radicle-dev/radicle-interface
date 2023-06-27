export const pluralRules = {
  commit: "commits",
  contributor: "contributors",
  deletion: "deletions",
  file: "files",
  insertion: "insertions",
  issue: "issues",
  patch: "patches",
  remote: "remotes",
} as const;

export function pluralize(
  singular: keyof typeof pluralRules,
  count: number,
): string {
  return count === 1 ? singular : pluralRules[singular];
}
