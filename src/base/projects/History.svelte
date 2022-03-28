<script lang="ts">
  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import type { Project } from "@app/project";
  import { ProjectContent } from "@app/project";
  import Loading from "@app/Loading.svelte";
  import { groupCommitHistory, GroupedCommitsHistory } from "@app/commit";

  export let project: Project;
  export let commit: string;

  const navigateHistory = (revision: string, content?: ProjectContent) => {
    project.navigateTo({ content, revision, path: null });
  };
  const fetchCommits = async (parentCommit: string): Promise<GroupedCommitsHistory> => {
    const commitsQuery = await project.getCommits(parentCommit);
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
  .commit {
    cursor: pointer;
  }
  .commit:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
  .commit:last-child {
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
  .commit:hover {
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
          <p>{group.time}</p>
        </header>
        <div class="commit-group-headers">
          {#each group.commits as commit (commit.header.sha1)}
            <div class="commit" on:click={() => navigateHistory(commit.header.sha1, ProjectContent.Commit)}>
              <CommitTeaser {commit} on:browseCommit={(event) => navigateHistory(event.detail)} />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{:catch err}
  <div class="history">
    <div class="error error-message text-xsmall">
      <div>API request to <code class="text-xsmall">{err.url}</code> failed.</div>
    </div>
  </div>
{/await}
