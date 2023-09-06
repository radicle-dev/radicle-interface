<script lang="ts">
  import type { BaseUrl, Issue, IssueState, Project } from "@httpd-client";

  import * as utils from "@app/lib/utils";
  import capitalize from "lodash/capitalize";
  import { HttpdClient } from "@httpd-client";
  import { httpdStore } from "@app/lib/httpd";
  import { ISSUES_PER_PAGE } from "./router";

  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import IssueTeaser from "@app/views/projects/Issue/IssueTeaser.svelte";
  import Layout from "./Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import Button from "@app/components/Button.svelte";

  export let baseUrl: BaseUrl;
  export let issues: Issue[];
  export let project: Project;
  export let state: IssueState["status"];

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
      const response = await api.project.getAllIssues(project.id, {
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
    title: `${project.issues[s]} ${s}`,
    disabled: project.issues[s] === 0,
  }));

  $: showMoreButton =
    !loading && !error && allIssues.length < project.issues[state];
</script>

<style>
  .issues {
    font-size: var(--font-size-small);
  }
  .issues-list {
    border-radius: var(--border-radius-small);
    overflow: hidden;
    border: 1px solid var(--color-border-hint);
  }
  .teaser:not(:last-child) {
    border-bottom: 1px solid var(--color-border-hint);
  }
  .more {
    margin-top: 2rem;
    min-height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tab-bar {
    display: flex;
    margin-top: 1rem;
    flex-wrap: wrap;
    background-color: var(--color-background-float);
    box-shadow: inset 0 0 0 1px var(--color-border-hint);
    border-radius: 2px;
    width: fit-content;
    overflow: hidden;
  }
  @media (max-width: 720px) {
    .issues-list {
      border-radius: 0;
    }
  }
</style>

<Layout {baseUrl} {project} activeTab="issues">
  <svelte:fragment slot="subheader">
    <div class="tab-bar">
      {#each options as option}
        {#if !option.disabled}
          <Link
            route={{
              resource: "project.issues",
              project: project.id,
              node: baseUrl,
              state: option.value,
            }}>
            <Button
              styleBorderRadius={option.value === state ? "0" : undefined}
              variant={option.value === state ? "tab" : "none"}
              disabled={option.disabled}>
              {option.title}
            </Button>
          </Link>
        {:else}
          <Button
            styleBorderRadius={option.value === state ? "0" : undefined}
            variant={option.value === state ? "tab" : "none"}
            disabled={option.disabled}>
            {option.title}
          </Button>
        {/if}
      {/each}
    </div>
    {#if $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)}
      <div style="margin-left: auto;">
        <Link
          route={{
            resource: "project.newIssue",
            project: project.id,
            node: baseUrl,
          }}>
          <Button>New issue</Button>
        </Link>
      </div>
    {/if}
  </svelte:fragment>

  <div class="issues">
    {#if allIssues.length > 0}
      <div class="issues-list">
        {#each allIssues as issue (issue.id)}
          <div class="teaser">
            <IssueTeaser projectId={project.id} {baseUrl} {issue} />
          </div>
        {/each}
      </div>
    {:else if error}
      <ErrorMessage message="Couldn't load issues." stackTrace={error} />
    {:else if loading}
      <!-- We already show a loader below. -->
    {:else}
      <Placeholder emoji="🍂">
        <div slot="title">{capitalize(state)} issues</div>
        <div slot="body">No issues matched the current filter</div>
      </Placeholder>
    {/if}
    <div class="more">
      {#if loading}
        <Loading noDelay small={page !== 0} center />
      {/if}

      {#if showMoreButton}
        <Button
          size="large"
          variant="outline"
          on:click={() => loadIssues(state)}>
          More
        </Button>
      {/if}
    </div>
  </div>
</Layout>
