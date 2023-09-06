<script lang="ts">
  import type { BaseUrl, Issue, IssueState, Project } from "@httpd-client";

  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { ISSUES_PER_PAGE } from "./router";
  import { closeFocused } from "@app/components/ModalToggle.svelte";
  import { httpdStore } from "@app/lib/httpd";

  import Button from "@app/components/Button.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import IssueTeaser from "@app/views/projects/Issue/IssueTeaser.svelte";
  import Layout from "./Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import List from "@app/components/List.svelte";
  import Loading from "@app/components/Loading.svelte";
  import ModalToggle from "@app/components/ModalToggle.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";

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

  let expanded: boolean = false;
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

  const stateOptions: IssueState["status"][] = ["open", "closed"];
  const stateColor: Record<IssueState["status"], string> = {
    open: "var(--color-fill-success)",
    closed: "var(--color-foreground-red)",
  };

  $: showMoreButton =
    !loading && !error && allIssues.length < project.issues[state];
</script>

<style>
  .issues {
    font-size: var(--font-size-small);
  }
  .selected-icon {
    padding: 0.25rem;
    border-radius: var(--border-radius-tiny);
    background-color: var(--color-background-float);
  }
  .more {
    margin-top: 2rem;
    min-height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

<Layout {baseUrl} {project} activeTab="issues">
  <div class="issues">
    <List items={allIssues}>
      <div slot="header" style="display: flex;">
        <ModalToggle bind:expanded>
          <Button slot="toggle" title="Filter issues by state">
            <div style:color={stateColor[state]}>
              <IconSmall name="issue" />
            </div>
            {project.issues[state]}
            {state}
            <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
          </Button>

          <DropdownList slot="modal" items={stateOptions}>
            <Link
              disabled={project.issues[item] === 0}
              on:afterNavigate={() => closeFocused()}
              slot="item"
              let:item
              route={{
                resource: "project.issues",
                project: project.id,
                node: baseUrl,
                state: item,
              }}>
              <DropdownListItem
                selected={item === state}
                disabled={project.issues[item] === 0}>
                <div class="selected-icon" style:color={stateColor[item]}>
                  <IconSmall name="issue" />
                </div>
                {project.issues[item]}
                {item}
              </DropdownListItem>
            </Link>
          </DropdownList>
        </ModalToggle>
        {#if $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)}
          <div style="display: flex;margin-left: auto;">
            <Link
              route={{
                resource: "project.newIssue",
                project: project.id,
                node: baseUrl,
              }}>
              <Button variant="secondary">New issue</Button>
            </Link>
          </div>
        {/if}
      </div>

      <svelte:fragment slot="item" let:item>
        <IssueTeaser {baseUrl} projectId={project.id} issue={item} />
      </svelte:fragment>

      <svelte:fragment slot="body">
        {#if error}
          <ErrorMessage message="Couldn't load issues." stackTrace={error} />
        {/if}

        {#if project.issues[state] === 0}
          <Placeholder emoji="🍂">
            <div slot="title">No {state} issues.</div>
          </Placeholder>
        {/if}
      </svelte:fragment>
    </List>

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
