<script lang="ts">
  import type { Writable } from 'svelte/store';
  import type { Config } from "@app/config";
  import * as proj from '@app/project';

  import Project from './Project.svelte';

  export let browserStore: Writable<proj.Browser> = proj.browserStore;
  export let route: string | null = null;
  export let revision: string | null = null;
  export let peer: string | null;
  export let content: proj.ProjectContent = proj.ProjectContent.Tree;
  export let project: proj.Project;
  export let config: Config;

  const browse: proj.BrowseTo = { content, peer, path: "/" };
  const head = project.branches[project.defaultBranch];

  // route is passed when the URL has more params after e.g. /tree or /history
  $: if (route) {
    const { path, revision } = proj.parseRoute(route, project.branches);

    if (path) browse.path = path;
    if (revision) browse.revision = revision;
  } else if (revision) {
    browse.revision = revision;
  } else {
    browse.revision = head;
  }

  $: proj.browse({ ...browse, peer });
  $: browser = $browserStore;
</script>

<Project
  peer={browser.peer}
  revision={browser.revision || head}
  content={browser.content}
  {project}
  {config}
/>
