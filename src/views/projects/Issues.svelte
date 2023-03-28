<script lang="ts" context="module">
  import type { IssueState } from "@app/lib/issue";

  export type IssueStatus = IssueState["status"];
</script>

<script lang="ts">
  import type { Project } from "@app/lib/project";
  import type { Issue } from "@app/lib/issue";
  import type { Tab } from "@app/components/TabBar.svelte";

  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import capitalize from "lodash/capitalize";
  import { groupIssues } from "@app/lib/issue";
  import { sessionStore } from "@app/lib/session";

  import HeaderToggleLabel from "@app/views/projects/HeaderToggleLabel.svelte";
  import IssueTeaser from "@app/views/projects/Issue/IssueTeaser.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import TabBar from "@app/components/TabBar.svelte";

  export let issues: Issue[];
  export let status: IssueStatus;
  export let project: Project;

  let options: Tab<IssueStatus>[];

  const stateOptions: IssueStatus[] = ["open", "closed"];
  $: options = stateOptions.map<{
    value: IssueStatus;
    title: string;
    disabled: boolean;
  }>((s: IssueStatus) => ({
    value: s,
    title: `${project.issues[s]} ${s}`,
    disabled: project.issues[s] === 0,
  }));
  $: filteredIssues = groupIssues(issues)[status];
  $: sortedIssues = filteredIssues.sort(
    ({ timestamp: t1 }, { timestamp: t2 }) => t2 - t1,
  );
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
  .section-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }

  @media (max-width: 960px) {
    .issues {
      padding-left: 2rem;
    }
  }
</style>

<div class="issues">
  <div class="section-header">
    <div style="margin-bottom: 1rem;">
      <TabBar
        {options}
        on:select={e =>
          router.updateProjectRoute({
            search: `state=${e.detail}`,
          })}
        active={status} />
    </div>
    <HeaderToggleLabel
      disabled={!$sessionStore || !utils.isLocal(project.seed.host)}
      on:click={() => {
        router.updateProjectRoute({
          view: {
            resource: "issues",
            params: { view: { resource: "new" } },
          },
        });
      }}
      clickable>
      New issue
    </HeaderToggleLabel>
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
    <Placeholder emoji="🍂">
      <div slot="title">{capitalize(status)} issues</div>
      <div slot="body">No issues matched the current filter</div>
    </Placeholder>
  {/if}
</div>
