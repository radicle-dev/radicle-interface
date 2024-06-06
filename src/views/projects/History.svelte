<script lang="ts">
  import type {
    BaseUrl,
    CommitHeader,
    Project,
    Remote,
    Node,
    Tree,
  } from "@http-client";
  import type { Route } from "@app/lib/router";

  import { COMMITS_PER_PAGE } from "./router";
  import { HttpdClient } from "@http-client";
  import { baseUrlToString } from "@app/lib/utils";
  import { groupCommits } from "@app/lib/commit";

  import Button from "@app/components/Button.svelte";
  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Header from "./Source/Header.svelte";
  import Layout from "./Layout.svelte";
  import List from "@app/components/List.svelte";
  import Loading from "@app/components/Loading.svelte";
  import ProjectNameHeader from "./Source/ProjectNameHeader.svelte";

  export let baseUrl: BaseUrl;
  export let node: Node;
  export let commit: string;
  export let branches: string[];
  export let commitHeaders: CommitHeader[];
  export let peer: string | undefined;
  export let peers: Remote[];
  export let project: Project;
  export let revision: string | undefined;
  export let tree: Tree;
  export let seeding: boolean;

  const api = new HttpdClient(baseUrl);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let error: any;
  let page = 0;
  let loading = false;
  let allCommitHeaders: CommitHeader[];

  $: {
    allCommitHeaders = commitHeaders;
    page = 0;
  }

  async function loadMore() {
    loading = true;
    page += 1;
    try {
      const response = await api.project.getAllCommits(project.id, {
        parent: allCommitHeaders[0].id,
        page,
        perPage: COMMITS_PER_PAGE,
      });
      allCommitHeaders = response;
    } catch (e) {
      error = e;
    }
    loading = false;
  }

  $: peersWithRoute = peers.map(remote => ({
    remote,
    selected: remote.id === peer,
    route: {
      resource: "project.history",
      node: baseUrl,
      project: project.id,
      peer: remote.id,
    } as Route,
  }));

  $: branchesWithRoute = branches.map(name => ({
    name,
    route: {
      resource: "project.history",
      node: baseUrl,
      project: project.id,
      peer,
      revision: name,
    } as Route,
  }));
</script>

<style>
  .more {
    margin-top: 2rem;
    min-height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .group-header {
    margin-left: 1rem;
    margin-top: 3rem;
    margin-bottom: 1rem;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    color: var(--color-foreground-dim);
  }
  .group-header:first-child {
    margin-top: 0;
  }
</style>

<Layout {node} {baseUrl} {project} activeTab="source">
  <ProjectNameHeader {project} {baseUrl} {seeding} slot="header" />

  <div style:margin="1rem 0 1rem 1rem" slot="subheader">
    <Header
      node={baseUrl}
      {commit}
      {project}
      peers={peersWithRoute}
      branches={branchesWithRoute}
      {revision}
      {tree}
      filesLinkActive={false}
      historyLinkActive={true} />
  </div>

  <div>
    {#each groupCommits(allCommitHeaders) as group (group.time)}
      <div class="group-header">{group.date}</div>
      <List items={group.commits}>
        <CommitTeaser
          slot="item"
          let:item
          projectId={project.id}
          {baseUrl}
          commit={item} />
      </List>
    {/each}
  </div>

  {#await api.project.getTreeStatsBySha(project.id, commit)}
    <div class="more">
      <Loading small center />
    </div>
  {:then stats}
    {#if loading || allCommitHeaders.length < stats.commits}
      <div class="more">
        {#if loading}
          <Loading small={page !== 0} center />
        {:else if allCommitHeaders.length < stats.commits}
          <Button size="large" variant="outline" on:click={loadMore}>
            More
          </Button>
        {/if}
      </div>
    {/if}

    {#if error}
      <div class="message">
        <ErrorMessage
          title="Couldn't load commits"
          description="Make sure you are able to connect to the seed <code>${baseUrlToString(
            api.baseUrl,
          )}</code>"
          {error} />
      </div>
    {/if}
  {:catch error}
    <div class="message">
      <ErrorMessage
        title="Couldn't load repo stats"
        description="Make sure you are able to connect to the seed <code>${baseUrlToString(
          api.baseUrl,
        )}</code>"
        {error} />
    </div>
  {/await}
</Layout>
