export const lineNumberR = (line: LineDiff): string | number => {
  switch (line.type) {
    case LineDiffType.Addition: {
      return line.lineNum;
    }
    case LineDiffType.Context: {
      return line.lineNumNew;
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
      return line.lineNumOld;
    }
    case LineDiffType.Deletion: {
      return line.lineNum;
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
  lineNum: number;
}

export interface Context {
  type: LineDiffType.Context;
  line: string;
  lineNumNew: number;
  lineNumOld: number;
}

export interface Deletion {
  type: LineDiffType.Deletion;
  line: string;
  lineNum: number;
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
  created: FileDiff[];
  deleted: FileDiff[];
  moved: string[];
  copied: string[];
  modified: FileDiff[];
}

export enum EofNewLine {
  OldMissing = "oldMissing",
  NewMissing = "newMissing",
  BothMissing = "bothMissing",
}
