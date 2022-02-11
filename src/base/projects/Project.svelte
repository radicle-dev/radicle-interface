<script lang="ts">
  import { Link } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Avatar from '@app/Avatar.svelte';
  import { formatProfile, formatSeedId, setOpenGraphMetaTag } from '@app/utils';
  import { browserStore } from '@app/project';

  import Header from '@app/base/projects/Header.svelte';

  import Browser from "./Browser.svelte";
  import Commit from "./Commit.svelte";
  import History from "./History.svelte";

  export let peer: string | null = null;
  export let config: Config;
  export let source: proj.Source;
  export let content: proj.ProjectContent;
  export let revision: string;

  const project = source.project;

  let parentName = source.profile ? formatProfile(source.profile.nameOrAddress, config) : null;
  let pageTitle = parentName ? `${parentName}/${project.name}` : project.name;

  function rootPath(source: proj.Source): string {
    return proj.pathTo({
      content: proj.ProjectContent.Tree,
      peer: null,
      path: "/",
      revision: null,
    }, source);
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
  header {
    padding: 0 2rem 0 8rem;
  }
  .title {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  .title .divider {
    color: var(--color-foreground-subtle);
    margin: 0 0.5rem;
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
  }
  .description {
    margin: 1rem 0 1.5rem 0;
  }

  @media (max-width: 960px) {
    .title {
      font-size: 1.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
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

<header>
  <div class="title bold">
    {#if source.profile}
      <a class="org-avatar" title={source.profile.nameOrAddress} href="/{source.profile.nameOrAddress}">
        <Avatar source={source.profile.avatar || source.profile.address} address={source.profile.address}/>
      </a>
      <span class="divider">/</span>
    {/if}
    <Link to={rootPath(source)}>{source.project.name}</Link>
    {#if peer}
      <span class="divider" title={peer}>/ {formatSeedId(peer)}</span>
    {/if}
  </div>
  <div class="urn">{source.urn}</div>
  <div class="description">{source.project.description}</div>
</header>

{#await proj.getRoot(source.project, revision, source.branches, source.seed.api) then { tree, commit }}
  <Header {tree} {commit} {browserStore} {source} peerSelector={! source.profile} />

  {#if content == proj.ProjectContent.Tree}
    <Browser {source} {tree} {browserStore} />
  {:else if content == proj.ProjectContent.History}
    <History {source} {commit} />
  {:else if content == proj.ProjectContent.Commit}
    <Commit {source} {commit} />
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
