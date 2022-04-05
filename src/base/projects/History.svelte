<script lang="ts">
  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import { Project } from "@app/project";
  import Loading from "@app/Loading.svelte";
  import { groupCommitHistory, GroupedCommitsHistory } from "@app/commit";
  import Message from "@app/Message.svelte";

  export let project: Project;
  export let commit: string;

  const fetchCommits = async (parentCommit: string): Promise<GroupedCommitsHistory> => {
    const commitsQuery = await Project.getCommits(project.urn, project.seed.api, parentCommit);
    return groupCommitHistory(commitsQuery);
  };
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
  .commit-group-headers {
    cursor: pointer;
  }
  .commit-group-headers:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
  .commit-group-headers:last-child {
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
  .commit-group-headers {
    background: var(--color-foreground-background-lighter);
  }
  @media (max-width: 960px) {
    .history {
      padding-left: 2rem;
    }
  }
</style>

{#await fetchCommits(commit)}
  <Loading center />
{:then history}
  <div class="history">
    {#each history.headers as group (group.time)}
      <div class="commit-group">
        <header class="commit-date">
          <p>{group.date}</p>
        </header>
        <div class="commit-group-headers">
          {#each group.commits as commit (commit.header.sha1)}
            <CommitTeaser {project} {commit} />
          {/each}
        </div>
      </div>
    {/each}
  </div>
{:catch err}
  <div class="history">
    <Message error>
      {#if err.url}
        API request to <code class="text-xsmall">{err.url}</code> failed.
      {:else}
        {err.message}
      {/if}
    </Message>
  </div>
{/await}
