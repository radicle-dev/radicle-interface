<script lang="ts">
  import type { Writable } from 'svelte/store';
  import * as proj from '@app/project';

  export let browserStore: Writable<proj.Browser>;
  export let route: string | null = null;
  export let revision: string | null = null;
  export let peer: string | null;
  export let content: proj.ProjectContent = proj.ProjectContent.Tree;
  export let branches: proj.Branches;
  export let project: proj.ProjectInfo;

  const browse: any = { content, peer, branches, path: "/" };

  $: if (route) {
    const result = proj.splitPrefixFromPath(route, $browserStore.branches);

    console.log("RouteParser", route, result);

    if (result) {
      const [revision, path] = result;

      browse.revision = revision;
      browse.path = path;
    }
  } else if (revision) {
    browse.revision = revision;
  } else {
    browse.revision = branches[project.defaultBranch];
  }

  $: proj.browse(browse);
  $: browser = $browserStore;
  $: commit = browser.revision && proj.getOid(browser.revision, browser.branches);
</script>

<slot
  revision={browser.revision}
  peer={browser.peer}
  path={browser.path || "/"}
  {commit}
></slot>
