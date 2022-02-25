<script lang="ts">
  import type { Writable } from 'svelte/store';
  import type { Config } from "@app/config";
  import { formatLocationHash } from '@app/utils';
  import * as proj from '@app/project';

  import Project from './Project.svelte';

  export let browserStore: Writable<proj.Browser> = proj.browserStore;
  export let route: string | null = null;
  export let revision: string | null = null;
  export let peer: string | null;
  export let content: proj.ProjectContent = proj.ProjectContent.Tree;
  export let project: proj.Project;
  export let config: Config;
  export let hash: string | null = null;

  const browse: proj.BrowseTo = { content, peer, path: "/" };
  const head = project.branches[project.defaultBranch];

  // If line-number hash changes, we update the browser.
  $: browse.line = formatLocationHash(hash);

  // `route` includes any unmatched path segments.
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
