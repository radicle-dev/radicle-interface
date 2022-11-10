<script lang="ts" context="module">
  export type State = "open" | "closed";
</script>

<script lang="ts">
  import type { Wallet } from "@app/wallet";
  import type { Issue } from "@app/issue";
  import type { ToggleButtonOption } from "@app/ToggleButton.svelte";

  import { capitalize } from "@app/utils";
  import { groupIssues } from "@app/issue";
  import * as router from "@app/router";

  import IssueTeaser from "@app/base/projects/Issue/IssueTeaser.svelte";
  import Placeholder from "@app/Placeholder.svelte";
  import ToggleButton from "@app/ToggleButton.svelte";

  export let wallet: Wallet;
  export let issues: Issue[];
  export let state: State;

  let options: ToggleButtonOption<State>[];
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
    <ToggleButton
      {options}
      on:select={e => {
        router.updateProjectRoute({
          search: e.detail,
        });
      }}
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
          <IssueTeaser {wallet} {issue} />
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
