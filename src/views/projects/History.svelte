<script lang="ts">
  import type {
    BaseUrl,
    CommitHeader,
    Project,
    Remote,
    Tree,
  } from "@httpd-client";
  import type { Route } from "@app/lib/router";

  import { HttpdClient } from "@httpd-client";
  import { groupCommits } from "@app/lib/commit";
  import { COMMITS_PER_PAGE } from "./router";

  import Button from "@app/components/Button.svelte";
  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Header from "./Source/Header.svelte";
  import Layout from "./Layout.svelte";
  import List from "@app/components/List.svelte";
  import Loading from "@app/components/Loading.svelte";
  import ProjectNameHeader from "./Source/ProjectNameHeader.svelte";

  export let baseUrl: BaseUrl;
  export let branches: string[];
  export let commitHeaders: CommitHeader[];
  export let peer: string | undefined;
  export let peers: Remote[];
  export let project: Project;
  export let revision: string | undefined;
  export let totalCommitCount: number;
  export let tree: Tree;
  export let seeding: boolean;

  const api = new HttpdClient(baseUrl);

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
      allCommitHeaders = [
        ...allCommitHeaders,
        ...response.commits.map(c => c.commit),
      ];
      totalCommitCount = response.stats.commits;
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
    margin: 2rem 0;
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

<Layout {baseUrl} {project} activeTab="source" styleRightContentPadding="0">
  <ProjectNameHeader {project} {baseUrl} {seeding} slot="header" />

  <div style:margin-top="1rem" style:margin-left="1rem" slot="subheader">
    <Header
      node={baseUrl}
      {project}
      peers={peersWithRoute}
      branches={branchesWithRoute}
      {revision}
      {tree}
      filesLinkActive={false}
      historyLinkActive={true} />
  </div>

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

  {#if loading || allCommitHeaders.length < totalCommitCount}
    <div class="more">
      {#if loading}
        <Loading small={page !== 0} center />
      {:else if allCommitHeaders.length < totalCommitCount}
        <Button size="large" variant="outline" on:click={loadMore}>More</Button>
      {/if}
    </div>
  {/if}

  {#if error}
    <div class="message">
      <ErrorMessage message="Couldn't load commits" {error} />
    </div>
  {/if}
</Layout>
