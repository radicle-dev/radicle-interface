<script lang="ts">
  import type { BaseUrl, CommitHeader } from "@httpd-client";

  import * as router from "@app/lib/router";
  import { HttpdClient } from "@httpd-client";
  import { groupCommits } from "@app/lib/commit";

  import Button from "@app/components/Button.svelte";
  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Loading from "@app/components/Loading.svelte";

  export let projectId: string;
  export let baseUrl: BaseUrl;
  export let parentCommit: string;

  const perPage = 30;

  let page = 0;
  let error: any;
  let loading = false;
  let totalCommitCount: number | undefined = undefined;
  let history: CommitHeader[] = [];

  const api = new HttpdClient(baseUrl);

  async function loadHistory(): Promise<void> {
    loading = true;
    try {
      const response = await api.project.getAllCommits(projectId, {
        parent: parentCommit,
        page,
        perPage,
      });
      history = [...history, ...response.commits.map(c => c.commit)];
      totalCommitCount = response.stats.commits;
      page += 1;
    } catch (e) {
      error = e;
    } finally {
      loading = false;
    }
  }

  function goToSourceTreeAtCommit(event: { detail: string }) {
    router.updateProjectRoute({
      view: { resource: "tree" },
      revision: event.detail,
    });
  }

  function goToCommit(revision: string) {
    router.updateProjectRoute({
      view: { resource: "commits" },
      revision,
    });
  }

  $: showMoreButton =
    !loading && !error && totalCommitCount && history.length < totalCommitCount;

  loadHistory();
</script>

<style>
  .history {
    padding: 0 2rem 0 8rem;
    font-size: var(--font-size-small);
  }
  .commit-group header {
    color: var(--color-foreground-6);
  }
  .commit-group-headers {
    margin-bottom: 2rem;
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

{#if history}
  <div class="history">
    {#each groupCommits(history) as group (group.time)}
      <div class="commit-group">
        <header class="commit-date">
          <p>{group.date}</p>
        </header>
        <div class="commit-group-headers">
          {#each group.commits as commit (commit.id)}
            <CommitTeaser
              {commit}
              on:click={() => goToCommit(commit.id)}
              on:browseCommit={goToSourceTreeAtCommit} />
          {/each}
        </div>
      </div>
    {/each}
    <div class="more">
      {#if loading}
        <Loading small={page !== 0} center />
      {/if}

      {#if showMoreButton}
        <Button variant="foreground" on:click={loadHistory}>More</Button>
      {/if}
    </div>
  </div>
{/if}

{#if error}
  <div class="message">
    <ErrorMessage message="Couldn't load commits." stackTrace={error} />
  </div>
{/if}
