import { type Host, Request } from '@app/api';

export interface IIssue {
  id: string;
  author: Author;
  title: string;
  state: State;
  comment: CommentWithReplies;
  discussion: CommentWithReplies[];
  labels?: Label[]; // When no labels are set, this is undefined
  timestamp: number;
}

export type State = {
  status: "open";
} | {
  status: "closed";
  reason: string;
};

export interface Comment {
  author: Author;
  body: string;
  reactions: Record<string, number>;
  timestamp: number;
}

export interface Author {
  urn: string;
  name?: string;
  ens?: {
    name: string;
  };
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

export type Label = string;

export function groupIssues(issues: Issue[]): { open: Issue[]; closed: Issue[] } {
  return issues.reduce((acc, issue) => {
    acc[issue.state.status].push(issue);
    return acc;
  }, { open: [] as Issue[], closed: [] as Issue[] });
}

export class Issue {
  id: string;
  author: Author;
  title: string;
  state: State;
  comment: CommentWithReplies;
  discussion: CommentWithReplies[];
  labels?: Label[]; // When no labels are set, this is undefined
  timestamp: number;

  constructor(issue: IIssue) {
    this.id = issue.id;
    this.author = issue.author;
    this.title = issue.title;
    this.state = issue.state;
    this.comment = issue.comment;
    this.discussion = issue.discussion;
    this.labels = issue.labels;
    this.timestamp = issue.timestamp;
  }

  // Counts the amount of comments and replies in a discussion
  countComments(): number {
    return this.discussion.reduce((acc, comment) => {
      if (comment.replies) return acc + comment.replies.length + 1; // We add all replies and 1 forathe comment in this loop.
      return acc + 1; // If there are no replies, we simply add 1 for the comment in this loop.
    }, 0);
  }

  static async getIssues(urn: string, host: Host): Promise<Issue[]> {
    const response: IIssue[] = await new Request(`projects/${urn}/issues`, host).get();
    return response.map(issue => new Issue(issue));
  }

  static async getIssue(urn: string, issue: string, host: Host): Promise<Issue> {
    const response: IIssue = await new Request(`projects/${urn}/issues/${issue}`, host).get();
    return new Issue(response);
  }
}
