<script lang="ts">
  import type { CommitMetadata, CommitsHistory } from "@app/lib/commit";

  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import { Project } from "@app/lib/project";
  import { groupCommits } from "@app/lib/commit";
  import List from "@app/components/List.svelte";
  import * as router from "@app/lib/router";

  export let project: Project;
  export let history: CommitsHistory;

  const fetchMoreCommits = async (): Promise<CommitMetadata[]> => {
    const response = await Project.getCommits(project.id, project.seed.addr, {
      // Fetching 31 elements since we remove the first one
      parent: history.commits[history.commits.length - 1].commit.id,
      perPage: 31,
      verified: true,
    });
    // Removing the first element of the array, since it's the same as the last of the current list
    return response.commits.slice(1);
  };

  const browseCommit = (event: { detail: string }) => {
    router.updateProjectRoute({
      view: { resource: "tree" },
      revision: event.detail,
    });
  };
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
  .commit:not(:last-child) {
    border-bottom: 1px dashed var(--color-background);
  }
  .commit:hover {
    background-color: var(--color-foreground-2);
    cursor: pointer;
    border-radius: var(--border-radius-small);
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
  <List bind:items={history.commits} query={fetchMoreCommits}>
    <svelte:fragment slot="list" let:items>
      {@const commits = groupCommits(items)}
      {#each commits as group (group.time)}
        <div class="commit-group">
          <header class="commit-date">
            <p>{group.date}</p>
          </header>
          <div class="commit-group-headers">
            {#each group.commits as commit (commit.commit.id)}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <div
                class="commit"
                on:click={() => {
                  router.updateProjectRoute({
                    view: { resource: "commits" },
                    revision: commit.commit.id,
                  });
                }}>
                <CommitTeaser {commit} on:browseCommit={browseCommit} />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </svelte:fragment>
  </List>
</div>
