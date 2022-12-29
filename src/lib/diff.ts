export const lineNumberR = (line: LineDiff): string | number => {
  switch (line.type) {
    case LineDiffType.Addition: {
      return line.lineNo;
    }
    case LineDiffType.Context: {
      return line.lineNoNew;
    }
    case LineDiffType.Deletion: {
      return " ";
    }
  }
};

export const lineNumberL = (line: LineDiff): string | number => {
  switch (line.type) {
    case LineDiffType.Addition: {
      return " ";
    }
    case LineDiffType.Context: {
      return line.lineNoOld;
    }
    case LineDiffType.Deletion: {
      return line.lineNo;
    }
  }
};

export const lineSign = (line: LineDiff): string => {
  switch (line.type) {
    case LineDiffType.Addition: {
      return "+";
    }
    case LineDiffType.Context: {
      return " ";
    }
    case LineDiffType.Deletion: {
      return "-";
    }
  }
};

export enum LineDiffType {
  Addition = "addition",
  Context = "context",
  Deletion = "deletion",
}

export interface Addition {
  type: LineDiffType.Addition;
  line: string;
  lineNo: number;
}

export interface Context {
  type: LineDiffType.Context;
  line: string;
  lineNoNew: number;
  lineNoOld: number;
}

export interface Deletion {
  type: LineDiffType.Deletion;
  line: string;
  lineNo: number;
}

export type LineDiff = Addition | Deletion | Context;

export interface FileDiff {
  path: string;
  diff: Changeset;
  eof: EofNewLine | null;
}

export interface Changeset {
  type: string;
  hunks: Hunk[];
}

export interface Hunk {
  header: string;
  lines: LineDiff[];
}

export interface Diff {
  added: FileDiff[];
  deleted: FileDiff[];
  moved: string[];
  copied: string[];
  modified: FileDiff[];
}

export interface DiffStats {
  insertions: number;
  deletions: number;
}

export enum EofNewLine {
  OldMissing = "oldMissing",
  NewMissing = "newMissing",
  BothMissing = "bothMissing",
}
