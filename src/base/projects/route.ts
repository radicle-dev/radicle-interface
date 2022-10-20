import type { Config } from "@app/config";
import type { Writable } from "svelte/store";

import { parseRoute, type Tree } from "@app/project";
import { Project } from "@app/project";
import { writable } from "svelte/store";
import { Patch } from "@app/patch";
import { Issue } from "@app/issue";
import type { Commit, CommitsHistory } from "@app/commit";

export type Content =
  | "tree"
  | "commits"
  | "commit"
  | "issues"
  | "issue"
  | "patches"
  | "patch";

export interface Params {
  urn: string;
  seedHost?: string;
  profileName?: string;
  peer?: string;
  restRoute?: string;
  activeView?: ProjectView;
}

export const routeLoading: Writable<boolean> = writable(false);

export interface LoadedRoute {
  type: "projects";
  project: Project;
  urn: string;
  revision: string;
  peer?: string;
  seedHost?: string;
  profileName?: string;
  activeView: LoadedProjectView;
}

export type ProjectView =
  | {
      type: "tree";
      revision: string;
      path: string;
    }
  | {
      type: "commits";
      parent: string;
      path: string;
    }
  | {
      type: "commit";
      commit: string;
      path: string;
    }
  | {
      type: "patches";
    }
  | {
      type: "patch";
      patch: string;
    }
  | {
      type: "issues";
    }
  | {
      type: "issue";
      issue: string;
    };

export type LoadedProjectView =
  | {
      type: "tree";
      line: number | null;
      tree: Tree;
      path: string;
    }
  | {
      type: "commits";
      tree: Tree;
      commits: CommitsHistory;
      path: string;
    }
  | {
      type: "commit";
      tree: Tree;
      commit: Commit;
      path: string;
    }
  | {
      type: "patches";
      patches: Patch[];
      tree: Tree;
    }
  | {
      type: "patch";
      patch: Patch;
      tree: Tree;
    }
  | {
      type: "issues";
      issues: Issue[];
      tree: Tree;
    }
  | {
      type: "issue";
      issue: Issue;
      tree: Tree;
    };

export async function load(
  params: Params,
  config: Config,
): Promise<LoadedRoute> {
  routeLoading.set(true);

  const project = await Project.get(
    params.urn,
    params.peer || null,
    params.profileName || null,
    params.seedHost || null,
    config,
  );

  const parsed = parseRoute(params.restRoute || "", project.branches);
  const root = await project.getRoot(parsed.revision);

  let activeView: LoadedProjectView;
  switch (params.activeView?.type) {
    case "tree": {
      activeView = {
        type: "tree",
        tree: root.tree,
        line: parsed.line,
        path: parsed.path,
      };
      break;
    }
    case "commits": {
      const commits = await Project.getCommits(project.urn, project.seed.api, {
        parent: parsed.revision,
        verified: true,
      });
      activeView = {
        type: "commits",
        tree: root.tree,
        path: parsed.path,
        commits,
      };
      break;
    }
    case "commit": {
      const commit = await project.getCommit(parsed.revision || root.commit);
      activeView = {
        type: "commit",
        tree: root.tree,
        path: parsed.path,
        commit,
      };
      break;
    }
    case "issues": {
      const issues = await Issue.getIssues(project.urn, project.seed.api);
      activeView = {
        type: "issues",
        tree: root.tree,
        issues,
      };
      break;
    }
    case "issue": {
      const issue = await Issue.getIssue(
        project.urn,
        params.activeView.issue,
        project.seed.api,
      );
      activeView = {
        type: "issue",
        tree: root.tree,
        issue,
      };
      break;
    }
    case "patches": {
      const patches = await Patch.getPatches(project.urn, project.seed.api);
      activeView = {
        type: "patches",
        tree: root.tree,
        patches,
      };
      break;
    }
    case "patch": {
      const patch = await Patch.getPatch(
        params.urn,
        params.activeView.patch,
        project.seed.api,
      );
      activeView = {
        type: "patch",
        tree: root.tree,
        patch,
      };
      break;
    }
    default: {
      activeView = {
        type: "tree",
        line: parsed.line || null,
        tree: root.tree,
        path: parsed.path,
      };
      break;
    }
  }

  routeLoading.set(false);
  return {
    type: "projects",
    urn: params.urn,
    peer: params.peer,
    seedHost: params.seedHost,
    revision: parsed.revision || root.commit,
    profileName: params.profileName,
    project,
    activeView,
  };
}
