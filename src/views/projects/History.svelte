<script lang="ts">
  import type { BaseUrl, CommitHeader } from "@httpd-client";

  import { HttpdClient } from "@httpd-client";
  import { groupCommits } from "@app/lib/commit";

  import Button from "@app/components/Button.svelte";
  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Loading from "@app/components/Loading.svelte";
  import { COMMITS_PER_PAGE } from "./router";

  export let baseUrl: BaseUrl;
  export let commitHeaders: CommitHeader[];
  export let peer: string | undefined = undefined;
  export let projectId: string;
  export let totalCommitCount: number;

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
      const response = await api.project.getAllCommits(projectId, {
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
</script>

<style>
  .history {
    padding: 0 2rem 0 8rem;
    font-size: var(--font-size-small);
  }
  .group {
    margin-bottom: 2rem;
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  .teaser-wrapper:not(:last-child) {
    border-bottom: 1px solid var(--color-background);
  }
  .more {
    margin-top: 2rem;
    text-align: center;
    min-height: 3rem;
  }
  @media (max-width: 960px) {
    .history {
      padding-left: 2rem;
    }
  }
</style>

<div class="history">
  {#each groupCommits(allCommitHeaders) as group (group.time)}
    <p style:color="var(--color-foreground-6)">{group.date}</p>
    <div class="group">
      {#each group.commits as commit (commit.id)}
        <div class="teaser-wrapper">
          <CommitTeaser {peer} {projectId} {baseUrl} {commit} />
        </div>
      {/each}
    </div>
  {/each}
  <div class="more">
    {#if loading}
      <Loading small={page !== 0} center />
    {:else if allCommitHeaders.length < totalCommitCount}
      <Button variant="foreground" on:click={loadMore}>More</Button>
    {/if}
  </div>
</div>

{#if error}
  <div class="message">
    <ErrorMessage message="Couldn't load commits." stackTrace={error} />
  </div>
{/if}
