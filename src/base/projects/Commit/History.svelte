<script lang="ts">
  import CommitTeaser from "./CommitTeaser.svelte";
  import { getCommits } from "@app/project";
  import type { Config } from "@app/config";
  import Loading from "@app/Loading.svelte";
  import { groupCommitHistory, GroupedCommitsHistory } from "./lib";

  export let commit: string;
  export let urn: string;
  export let config: Config;

  async function fetchCommits(): Promise<GroupedCommitsHistory> {
    const commitsQuery = await getCommits(urn, commit, config);
    return groupCommitHistory(commitsQuery);
  }
</script>

<style>
  .history {
    padding: 0 2rem 0 8rem;
    font-size: 0.875rem;
  }
  .commit-group header {
    color: var(--color-foreground-faded);
  }
  .commit-group-headers {
    border-radius: 0.25rem;
    margin-bottom: 2rem;
    background: var(--color-foreground-background);
  }
  .commit {
    padding: 0.25rem 0;
  }
  @media (max-width: 720px) {
    .history {
      padding-left: 2rem;
    }
  }
</style>

{#await fetchCommits()}
  <Loading center />
{:then history}
  <div class="history">
    {#each history.headers as group (group.time)}
      <div class="commit-group">
        <header>
          <p>{group.time}</p>
        </header>
        <div class="commit-group-headers">
          {#each group.commits as commit (commit.sha1)}
            <div class="commit">
              <CommitTeaser {commit} />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/await}
