import type { ZodSchema } from "zod";
import { array, literal, number, object, string, union } from "zod";

interface GitPerson {
  name: string;
  email: string;
}

const gitPersonSchema = object({
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

export const commitHeaderSchema = object({
  id: string(),
  author: gitPersonSchema,
  summary: string(),
  description: string(),
  committer: gitPersonSchema.merge(object({ time: number() })),
}) satisfies ZodSchema<CommitHeader>;

interface AdditionHunkLine {
  line: string;
  lineNo: number;
  type: "addition";
}

const additionHunkLineSchema = object({
  line: string(),
  lineNo: number(),
  type: literal("addition"),
}) satisfies ZodSchema<AdditionHunkLine>;

interface DeletionHunkLine {
  line: string;
  lineNo: number;
  type: "deletion";
}

const deletionHunkLineSchema = object({
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

const contextHunkLineSchema = object({
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

const changesetHunkSchema = object({
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

const diffAddedDeletedModifiedChangesetSchema = object({
  path: string(),
  diff: object({
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

export interface DiffCopiedMovedChangeset {
  newPath: string;
  oldPath: string;
}

const diffCopiedMovedChangesetSchema = object({
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

export const diffSchema = object({
  added: array(diffAddedDeletedModifiedChangesetSchema),
  deleted: array(diffAddedDeletedModifiedChangesetSchema),
  moved: array(diffCopiedMovedChangesetSchema),
  copied: array(diffCopiedMovedChangesetSchema),
  modified: array(diffAddedDeletedModifiedChangesetSchema),
  stats: object({
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

export const commitSchema = object({
  commit: commitHeaderSchema,
  diff: diffSchema,
  branches: array(string()),
}) satisfies ZodSchema<Commit>;

export interface Commits {
  commits: Commit[];
  stats: { commits: number; branches: number; contributors: number };
}

export const commitsSchema = object({
  commits: array(commitSchema),
  stats: object({
    commits: number(),
    branches: number(),
    contributors: number(),
  }),
}) satisfies ZodSchema<Commits>;
