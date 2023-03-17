import type { Author, Comment, State } from "@app/lib/cobs";
import type { Host } from "@app/lib/api";

import { stripDidPrefix } from "@app/lib/cobs";
import { Request } from "@app/lib/api";

export interface IIssue {
  id: string;
  author: Author;
  title: string;
  state: IssueState;
  discussion: Comment[];
  tags: string[];
  assignees: string[];
  timestamp: number;
}

export type IssueState =
  | { status: "open" }
  | { status: "closed"; reason: "other" | "solved" };

export function groupIssues(issues: Issue[]): {
  open: Issue[];
  closed: Issue[];
} {
  return issues.reduce(
    (acc, issue) => {
      acc[issue.state.status].push(issue);
      return acc;
    },
    { open: [] as Issue[], closed: [] as Issue[] },
  );
}

export function createAddRemoveArrays(
  currentArray: string[],
  newArray: string[],
): { add: string[]; remove: string[] } {
  return {
    add: newArray.filter(item => !currentArray.includes(item)),
    remove: currentArray.filter(item => !newArray.includes(item)),
  };
}

export class Issue {
  id: string;
  author: Author;
  title: string;
  state: IssueState;
  discussion: Comment[];
  tags: string[];
  assignees: string[];
  timestamp: number;

  constructor(issue: IIssue) {
    this.id = issue.id;
    this.author = issue.author;
    this.title = issue.title;
    this.state = issue.state;
    this.discussion = issue.discussion;
    this.tags = issue.tags;
    this.assignees = issue.assignees;
    this.timestamp = issue.discussion[0].timestamp;
  }

  // Counts the amount of comments in a discussion, excluding the initial description
  countComments(): number {
    return this.discussion.reduce((acc, curr, index) => {
      if (index !== 0) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }

  static async createIssue(
    project: string,
    title: string,
    description: string,
    assignees: string[],
    tags: string[],
    host: Host,
    authToken: string,
  ): Promise<{ success: true; id: string }> {
    return await new Request(`projects/${project}/issues`, host).post(
      {
        title,
        description,
        assignees,
        tags,
      },
      { Authorization: `Bearer ${authToken}` },
    );
  }

  async editTitle(
    project: string,
    title: string,
    host: Host,
    session: string,
  ): Promise<void> {
    await new Request(`projects/${project}/issues/${this.id}`, host).patch(
      {
        type: "edit",
        title,
      },
      { Authorization: `Bearer ${session}` },
    );
  }

  async editTags(
    project: string,
    add: string[],
    remove: string[],
    host: Host,
    session: string,
  ): Promise<void> {
    await new Request(`projects/${project}/issues/${this.id}`, host).patch(
      {
        type: "tag",
        add,
        remove,
      },
      { Authorization: `Bearer ${session}` },
    );
  }

  async editAssignees(
    project: string,
    add: string[],
    remove: string[],
    host: Host,
    session: string,
  ): Promise<void> {
    await new Request(`projects/${project}/issues/${this.id}`, host).patch(
      {
        type: "assign",
        add: stripDidPrefix(add),
        remove: stripDidPrefix(remove),
      },
      { Authorization: `Bearer ${session}` },
    );
  }

  async createComment(
    project: string,
    body: string,
    host: Host,
    session: string,
  ): Promise<void> {
    await new Request(`projects/${project}/issues/${this.id}`, host).patch(
      {
        type: "thread",
        action: {
          type: "comment",
          body,
        },
      },
      { Authorization: `Bearer ${session}` },
    );
  }

  async replyComment(
    project: string,
    body: string,
    replyTo: string,
    host: Host,
    session: string,
  ): Promise<void> {
    await new Request(`projects/${project}/issues/${this.id}`, host).patch(
      {
        type: "thread",
        action: {
          type: "comment",
          body,
          replyTo,
        },
      },
      { Authorization: `Bearer ${session}` },
    );
  }

  async changeState(
    project: string,
    state: State,
    host: Host,
    session: string,
  ): Promise<void> {
    await new Request(`projects/${project}/issues/${this.id}`, host).patch(
      {
        type: "lifecycle",
        state,
      },
      { Authorization: `Bearer ${session}` },
    );
  }

  static async getIssues(id: string, host: Host): Promise<Issue[]> {
    const response: IIssue[] = await new Request(
      `projects/${id}/issues`,
      host,
    ).get();
    return response.map(issue => new Issue(issue));
  }

  static async getIssue(id: string, issue: string, host: Host): Promise<Issue> {
    const response: IIssue = await new Request(
      `projects/${id}/issues/${issue}`,
      host,
    ).get();
    return new Issue(response);
  }
}
