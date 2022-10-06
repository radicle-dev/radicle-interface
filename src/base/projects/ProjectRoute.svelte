<script lang="ts">
  import type { Config } from "@app/config";
  import type { RouteLocation } from "@app/index";
  import type { Writable } from "svelte/store";

  import * as proj from "@app/project";
  import Project from "@app/base/projects/Project.svelte";
  import { formatLocationHash } from "@app/utils";

  export let browserStore: Writable<proj.Browser> = proj.browserStore;
  export let config: Config;
  export let content: proj.ProjectContent = proj.ProjectContent.Tree;
  export let issue: string | null = null;
  export let location: RouteLocation | null = null;
  export let patch: string | null = null;
  export let peer: string | null;
  export let project: proj.Project;
  export let revision: string | null = null;
  export let route: string | null = null;

  const browse: proj.BrowseTo = { content, peer, path: "/" };
  const head = project.branches[project.defaultBranch] || null;

  // If line-number hash changes, we update the browser.
  $: browse.line = formatLocationHash(location?.hash || null);

  // `route` includes any unmatched path segments.
  $: if (route) {
    const { path, revision } = proj.parseRoute(route, project.branches);

    if (path) browse.path = path;
    if (revision) browse.revision = revision;
  } else if (revision) {
    browse.revision = revision;
  } else if (issue) {
    browse.issue = issue;
  } else if (location) {
    browse.search = new URLSearchParams(location.search);
  } else if (patch) {
    browse.patch = patch;
  } else if (head) {
    browse.revision = head;
  } else {
    const branchNames = Object.keys(project.branches);
    const firstBranch = branchNames.length >= 1 ? branchNames[0] : null;

    browse.revision = firstBranch;
  }

  $: proj.browse({ ...browse, peer });
  $: browser = $browserStore;
</script>

<Project
  peer={browser.peer}
  revision={browser.revision || head}
  content={browser.content}
  {project}
  {config} />
