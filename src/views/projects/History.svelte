<script lang="ts">
  import type { BaseUrl, CommitHeader } from "@httpd-client";

  import * as router from "@app/lib/router";
  import { HttpdClient } from "@httpd-client";
  import { groupCommits } from "@app/lib/commit";

  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import List from "@app/components/List.svelte";

  export let id: string;
  export let baseUrl: BaseUrl;
  export let history: CommitHeader[];

  const api = new HttpdClient(baseUrl);

  const fetchMoreCommits = async (): Promise<CommitHeader[]> => {
    const response = await api.project.getAllCommits(id, {
      // Fetching 31 elements since we remove the first one
      parent: history[history.length - 1].id,
      perPage: 31,
    });
    // Removing the first element of the array, since it's the same as the last of the current list
    return response.commits.slice(1).map(c => c.commit);
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

  @media (max-width: 960px) {
    .history {
      padding-left: 2rem;
    }
  }
</style>

<div class="history">
  <List bind:items={history} query={fetchMoreCommits}>
    <svelte:fragment slot="list" let:items>
      {@const commits = groupCommits(items)}
      {#each commits as group (group.time)}
        <div class="commit-group">
          <header class="commit-date">
            <p>{group.date}</p>
          </header>
          <div class="commit-group-headers">
            {#each group.commits as commit (commit.id)}
              <CommitTeaser
                {commit}
                on:click={() => {
                  router.updateProjectRoute({
                    view: { resource: "commits" },
                    revision: commit.id,
                  });
                }}
                on:browseCommit={browseCommit} />
            {/each}
          </div>
        </div>
      {/each}
    </svelte:fragment>
  </List>
</div>
