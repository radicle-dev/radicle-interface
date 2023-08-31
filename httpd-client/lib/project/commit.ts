import type { z } from "zod";
import { array, literal, number, object, optional, string, union } from "zod";

export { commitHeaderSchema, diffSchema, commitSchema, commitsSchema };

export type {
  Commits,
  HunkLine,
  Commit,
  DiffFile,
  Diff,
  DiffCopiedChangeset,
  DiffMovedChangeset,
  CommitHeader,
  DiffAddedChangeset,
  DiffDeletedChangeset,
  DiffModifiedChangeset,
  DiffContent,
};

const gitPersonSchema = object({
  name: string(),
  email: string(),
});

type CommitHeader = z.infer<typeof commitHeaderSchema>;

const commitHeaderSchema = object({
  id: string(),
  author: gitPersonSchema,
  summary: string(),
  description: string(),
  parents: array(string()),
  committer: gitPersonSchema.merge(object({ time: number() })),
});

type AdditionHunkLine = z.infer<typeof additionHunkLineSchema>;

const additionHunkLineSchema = object({
  line: string(),
  lineNo: number(),
  type: literal("addition"),
});

type DeletionHunkLine = z.infer<typeof deletionHunkLineSchema>;

const deletionHunkLineSchema = object({
  line: string(),
  lineNo: number(),
  type: literal("deletion"),
});

type DiffFile = z.infer<typeof diffFileSchema>;

const diffFileSchema = object({
  oid: string(),
  mode: union([
    literal("blob"),
    literal("blobExecutable"),
    literal("tree"),
    literal("link"),
    literal("commit"),
  ]),
});

type ContextHunkLine = z.infer<typeof contextHunkLineSchema>;

const contextHunkLineSchema = object({
  line: string(),
  lineNoNew: number(),
  lineNoOld: number(),
  type: literal("context"),
});

type HunkLine = AdditionHunkLine | DeletionHunkLine | ContextHunkLine;

const hunkLineSchema = union([
  additionHunkLineSchema,
  deletionHunkLineSchema,
  contextHunkLineSchema,
]);

const changesetHunkSchema = object({
  header: string(),
  lines: array(hunkLineSchema),
});

type DiffContent = z.infer<typeof diffContentSchema>;

const diffContentSchema = object({
  type: union([literal("plain"), literal("binary"), literal("empty")]),
  hunks: array(changesetHunkSchema),
  eof: union([
    literal("noneMissing"),
    literal("oldMissing"),
    literal("newMissing"),
    literal("bothMissing"),
  ]),
});

const diffChangesetSchema = object({
  path: string(),
  diff: diffContentSchema,
});

type DiffAddedChangeset = z.infer<typeof diffAddedChangesetSchema>;

const diffAddedChangesetSchema = diffChangesetSchema.merge(
  object({ new: diffFileSchema }),
);

type DiffDeletedChangeset = z.infer<typeof diffDeletedChangesetSchema>;

const diffDeletedChangesetSchema = diffChangesetSchema.merge(
  object({ old: diffFileSchema }),
);

type DiffModifiedChangeset = z.infer<typeof diffModifiedChangesetSchema>;

const diffModifiedChangesetSchema = diffChangesetSchema.merge(
  object({ new: diffFileSchema, old: diffFileSchema }),
);

type DiffCopiedChangeset = z.infer<typeof diffCopiedChangesetSchema>;

const diffCopiedChangesetSchema = object({
  newPath: string(),
  oldPath: string(),
});

type DiffMovedChangeset = z.infer<typeof diffMovedChangesetSchema>;

const diffMovedChangesetSchema = diffCopiedChangesetSchema.merge(
  object({
    old: optional(diffFileSchema),
    new: optional(diffFileSchema),
    diff: optional(diffContentSchema),
  }),
);

type Diff = z.infer<typeof diffSchema>;

const diffSchema = object({
  added: array(diffAddedChangesetSchema),
  deleted: array(diffDeletedChangesetSchema),
  modified: array(diffModifiedChangesetSchema),
  moved: array(diffMovedChangesetSchema),
  copied: array(diffCopiedChangesetSchema),
  stats: object({
    filesChanged: number(),
    insertions: number(),
    deletions: number(),
  }),
});

type Commit = z.infer<typeof commitSchema>;

const commitSchema = object({
  commit: commitHeaderSchema,
  diff: diffSchema,
  branches: array(string()),
});

type Commits = z.infer<typeof commitsSchema>;

const commitsSchema = object({
  commits: array(commitSchema),
  stats: object({
    commits: number(),
    branches: number(),
    contributors: number(),
  }),
});
