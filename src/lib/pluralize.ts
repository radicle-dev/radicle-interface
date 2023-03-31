export const pluralRules = {
  file: "files",
  insertion: "insertions",
  deletion: "deletions",
  commit: "commits",
  issue: "issues",
  contributor: "contributors",
  patch: "patches",
} as const;

export function pluralize(
  singular: keyof typeof pluralRules,
  count: number,
): string {
  return count === 1 ? singular : pluralRules[singular];
}
