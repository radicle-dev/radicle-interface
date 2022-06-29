<script lang="ts">
  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import { Project, ProjectContent } from "@app/project";
  import type { GroupedCommitsHistory } from "@app/commit";

  export let project: Project;
  export let history: GroupedCommitsHistory;

  const navigateHistory = (revision: string, content?: ProjectContent) => {
    project.navigateTo({ content, revision, issue: null, patch: null, path: null });
  };

  const browseCommit = (event: { detail: string }) => {
    project.navigateTo({ content: ProjectContent.Tree, revision: event.detail, issue: null, path: null });
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
    margin-bottom: 2rem;
  }

  .commit {
    background-color: var(--color-foreground-background);
  }
  .commit:not(:last-child) {
    border-bottom: 1px dashed var(--color-background);
  }
  .commit:hover {
    background-color: var(--color-foreground-background-lighter);
    cursor: pointer;
  }
  .commit:first-child {
    border-top-left-radius: var(--border-radius-small);
    border-top-right-radius: var(--border-radius-small);
  }
  .commit:last-child {
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
  }

  @media (max-width: 960px) {
    .history {
      padding-left: 2rem;
    }
  }
</style>

  <div class="history">
    {#each history.headers as group (group.time)}
      <div class="commit-group">
        <header class="commit-date">
          <p>{group.date}</p>
        </header>
        <div class="commit-group-headers">
          {#each group.commits as commit (commit.header.sha1)}
            <div class="commit" on:click={() => navigateHistory(commit.header.sha1, ProjectContent.Commit)}>
              <CommitTeaser {commit} on:browseCommit={browseCommit} />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
