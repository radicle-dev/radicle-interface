<script lang="ts">
  import type { BaseUrl, Issue, IssueState } from "@httpd-client";

  import * as utils from "@app/lib/utils";
  import capitalize from "lodash/capitalize";
  import { HttpdClient } from "@httpd-client";
  import { httpdStore } from "@app/lib/httpd";
  import { ISSUES_PER_PAGE } from "./router";

  import Button from "@app/components/Button.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import IssueTeaser from "@app/views/projects/Issue/IssueTeaser.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

  export let projectId: string;
  export let baseUrl: BaseUrl;
  export let issues: Issue[];
  export let state: IssueState["status"];
  export let issueCounters: { open: number; closed: number };

  let loading = false;
  let page = 0;
  let error: any;
  let allIssues: Issue[];

  $: {
    allIssues = issues;
    page = 0;
  }

  const api = new HttpdClient(baseUrl);

  async function loadIssues(state: IssueState["status"]): Promise<void> {
    loading = true;
    page += 1;
    try {
      const response = await api.project.getAllIssues(projectId, {
        state,
        page,
        perPage: ISSUES_PER_PAGE,
      });
      allIssues = [...allIssues, ...response];
    } catch (e) {
      error = e;
    } finally {
      loading = false;
    }
  }

  interface Tab {
    value: IssueState["status"];
    title: string;
    disabled: boolean;
  }

  const stateOptions: IssueState["status"][] = ["open", "closed"];
  $: options = stateOptions.map<Tab>(s => ({
    value: s,
    title: `${issueCounters[s]} ${s}`,
    disabled: issueCounters[s] === 0,
  }));

  $: showMoreButton =
    !loading && !error && allIssues.length < issueCounters[state];
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
    border-bottom: 1px solid var(--color-background);
  }
  .section-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
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
    <div style="margin-bottom: 2rem;">
      <div style="display: flex; gap: 0.5rem;">
        {#each options as option}
          {#if !option.disabled}
            <Link
              route={{
                resource: "project.issues",
                project: projectId,
                node: baseUrl,
                state: option.value,
              }}>
              <SquareButton
                clickable={option.disabled}
                active={option.value === state}
                disabled={option.disabled}>
                {option.title}
              </SquareButton>
            </Link>
          {:else}
            <SquareButton
              clickable={option.disabled}
              active={option.value === state}
              disabled={option.disabled}>
              {option.title}
            </SquareButton>
          {/if}
        {/each}
      </div>
    </div>
    {#if $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)}
      <Link
        route={{
          resource: "project.newIssue",
          project: projectId,
          node: baseUrl,
        }}>
        <SquareButton>New issue</SquareButton>
      </Link>
    {/if}
  </div>
  <div class="issues-list">
    {#each allIssues as issue (issue.id)}
      <div class="teaser">
        <IssueTeaser {projectId} {baseUrl} {issue} />
      </div>
    {:else}
      {#if error}
        <ErrorMessage message="Couldn't load issues." stackTrace={error} />
      {:else if loading}
        <!-- We already show a loader below. -->
      {:else}
        <Placeholder emoji="🍂">
          <div slot="title">{capitalize(state)} issues</div>
          <div slot="body">No issues matched the current filter</div>
        </Placeholder>
      {/if}
    {/each}
  </div>
  <div class="more">
    {#if loading}
      <Loading small={page !== 0} center />
    {/if}

    {#if showMoreButton}
      <Button variant="foreground" on:click={() => loadIssues(state)}>
        More
      </Button>
    {/if}
  </div>
</div>
