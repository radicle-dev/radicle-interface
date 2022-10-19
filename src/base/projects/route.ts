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
  activeView: ProjectView;
}

export const routeLoading: Writable<boolean> = writable(false);

export interface LoadedRoute {
  type: "projects";
  project: Project;
  urn: string;
  path: string;
  revision: string;
  peer?: string;
  seedHost?: string;
  profileName?: string;
  restRoute?: string; // The resting URL to be parsed with project data.
  activeView: LoadedProjectView;
}

export type ProjectView =
  | {
      type: "tree";
      restRoute: string; // The resting URL to be parsed for revision and path.
    }
  | {
      type: "commits";
      restRoute: string; // The resting URL to be parsed for revision and path.
    }
  | {
      type: "commit";
      restRoute: string; // The resting URL to be parsed for revision and path.
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
      line?: number;
      tree: Tree;
      commit: string;
    }
  | {
      type: "commits";
      tree: Tree;
      commits: CommitsHistory;
    }
  | {
      type: "commit";
      tree: Tree;
      commit: Commit;
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
  restRoute?: string,
): Promise<LoadedRoute> {
  routeLoading.set(true);

  const project = await Project.get(
    params.urn,
    params.peer || null,
    params.profileName || null,
    params.seedHost || null,
    config,
  );

  const parsed = parseRoute(restRoute || "", project.branches);
  const path = parsed.path || "/";
  const revision = parsed.revision || project.head;
  const line = parsed.line || undefined;

  const root = await project.getRoot(revision);
  let activeView: LoadedProjectView;
  switch (params.activeView.type) {
    case "tree":
      activeView = {
        type: "tree",
        line,
        tree: root.tree,
        commit: root.commit,
      };
      break;
    case "commits": {
      const commits = await Project.getCommits(project.urn, project.seed.api, {
        parent: revision,
        verified: true,
      });
      activeView = {
        type: "commits",
        tree: root.tree,
        commits,
      };
      break;
    }
    case "commit": {
      const commit = await project.getCommit(revision || root.commit);
      activeView = {
        type: "commit",
        tree: root.tree,
        commit,
      };
      break;
    }
    case "issues": {
      const issues = await Issue.getIssues(project.urn, project.seed.api);
      activeView = {
        type: "issues",
        issues,
        tree: root.tree,
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
        issue,
        tree: root.tree,
      };
      break;
    }
    case "patches": {
      const patches = await Patch.getPatches(project.urn, project.seed.api);
      activeView = {
        type: "patches",
        patches,
        tree: root.tree,
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
        patch,
        tree: root.tree,
      };
      break;
    }
    default:
      activeView = {
        type: "tree",
        line,
        tree: root.tree,
        commit: root.commit,
      };
  }

  routeLoading.set(false);
  return {
    type: "projects",
    urn: params.urn,
    peer: params.peer,
    revision: revision || root.commit,
    restRoute: `${revision || root.commit}/${path}`,
    path,
    seedHost: params.seedHost,
    profileName: params.profileName,
    project,
    activeView,
  };
}

export function convertLoadingToRoute(route: LoadedRoute): Params {
  let activeViewParams: ProjectView = {
    type: "tree",
    restRoute: `${route.revision}/${route.path}`,
  };
  if (route.activeView.type === "issue") {
    activeViewParams = { type: "issue", issue: route.activeView.issue.id };
  } else if (route.activeView.type === "patch") {
    activeViewParams = { type: "patch", patch: route.activeView.patch.id };
  }
  return {
    urn: route.urn,
    seedHost: route.seedHost,
    profileName: route.profileName,
    peer: route.peer,
    activeView: {
      ...activeViewParams,
    },
  };
}
