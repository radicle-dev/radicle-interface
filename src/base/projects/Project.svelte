<script lang="ts">
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Placeholder from '@app/Placeholder.svelte';
  import { formatProfile, formatSeedId, setOpenGraphMetaTag } from '@app/utils';
  import { browserStore } from '@app/project';

  import Header from '@app/base/projects/Header.svelte';

  import Browser from "./Browser.svelte";
  import Commit from "./Commit.svelte";
  import History from "./History.svelte";
  import Issues from './Issues.svelte';
  import Issue from './Issue.svelte';
  import ProjectMeta from './ProjectMeta.svelte';

  export let peer: string | null = null;
  export let config: Config;
  export let project: proj.Project;
  export let content: proj.ProjectContent;
  export let revision: string | null;

  let parentName = project.profile ? formatProfile(project.profile.nameOrAddress, config) : null;
  let pageTitle = parentName ? `${parentName}/${project.name}` : project.name;

  const baseName = parentName
    ? `${parentName}/${project.name}`
    : project.name;

  if (project.description) {
    pageTitle = `${baseName}: ${project.description}`;
  } else {
    pageTitle = baseName;
  }

  setOpenGraphMetaTag([
    { prop: "og:title", content: project.name },
    { prop: "og:description", content: project.description },
    { prop: "og:url", content: window.location.href }
  ]);
</script>

<style>
  .content {
    padding: 0 2rem 0 8rem;
  }
  @media (max-width: 960px) {
    .content {
      padding-left: 2rem;
    }
  }
</style>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<ProjectMeta noDescription={content !== proj.ProjectContent.Tree} {project} {peer} />

{#if revision}
  {#await project.getRoot(revision) then { tree, commit }}
    <Header {tree} {commit} {browserStore} {project} />

    {#if content == proj.ProjectContent.Tree}
      <Browser {project} {commit} {tree} {browserStore} />
    {:else if content == proj.ProjectContent.History}
      <History {project} {commit} />
    {:else if content == proj.ProjectContent.Commit}
      <Commit {project} {commit} />
    {/if}
  {:catch err}
    <div class="container center-content">
      <div class="error error-message text-xsmall">
        <!-- TODO: Differentiate between (1) commit doesn't exist and (2) failed
             to fetch - this needs a change to the backend. -->
        API request to <code class="text-xsmall">{err.url}</code> failed
      </div>
    </div>
  {/await}

  {#if content == proj.ProjectContent.Issues}
    <Issues {project} {config} />
  {:else if content == proj.ProjectContent.Issue && $browserStore.issue}
    <Issue {project} {config} issue={$browserStore.issue} />
  {/if}
{:else}
  <div class="content">
    {#if peer}
      <Placeholder icon="🍂">
        <span slot="title"><code>{formatSeedId(peer)}</code></span>
        <span slot="body">Couldn't load remote source tree.</span>
      </Placeholder>
    {:else}
      <Placeholder icon="🍂">
        <span slot="body">Couldn't load source tree.</span>
      </Placeholder>
    {/if}
  </div>
{/if}
