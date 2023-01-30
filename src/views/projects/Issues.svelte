<script lang="ts" context="module">
  export type State = "open" | "closed";
</script>

<script lang="ts">
  import type { Issue } from "@app/lib/issue";
  import type { Tab } from "@app/components/TabBar.svelte";

  import { capitalize } from "@app/lib/utils";
  import { groupIssues } from "@app/lib/issue";
  import * as router from "@app/lib/router";

  import IssueTeaser from "@app/views/projects/Issue/IssueTeaser.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import TabBar from "@app/components/TabBar.svelte";

  export let issues: Issue[];
  export let state: State;

  let options: Tab<State>[];
  const { open, closed } = groupIssues(issues);

  $: filteredIssues = state === "open" ? open : closed;
  $: sortedIssues = filteredIssues.sort(
    ({ timestamp: t1 }, { timestamp: t2 }) => t2 - t1,
  );

  $: options = [
    {
      value: "open",
      count: open.length,
    },
    {
      value: "closed",
      count: closed.length,
    },
  ];
</script>

<style>
  .issues {
    padding: 0 2rem 0 8rem;
    font-size: var(--font-size-small);
  }
  .issues-list {
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  .teaser:not(:last-child) {
    border-bottom: 1px dashed var(--color-background);
  }

  @media (max-width: 960px) {
    .issues {
      padding-left: 2rem;
    }
  }
</style>

<div class="issues">
  <div style="margin-bottom: 1rem;">
    <TabBar
      {options}
      on:select={e =>
        router.updateProjectRoute({
          search: `state=${e.detail}`,
        })}
      active={state} />
  </div>

  {#if filteredIssues.length}
    <div class="issues-list">
      {#each sortedIssues as issue}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="teaser"
          on:click={() => {
            router.updateProjectRoute({
              view: {
                resource: "issue",
                params: { issue: issue.id },
              },
            });
          }}>
          <IssueTeaser {issue} />
        </div>
      {/each}
    </div>
  {:else}
    <Placeholder emoji="🍣">
      <div slot="title">{capitalize(state)} issues</div>
      <div slot="body">No issues matched the current filter</div>
    </Placeholder>
  {/if}
</div>
