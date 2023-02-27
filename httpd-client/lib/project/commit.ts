import type { ZodSchema } from "zod";
import { array, literal, number, strictObject, string, union } from "zod";

interface GitPerson {
  name: string;
  email: string;
}

const gitPersonSchema = strictObject({
  name: string(),
  email: string(),
}) satisfies ZodSchema<GitPerson>;

export interface CommitHeader {
  id: string;
  author: GitPerson;
  summary: string;
  description: string;
  committer: GitPerson & { time: number };
}

export const commitHeaderSchema = strictObject({
  id: string(),
  author: gitPersonSchema,
  summary: string(),
  description: string(),
  committer: gitPersonSchema.merge(strictObject({ time: number() })),
}) satisfies ZodSchema<CommitHeader>;

interface AdditionHunkLine {
  line: string;
  lineNo: number;
  type: "addition";
}

const additionHunkLineSchema = strictObject({
  line: string(),
  lineNo: number(),
  type: literal("addition"),
}) satisfies ZodSchema<AdditionHunkLine>;

interface DeletionHunkLine {
  line: string;
  lineNo: number;
  type: "deletion";
}

const deletionHunkLineSchema = strictObject({
  line: string(),
  lineNo: number(),
  type: literal("deletion"),
}) satisfies ZodSchema<DeletionHunkLine>;

interface ContextHunkLine {
  line: string;
  lineNoNew: number;
  lineNoOld: number;
  type: "context";
}

const contextHunkLineSchema = strictObject({
  line: string(),
  lineNoNew: number(),
  lineNoOld: number(),
  type: literal("context"),
}) satisfies ZodSchema<ContextHunkLine>;

export type HunkLine = AdditionHunkLine | DeletionHunkLine | ContextHunkLine;

const hunkLineSchema = union([
  additionHunkLineSchema,
  deletionHunkLineSchema,
  contextHunkLineSchema,
]) satisfies ZodSchema<HunkLine>;

interface ChangesetHunk {
  header: string;
  lines: HunkLine[];
}

const changesetHunkSchema = strictObject({
  header: string(),
  lines: array(hunkLineSchema),
}) satisfies ZodSchema<ChangesetHunk>;

export interface DiffAddedDeletedModifiedChangeset {
  path: string;
  diff: {
    type: "plain" | "binary" | "empty";
    hunks: ChangesetHunk[];
    eof: "noneMissing" | "oldMissing" | "newMissing" | "bothMissing";
  };
}

const diffAddedDeletedModifiedChangesetSchema = strictObject({
  path: string(),
  diff: strictObject({
    type: union([literal("plain"), literal("binary"), literal("empty")]),
    hunks: array(changesetHunkSchema),
    eof: union([
      literal("noneMissing"),
      literal("oldMissing"),
      literal("newMissing"),
      literal("bothMissing"),
    ]),
  }),
}) satisfies ZodSchema<DiffAddedDeletedModifiedChangeset>;

interface DiffCopiedMovedChangeset {
  newPath: string;
  oldPath: string;
}

const diffCopiedMovedChangesetSchema = strictObject({
  newPath: string(),
  oldPath: string(),
}) satisfies ZodSchema<DiffCopiedMovedChangeset>;

export interface Diff {
  added: DiffAddedDeletedModifiedChangeset[];
  deleted: DiffAddedDeletedModifiedChangeset[];
  moved: DiffCopiedMovedChangeset[];
  copied: DiffCopiedMovedChangeset[];
  modified: DiffAddedDeletedModifiedChangeset[];
  stats: {
    filesChanged: number;
    insertions: number;
    deletions: number;
  };
}

export const diffSchema = strictObject({
  added: array(diffAddedDeletedModifiedChangesetSchema),
  deleted: array(diffAddedDeletedModifiedChangesetSchema),
  moved: array(diffCopiedMovedChangesetSchema),
  copied: array(diffCopiedMovedChangesetSchema),
  modified: array(diffAddedDeletedModifiedChangesetSchema),
  stats: strictObject({
    filesChanged: number(),
    insertions: number(),
    deletions: number(),
  }),
}) satisfies ZodSchema<Diff>;

export interface Commit {
  commit: CommitHeader;
  diff: Diff;
  branches: string[];
}

export const commitSchema = strictObject({
  commit: commitHeaderSchema,
  diff: diffSchema,
  branches: array(string()),
}) satisfies ZodSchema<Commit>;

export interface Commits {
  commits: Commit[];
  stats: { commits: number; branches: number; contributors: number };
}

export const commitsSchema = strictObject({
  commits: array(commitSchema),
  stats: strictObject({
    commits: number(),
    branches: number(),
    contributors: number(),
  }),
}) satisfies ZodSchema<Commits>;
