import type { Config } from "@app/config";
import type { Writable } from "svelte/store";

import { parseRoute, type Tree } from "@app/project";
import { Project } from "@app/project";
import { writable } from "svelte/store";

export type Content = "tree" | "history" | "commits" | "issues" | "patches";

export interface Params {
  urn: string;
  content: Content;
  seedHost?: string;
  profileName?: string;
  revision?: string;
  path?: string;
  peer?: string;
  issue?: string;
  patch?: string;
  restRoute?: string; // The resting URL to be parsed with project data.
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
  activeView: ProjectView;
}

export type ProjectView =
  | {
      type: "tree";
      line?: number;
      peer?: string;
      tree: Tree;
      commit: string;
    }
  | {
      type: "history";
      peer?: string;
      tree: Tree;
      commit: string;
    }
  | {
      type: "commits";
      peer?: string;
      tree: Tree;
      commit: string;
    }
  | {
      type: "commits";
      commit: string;
      tree: Tree;
    }
  | {
      type: "patches";
      patch?: string;
      tree: Tree;
    }
  | {
      type: "issues";
      issue?: string;
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
  const path = parsed.path || "/";
  const revision = parsed.revision || project.head;
  const line = parsed.line || undefined;

  const root = await project.getRoot(revision);
  let activeView: ProjectView;
  switch (params.content) {
    case "tree":
      activeView = {
        type: "tree",
        line,
        peer: params.peer,
        tree: root.tree,
        commit: root.commit,
      };
      break;
    case "history":
      activeView = {
        type: "history",
        peer: params.peer,
        tree: root.tree,
        commit: root.commit,
      };
      break;
    case "commits":
      activeView = {
        type: "commits",
        peer: params.peer,
        tree: root.tree,
        commit: root.commit,
      };
      break;
    case "issues":
      activeView = {
        type: "issues",
        issue: params.issue,
        tree: root.tree,
      };
      break;
    case "patches":
      activeView = {
        type: "patches",
        patch: params.patch,
        tree: root.tree,
      };
      break;
    default:
      activeView = {
        type: "tree",
        line,
        peer: params.peer,
        tree: root.tree,
        commit: root.commit,
      };
  }

  routeLoading.set(false);
  return {
    type: "projects",
    urn: params.urn,
    peer: params.peer,
    revision: params.revision || root.commit,
    restRoute: `${params.revision || root.commit}/${path}`,
    path,
    seedHost: params.seedHost,
    profileName: params.profileName,
    project,
    activeView,
  };
}
