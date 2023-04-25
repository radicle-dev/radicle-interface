<script lang="ts" context="module">
  import type { IssueState } from "@httpd-client";

  export type IssueStatus = IssueState["status"];
</script>

<script lang="ts">
  import type { Issue } from "@httpd-client";
  import type { Tab } from "@app/components/TabBar.svelte";
  import type { BaseUrl } from "@httpd-client";

  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import capitalize from "lodash/capitalize";
  import { HttpdClient } from "@httpd-client";
  import { sessionStore } from "@app/lib/session";

  import Button from "@app/components/Button.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import HeaderToggleLabel from "@app/views/projects/HeaderToggleLabel.svelte";
  import IssueTeaser from "@app/views/projects/Issue/IssueTeaser.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import TabBar from "@app/components/TabBar.svelte";

  export let projectId: string;
  export let state: IssueStatus;
  export let baseUrl: BaseUrl;
  export let issueCounters: { open: number; closed: number };

  const perPage = 10;

  // Keeping it true, to avoid an initial flash
  // of EmptyState Placeholder
  let refresh = true;
  let loading = false;
  let page = 0;
  let error: any;
  let issues: Issue[] = [];

  const api = new HttpdClient(baseUrl);

  async function loadIssues(): Promise<void> {
    loading = true;
    try {
      const response = await api.project.getAllIssues(projectId, {
        state,
        page,
        perPage,
      });
      issues = [...issues, ...response];
      page += 1;
    } catch (e) {
      error = e;
    } finally {
      loading = false;
      refresh = false;
    }
  }

  function switchState(e: CustomEvent<IssueStatus>): void {
    refresh = true;
    // Update state to be used in the query
    state = e.detail;
    // Reset page to 0 to load the first page for a new state
    page = 0;
    // Remove all existing patches with old state
    issues = [];
    loadIssues();
    router.updateProjectRoute({
      search: `state=${state}`,
    });
  }

  const stateOptions: IssueStatus[] = ["open", "closed"];
  const options = stateOptions.map<Tab<IssueStatus>>(s => ({
    value: s,
    title: `${issueCounters[s]} ${s}`,
    disabled: issueCounters[s] === 0,
  }));

  $: showMoreButton =
    !loading &&
    !error &&
    issueCounters[state] &&
    issues.length < issueCounters[state];

  loadIssues();
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
  .loader {
    margin-top: 8rem;
  }
  .more {
    margin-top: 2rem;
    text-align: center;
    min-height: 3rem;
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
      <TabBar {options} on:select={switchState} active={state} />
    </div>
    <HeaderToggleLabel
      disabled={!$sessionStore || !utils.isLocal(baseUrl.hostname)}
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
  <div class="issues-list">
    {#if refresh}
      <div class="loader">
        <Loading center />
      </div>
    {:else}
      {#each issues as issue}
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
      {:else}
        {#if error}
          <ErrorMessage message="Couldn't load issues." stackTrace={error} />
        {:else}
          <Placeholder emoji="🍂">
            <div slot="title">{capitalize(state)} issues</div>
            <div slot="body">No issues matched the current filter</div>
          </Placeholder>
        {/if}
      {/each}
      <div class="more">
        {#if loading}
          <Loading small={page !== 0} center />
        {/if}

        {#if showMoreButton}
          <Button variant="foreground" on:click={loadIssues}>More</Button>
        {/if}
      </div>
    {/if}
  </div>
</div>
