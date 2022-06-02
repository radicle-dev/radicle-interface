<script lang="ts">
  import { Link } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Avatar from '@app/Avatar.svelte';
  import Placeholder from '@app/Placeholder.svelte';
  import Clipboard from '@app/Clipboard.svelte';
  import { formatProfile, formatSeedId, setOpenGraphMetaTag } from '@app/utils';
  import { browserStore } from '@app/project';

  import Header from '@app/base/projects/Header.svelte';

  import Browser from "./Browser.svelte";
  import Commit from "./Commit.svelte";
  import History from "./History.svelte";

  export let peer: string | null = null;
  export let config: Config;
  export let project: proj.Project;
  export let content: proj.ProjectContent;
  export let revision: string | null;

  let parentName = project.profile ? formatProfile(project.profile.nameOrAddress, config) : null;
  let pageTitle = parentName ? `${parentName}/${project.name}` : project.name;

  function rootPath(): string {
    return project.pathTo({
      content: proj.ProjectContent.Tree,
      peer: null,
      path: "/",
      revision: null,
    });
  }

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
  .title {
    display: flex;
    align-items: center;
    justify-content: left;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  .title .divider {
    color: var(--color-foreground-subtle);
    margin: 0 0.5rem;
    font-weight: normal;
  }
  .title .peer-id {
    color: var(--color-foreground-subtle);
    font-weight: normal;
  }
  .org-avatar {
    display: inline-block;
    width: 2rem;
    height: 2rem;
  }
  .urn {
    font-family: var(--font-family-monospace);
    font-size: 0.75rem;
    color: var(--color-foreground-faded);
    overflow-wrap: anywhere;
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 0.125rem;
  }
  .description {
    margin: 1rem 0 1.5rem 0;
  }

  .content {
    padding: 0 2rem 0 8rem;
  }

  @media (max-width: 960px) {
    .content {
      padding-left: 2rem;
    }

    .title {
      font-size: 1.375rem;
    }
    .description {
      font-size: 0.875rem;
    }
    .org-avatar {
      display: inline-block;
      width: 1.5rem;
      height: 1.5rem;
    }
  }
</style>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<header class="content">
  <div class="title bold">
    {#if project.profile}
      <a class="org-avatar" title={project.profile.nameOrAddress} href="/{project.profile.nameOrAddress}">
        <Avatar source={project.profile.avatar || project.profile.address} title={project.profile.address}/>
      </a>
      <span class="divider">/</span>
    {/if}
    <span class="text-truncate">
      <Link to={rootPath()}>{project.name}</Link>
    </span>
    {#if peer}
      <span class="peer-id">
        <span class="divider">/</span><span title={peer}>{formatSeedId(peer)}</span><Clipboard text={peer} />
      </span>
    {/if}
  </div>
  <div class="urn">
    <span class="text-truncate">{project.urn}</span>
    <Clipboard small text={project.urn} />
  </div>
  <div class="description">{project.description}</div>
</header>

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
